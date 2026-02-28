/* ============================================================
   TECHNOVA LTD – SHARED JAVASCRIPT
   ============================================================ */

/* ── Active nav link ── */
(function() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mob-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === path || (path === 'index.html' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });
})();

/* ── Navbar scroll ── */
const navbar = document.getElementById('navbar');
function handleScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  const st = document.getElementById('scroll-top');
  if (st) st.classList.toggle('show', window.scrollY > 400);
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

/* ── Mobile menu ── */
function toggleMenu() {
  const menu = document.getElementById('mob-menu');
  const ham  = document.getElementById('hamburger');
  menu.classList.toggle('open');
  ham.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}
window.toggleMenu = toggleMenu;

/* ── Scroll to top ── */
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── Reveal on scroll ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── Counter animation ── */
function animCount(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = +el.dataset.target;
  const dur = 1800, step = target / (dur / 16);
  let cur = 0;
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.round(cur);
    if (cur >= target) clearInterval(t);
  }, 16);
}
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.querySelectorAll('[data-target]').forEach(animCount);
  });
}, { threshold: 0.2 });
document.querySelectorAll('.stat-num, .about-stats, .hero-stats').forEach(el => countObs.observe(el));

/* ── Particle canvas (hero) ── */
function initCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  class P {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.35; this.vy = (Math.random() - 0.5) * 0.35;
      this.r = Math.random() * 1.5 + 0.4; this.a = Math.random() * 0.45 + 0.08;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${this.a})`; ctx.fill();
    }
  }
  function init() { resize(); pts = Array.from({length: 90}, () => new P()); }
  function lines() {
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.055*(1-d/110)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
  }
  function tick() { ctx.clearRect(0,0,W,H); pts.forEach(p=>{p.update();p.draw();}); lines(); requestAnimationFrame(tick); }
  window.addEventListener('resize', resize);
  init(); tick();
}
initCanvas('hero-canvas');

/* ── Filter cards ── */
window.filterCards = function(btn, cat, containerSel, cardSel) {
  document.querySelectorAll(containerSel + ' .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll(cardSel).forEach(card => {
    const show = cat === 'all' || card.dataset.cat?.includes(cat);
    card.style.display = show ? '' : 'none';
  });
};

/* ── Form submit ── */
window.handleForm = function(e, formId, successId) {
  e.preventDefault();
  document.getElementById(formId).style.display = 'none';
  document.getElementById(successId).style.display = 'block';
};

/* ── Accordion ── */
window.toggleAccordion = function(el) {
  const item   = el.closest('.acc-item');
  const body   = item.querySelector('.acc-body');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.acc-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.acc-body').style.maxHeight = '0';
  });
  if (!isOpen) {
    item.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
  }
};

/* ── Contact Modal ── */
function openContactModal() {
  const modal = document.getElementById('contact-modal');
  if (!modal) createContactModal();
  const m = document.getElementById('contact-modal');
  if (m) m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function createContactModal() {
  const html = `
    <div class="modal-overlay" id="contact-modal">
      <div class="modal-box" style="position: relative;">
        <button class="modal-close" onclick="closeContactModal()">×</button>
        <h2 class="modal-title">Get a <span>Consultation</span></h2>
        <form class="modal-form" onsubmit="handleContactSubmit(event)">
          <div class="form-group">
            <label>Name *</label>
            <input type="text" name="name" required placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" name="email" required placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Company</label>
            <input type="text" name="company" placeholder="Your company">
          </div>
          <div class="form-group">
            <label>Service Interest *</label>
            <select name="service" required>
              <option value="">Select a service...</option>
              <option value="web">Web Development</option>
              <option value="enterprise">Enterprise Software</option>
              <option value="mobile">Mobile Apps</option>
              <option value="salesforce">Salesforce CRM</option>
              <option value="cloud">Cloud & DevOps</option>
              <option value="uiux">UI/UX Design</option>
              <option value="ecom">E-Commerce</option>
              <option value="cyber">Cybersecurity</option>
            </select>
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea name="message" placeholder="Tell us about your project..."></textarea>
          </div>
          <button type="submit" class="form-submit-btn">Send Inquiry</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('contact-modal').addEventListener('click', e => {
    if (e.target.id === 'contact-modal') closeContactModal();
  });
}

