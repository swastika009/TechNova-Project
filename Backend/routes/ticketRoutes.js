const express = require('express');
const router = express.Router();

const { 
    createTicket, 
    getAllTickets, 
    updateTicket 
} = require('../controllers/ticketController');

const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.use(protect);

router.get('/', getAllTickets);
router.post('/', createTicket);

router.put(
    '/:id', 
    authorizeRoles('Super Admin'), 
    updateTicket
);

module.exports = router;