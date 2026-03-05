require('dotenv').config();
const xlsx = require('xlsx');
const { Op } = require('sequelize');
const { sequelize, Lead, Project } = require('./models');

const EXCEL_FILE_PATH = './Merged_dataset.xlsx';

const parseExcelDate = (val) => {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val)) return val;
    const parsedDate = new Date(val);
    if (!isNaN(parsedDate.getTime())) return parsedDate;
    if (typeof val === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + val * 86400000);
    }
    return null; 
};

const importData = async () => {
    try {
        console.log('📄 Reading Excel file...');
        
        const workbook = xlsx.readFile(EXCEL_FILE_PATH, { cellDates: true });
        const sheetName = workbook.SheetNames[0]; 
        const results = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`Parsed ${results.length} rows from Excel. Checking database...`);

        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        console.log('Cleaning up partially inserted data from the crashed run...');
        await Project.destroy({ where: { Project_ID: { [Op.like]: 'P%' } } });
        await Lead.destroy({ where: { Lead_ID: { [Op.like]: 'LD-P%' } } });
        console.log(' Cleanup complete! Database is a clean slate.');

        console.log(' Inserting data...');

        for (let [index, row] of results.entries()) {
            
            const projectId = row.Project_ID;
            const leadId = `LD-${projectId}`; 

            const rawEmail = row.Email && row.Email !== 'Not Provided' ? row.Email : null;
            const rawContact = row.Contact_Number && row.Contact_Number !== 'Not Provided' ? row.Contact_Number : null;

           
           // CREATE LEAD 
            const lead = await Lead.create({
                Lead_ID: leadId,
                Client_Name: row.Client_Name || `Unknown Client ${index}`,
                Email: rawEmail,
                Contact_Number: rawContact,
                Country: row.Country || 'Unknown', 
                Lead_Source: row.Lead_Source || 'Unknown',
                Industry: row.Industry || 'Unknown',
                Service_Interested: row.Service_Interested || 'Unknown',
                Budget: parseFloat(row.Budget) || 0,
                Currency: row.Currency || 'USD',
                Status: 'Converted' 
            });

            // CREATE PROJECT 
            await Project.create({
                Project_ID: projectId,
                Client_Name: row.Client_Name,
                Country: row.Country || 'Unknown',
                Industry: row.Industry || 'Unknown',
                Service_Interested: row.Service_Interested || null,
                Project_Value: parseFloat(row.Project_Value) || 0,
                Currency: row.Currency || 'USD',
                Start_Date: parseExcelDate(row.Start_Date),
                Deadline: parseExcelDate(row.Deadline),
                Actual_Completion_Date: parseExcelDate(row.Actual_Completion_Date),
                Project_Status: row.Project_Status || 'Completed',
                Assigned_Team_Size: parseInt(row.Assigned_Team_Size) || 1,
                Total_Hours_Logged: parseFloat(row.Total_Hours_Logged) || 0,
                Overtime_Hours: parseFloat(row.Overtime_Hours) || 0,
                Total_Hours: parseFloat(row['Total Hours']) || 0, 
                Resource_Overallocated: row.Resource_Overallocated || 'No',
                Client_Satisfaction: parseInt(row.Client_Satisfaction) || null,
                Lead_ID: leadId
            });
        }

        console.log('Excel data import completed successfully! Check your MySQL database.');
        process.exit(0);

    } catch (error) {
        console.error('Error during database insertion:', error);
        process.exit(1);
    }
};

importData();