function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  console.log('Contact inquiry:', Object.fromEntries(data));
  alert('Thank you! We will contact you within 24 hours.');
  form.reset();
  closeContactModal();
}

// Replace all "Get a Consultation" links with modal trigger
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href*="contact.html"]').forEach(btn => {
    if (btn.textContent.includes('Consultation')) {
      btn.href = '#';
      btn.onclick = (e) => {
        e.preventDefault();
        openContactModal();
      };
    }
  });
});

window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;

/* ── Apply Modal ── */
function openApplyModal(jobTitle = '') {
  const modal = document.getElementById('apply-modal');
  if (!modal) createApplyModal();
  const m = document.getElementById('apply-modal');
  if (m) {
    if (jobTitle) m.querySelector('input[name="position"]').value = jobTitle;
    m.classList.add('open');
  }
  document.body.style.overflow = 'hidden';
}

function closeApplyModal() {
  const modal = document.getElementById('apply-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function createApplyModal() {
  const html = `
    <div class="apply-modal-overlay" id="apply-modal">
      <div class="apply-modal-box">
        <button class="apply-modal-close" onclick="closeApplyModal()">×</button>
        <h2 class="apply-modal-title">Join Our <span>Team</span></h2>
        <p class="apply-modal-subtitle">Tell us about yourself and the role you're interested in</p>
        <form class="apply-modal-form" onsubmit="handleApplySubmit(event)">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" name="name" required placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" name="email" required placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Mobile *</label>
            <input type="tel" name="mobile" required placeholder="+44 1234 567890">
          </div>
          <div class="form-group">
            <label>Position Interested In *</label>
            <input type="text" name="position" required placeholder="e.g. Frontend Developer">
          </div>
          <div class="form-group">
            <label>Industry / Domain *</label>
            <select name="industry" required>
              <option value="">Select an industry...</option>
              <option value="retail">Retail</option>
              <option value="fintech">FinTech</option>
              <option value="healthcare">Healthcare</option>
              <option value="logistics">Logistics</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="education">Education</option>
              <option value="energy">Energy</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Key Skills / Service Area *</label>
            <select name="service" required>
              <option value="">Select area...</option>
              <option value="web">Web Development</option>
              <option value="backend">Backend Engineering</option>
              <option value="mobile">Mobile Development</option>
              <option value="devops">DevOps / Cloud</option>
              <option value="qa">QA / Testing</option>
              <option value="security">Cybersecurity</option>
              <option value="salesforce">Salesforce / CRM</option>
              <option value="design">UI/UX Design</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cover Letter / Why Join Us</label>
            <textarea name="description" placeholder="Tell us about your experience and why you want to join TechNova..."></textarea>
          </div>
          <div class="form-group">
            <label>Upload CV *</label>
            <input type="file" name="cv" accept=".pdf,.doc,.docx" required>
          </div>
          <button type="submit" class="form-submit-btn">Submit Application</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('apply-modal').addEventListener('click', e => {
    if (e.target.id === 'apply-modal') closeApplyModal();
  });
}

function handleApplySubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const cvFile = data.get('cv');
  const appData = Object.fromEntries(data);
  appData.cv = cvFile ? `${cvFile.name} (${(cvFile.size / 1024).toFixed(2)} KB)` : 'No file';
  console.log('Job application:', appData);
  alert('Thank you for applying! We will review your application and get back to you soon.');
  form.reset();
  closeApplyModal();
}

// Hijack Apply Now buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a.job-apply').forEach(btn => {
    const jobTitle = btn.closest('.job-row')?.querySelector('.job-title')?.textContent || '';
    btn.href = '#';
    btn.onclick = (e) => {
      e.preventDefault();
      openApplyModal(jobTitle);
    };
  });
});

window.openApplyModal = openApplyModal;
window.closeApplyModal = closeApplyModal;