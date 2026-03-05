  // 1. Connect to your actual Node.js API
  const API_BASE_URL = "http://localhost:5000/api/v1";
  const PROJECTS_URL = `${API_BASE_URL}/projects`;

  /* Pages only super_admin can access */
  const ADMIN_ONLY_PAGES = ["admin-settings.html"];

  /* All pages requiring a login session */
  const PROTECTED_PAGES = [
    "dashboard.html",
    "projects.html",
    "invoices.html",
    "tickets.html",
    "documents.html",
    "messages.html",
    "settings.html",
    "admin-settings.html",
  ];

  /* ── SESSION HELPERS (Using Real JWT) ───────────────────── */
  function getSession() {
    try {
      // Grabs the real user object we save during login
      return JSON.parse(localStorage.getItem("tn_user") || "null");
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    // Wipes the real tokens to log you out completely
    localStorage.removeItem("tn_token");
    localStorage.removeItem("tn_user");
    sessionStorage.removeItem("tn_session"); // Keep to clear any old demo data
  }

  /* ── THE REAL LOGIN HANDLER ──────────────────────────────── */
  async function submitRealLogin(e) {
    e.preventDefault(); // Stops the HTML page from refreshing

    const emailInput = document.getElementById("login-email").value.trim();
    const pwInput = document.getElementById("login-pw").value;
    const btn = document.getElementById("login-btn");

    // UI Feedback
    btn.textContent = "Authenticating...";
    btn.disabled = true;
    hideAlert(); // Hide old errors

    try {
      // Send request to your actual MySQL/Node backend
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: pwInput }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Backend Response:", data);

        const realUser = data.user || data.data;

        if (!realUser || !realUser.id) {
          showAlert("Login succeeded, but user data format is missing.");
          btn.textContent = "Sign In →";
          btn.disabled = false;
          return;
        }

        //  Save the real token
        localStorage.setItem("tn_token", data.token);

        // Format the user object so your sidebar UI works perfectly
        const userSession = {
          id: realUser.id,
          role: realUser.role === "Super Admin" ? "super_admin" : "client",
          name: realUser.name || "Admin",
          email: realUser.email,
          initials: realUser.name
            ? realUser.name.substring(0, 2).toUpperCase()
            : "AD",
          company:
            realUser.role === "Super Admin" ? "TechNova Ltd" : "Client Company",
        };

        localStorage.setItem("tn_user", JSON.stringify(userSession));

        // Redirect to the correct dashboard based on role
        window.location.href =
          userSession.role === "super_admin"
            ? "admin-settings.html"
            : "dashboard.html";
      } else {
        //  Login failed (Wrong password or email)
        showAlert(data.message || "Invalid credentials");
        btn.textContent = "Sign In →";
        btn.disabled = false;
      }
    } catch (error) {
      console.error("Login Error:", error);
      showAlert("Cannot connect to the backend server. Is it running?");
      btn.textContent = "Sign In →";
      btn.disabled = false;
    }
  }

  /* ── SESSION TIMEOUT – 30-min inactivity ─────── */
  let _idleTimer = null;
  function resetIdleTimer() {
    clearTimeout(_idleTimer);
    _idleTimer = setTimeout(
      () => {
        clearSession();
        showToast(
          "Session expired due to inactivity. Redirecting to login…",
          "info",
          3500,
        );
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2600);
      },
      30 * 60 * 1000,
    );
  }
  function initIdleTracking() {
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) =>
      document.addEventListener(ev, resetIdleTimer, { passive: true }),
    );
    resetIdleTimer();
  }

  /* ── ALERT UI HELPER ── */
  function showAlert(msg) {
    const errEl = document.getElementById("login-error");
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = "block";
    } else {
      showToast(msg, "error");
    }
  }
  function hideAlert() {
    const errEl = document.getElementById("login-error");
    if (errEl) errEl.style.display = "none";
  }

  /* ── ROUTE GUARD ─────────────────────────────────────────── */
  function enforceAuth() {
    const page = location.pathname.split("/").pop() || "";
    const session = getSession();

    if (PROTECTED_PAGES.includes(page)) {
      if (!session) {
        window.location.href = "login.html";
        return;
      }
      if (ADMIN_ONLY_PAGES.includes(page) && session.role !== "super_admin") {
        window.location.href = "dashboard.html";
        return;
      }
      initIdleTracking();
      hydrateSidebar(session);
      hideAdminLinksForClients(session);
    }

    /* Already logged in — skip login page */
    if (page === "login.html" && session) {
      window.location.href =
        session.role === "super_admin" ? "admin-settings.html" : "dashboard.html";
    }
  }

  function hydrateSidebar(session) {
    document
      .querySelectorAll(".sb-avatar, .ph-user-avatar")
      .forEach((el) => (el.textContent = session.initials));
    document
      .querySelectorAll(".sb-client-name")
      .forEach((el) => (el.textContent = session.name));
    document
      .querySelectorAll(".sb-client-role")
      .forEach((el) => (el.textContent = session.company));
    document.querySelectorAll(".ph-user-name").forEach((el) => {
      const parts = session.name.split(" ");
      el.textContent = parts[0] + " " + (parts[1]?.[0] || "") + ".";
    });
  }

  function hideAdminLinksForClients(session) {
    if (session.role !== "super_admin") {
      document.querySelectorAll("[data-admin-only]").forEach((el) => el.remove());
    }
  }

  /* ── LOGIN HANDLER ───────────────────────────────────────── */
  async function handleLogin(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Save the real token and user data
        localStorage.setItem("tn_token", data.token);
        localStorage.setItem("tn_user", JSON.stringify(data.user));

        // Redirect to dashboard
        window.location.href = "dashboard.html";
      } else {
        //  Login failed (wrong password, etc.)
        showToast(data.message || "Login failed", "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      showToast("Server is currently offline.", "error");
    }
  }
  /* ── SIGN OUT ─────────────────────────────────────────────── */
  function signOut() {
    clearSession();
    window.location.href = "login.html";
  }

  /* ── LOGIN PAGE HELPERS ─────────────────────────────────── */
  function fillCreds(email, pw) {
    const em = document.getElementById("login-email");
    const pwEl = document.getElementById("login-pw");
    if (em) em.value = email;
    if (pwEl) pwEl.value = pw;
    switchTab("login", document.querySelector(".auth-tab"));
  }

  function togglePw() {
    const inp = document.getElementById("login-pw");
    const btn = document.querySelector(".pw-toggle");
    if (!inp || !btn) return;
    inp.type = inp.type === "password" ? "text" : "password";
    btn.textContent = inp.type === "password" ? "👁" : "🙈";
  }

  function switchTab(tab, btn) {
    document
      .querySelectorAll(".auth-tab")
      .forEach((t) => t.classList.remove("active"));
    if (btn) btn.classList.add("active");
    const loginEl = document.getElementById("tab-login");
    const regEl = document.getElementById("tab-register");
    if (loginEl) loginEl.style.display = tab === "login" ? "block" : "none";
    if (regEl) regEl.style.display = tab === "register" ? "block" : "none";
  }

  function showAlert(msg) {
    const errEl = document.getElementById("login-error");
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = "flex";
    } else {
      showToast(msg, "error");
    }
  }
  function hideAlert() {
    const errEl = document.getElementById("login-error");
    if (errEl) errEl.style.display = "none";
  }

  function emailNotif(name, email, role) {
    const notif = document.getElementById("email-notif");
    const body = document.getElementById("email-notif-body");
    const dest =
      role === "super_admin" ? "Admin Dashboard" : "Client Portal Dashboard";
    if (notif && body) {
      body.textContent = `Login confirmed for ${name} (${email}). Notification sent. Redirecting to ${dest}…`;
      notif.classList.add("show");
      setTimeout(() => notif.classList.remove("show"), 5000);
    }
  }

  // lockout helpers reused by portal.js handleLogin
  function startLockoutUI(remainingMs) {
    const banner = document.getElementById("lockout-banner");
    if (banner) banner.classList.add("show");
    const form = document.getElementById("login-form");
    if (form) {
      form.style.opacity = "0.35";
      form.style.pointerEvents = "none";
    }
    const btn = document.getElementById("login-btn");
    if (btn) btn.disabled = true;
    hideAlert();

    let secs = Math.ceil(remainingMs / 1000);
    setTimer(secs);
    const tId = setInterval(() => {
      secs--;
      setTimer(secs);
      if (secs <= 0) {
        clearInterval(tId);
        resetLockout();
      }
    }, 1000);
  }

  function setTimer(s) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const r = (s % 60).toString().padStart(2, "0");
    const el = document.getElementById("lockout-timer");
    if (el) el.textContent = `${m}:${r}`;
  }

  function resetLockout() {
    setAttempts({ count: 0, lockedUntil: 0 });
    const banner = document.getElementById("lockout-banner");
    if (banner) banner.classList.remove("show");
    const form = document.getElementById("login-form");
    if (form) {
      form.style.opacity = "1";
      form.style.pointerEvents = "auto";
    }
    const btn = document.getElementById("login-btn");
    if (btn) btn.disabled = false;
  }

  function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = "Submitting…";
      btn.disabled = true;
    }
    setTimeout(() => {
      showToast(
        "Access request submitted. Credentials will be issued within 1 business day. Confirmation email sent.",
        "success",
        6000,
      );
      if (btn) {
        btn.textContent = "✓ Request Sent";
        btn.style.background = "var(--green)";
        btn.style.color = "var(--navy)";
      }
    }, 1200);
  }

  function forgotPassword() {
    showToast(
      "Password reset link sent to your registered email address.",
      "info",
      5000,
    );
  }

  /* ── EMAIL NOTIFICATION SIMULATOR ───────────────────────── */
  const _emailLog = [];

  function simulateEmail({ to, subject, body }) {
    _emailLog.unshift({
      to,
      subject,
      body,
      sentAt: new Date().toLocaleString("en-GB"),
    });
    showToast(
      `📧 Email sent → ${to}<br><small style="opacity:.75">${subject}</small>`,
      "info",
      5000,
    );
    updateNotifBadge();
    renderEmailLog();
  }

  function updateNotifBadge() {
    const badge = document.getElementById("notif-count");
    if (badge) {
      badge.textContent = _emailLog.length;
      badge.style.display = "flex";
    }
  }

  function renderEmailLog() {
    const list = document.getElementById("notif-list");
    if (!list) return;
    list.innerHTML =
      _emailLog.length === 0
        ? '<p style="color:var(--gray);font-size:.84rem;padding:1rem 1.2rem">No notifications yet.</p>'
        : _emailLog
            .map(
              (e, i) => `
          <div class="notif-item" style="padding:.9rem 1.2rem;border-bottom:1px solid rgba(26,52,96,.4);${i === 0 ? "background:rgba(0,212,255,.04)" : ""}">
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span style="font-size:1.1rem;flex-shrink:0">📧</span>
              <div>
                <div style="font-size:.85rem;font-weight:600;color:var(--white)">${e.subject}</div>
                <div style="font-size:.74rem;color:var(--cyan);margin-top:2px">To: ${e.to}</div>
                <div style="font-size:.72rem;color:var(--gray);margin-top:2px">${e.sentAt}</div>
              </div>
            </div>
          </div>`,
            )
            .join("");
  }

  function toggleNotifPanel() {
    const panel = document.getElementById("notif-panel");
    if (!panel) return;
    const open = panel.classList.toggle("open");
    if (open) {
      renderEmailLog();
      updateNotifBadge();
    }
  }

  /* ── SIDEBAR MOBILE TOGGLE ──────────────────────────────── */
  function toggleSidebar() {
    const sb = document.querySelector(".sidebar");
    const ov = document.querySelector(".sidebar-overlay");
    if (!sb) return;
    sb.classList.toggle("open");
    if (ov) ov.classList.toggle("open");
    document.body.style.overflow = sb.classList.contains("open") ? "hidden" : "";
  }
  function closeSidebar() {
    document.querySelector(".sidebar")?.classList.remove("open");
    document.querySelector(".sidebar-overlay")?.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ── ACTIVE SIDEBAR LINK ─────────────────────────────────── */
  function setActiveLink() {
    const page = location.pathname.split("/").pop() || "";
    document.querySelectorAll(".sb-link").forEach((a) => {
      a.classList.remove("active");
      if (a.getAttribute("href") === page) a.classList.add("active");
    });
  }

  /* ── TABS ────────────────────────────────────────────────── */
  function initTabs() {
    document.querySelectorAll(".tabs").forEach((tabs) => {
      tabs.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.dataset.tab;
          const parent = btn.closest("[data-tabs-parent]") || document;
          tabs
            .querySelectorAll(".tab-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          parent
            .querySelectorAll(".tab-pane")
            .forEach((p) => p.classList.toggle("active", p.id === target));
        });
      });
      const first = tabs.querySelector(".tab-btn");
      if (first && !tabs.querySelector(".tab-btn.active")) first.click();
    });
  }

  /* ── MODALS ──────────────────────────────────────────────── */
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
      m.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) {
      m.classList.remove("open");
      document.body.style.overflow = "";
    }
  }
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      e.target.classList.remove("open");
      document.body.style.overflow = "";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape")
      document.querySelectorAll(".modal-overlay.open").forEach((m) => {
        m.classList.remove("open");
        document.body.style.overflow = "";
      });
  });

  /* ── TOAST ───────────────────────────────────────────────── */
  function showToast(msg, type = "success", duration = 3500) {
    const icons = { success: "✅", info: "💡", error: "❌" };
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type] || "💡"}</span><span class="toast-msg">${msg}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => t.classList.add("show")),
    );
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 400);
    }, duration);
  }

  /* ── DROPZONE ────────────────────────────────────────────── */
  function initDropzones() {
    document.querySelectorAll(".dropzone").forEach((dz) => {
      const input = dz.querySelector('input[type="file"]');
      dz.addEventListener("click", () => {
        if (input) input.click();
      });
      dz.addEventListener("dragover", (e) => {
        e.preventDefault();
        dz.classList.add("drag-over");
      });
      dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
      dz.addEventListener("drop", (e) => {
        e.preventDefault();
        dz.classList.remove("drag-over");
        handleFiles(e.dataTransfer.files, dz);
      });
      if (input)
        input.addEventListener("change", () => handleFiles(input.files, dz));
    });
  }
  function handleFiles(files, dz) {
    const list = dz.closest(".upload-section")?.querySelector(".file-list");
    Array.from(files).forEach((file) => {
      const size = (file.size / 1024 / 1024).toFixed(2),
        ext = file.name.split(".").pop().toUpperCase();
      const item = document.createElement("div");
      item.className = "file-item";
      item.innerHTML = `<div class="fi-icon">${getFileIcon(ext)}</div><div class="fi-info"><div class="fi-name">${file.name}</div><div class="fi-meta">${ext} · ${size} MB</div></div><div class="fi-prog"><div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div></div><button class="btn btn-ghost btn-sm btn-icon" onclick="this.closest('.file-item').remove()">✕</button>`;
      if (list) list.prepend(item);
      requestAnimationFrame(() => {
        const bar = item.querySelector(".progress-fill");
        if (bar)
          setTimeout(() => {
            bar.style.width = "100%";
          }, 50);
      });
      showToast(`"${file.name}" uploaded`, "success");
    });
  }
  function getFileIcon(ext) {
    return (
      {
        PDF: "📄",
        DOC: "📝",
        DOCX: "📝",
        XLS: "📊",
        XLSX: "📊",
        PPT: "📋",
        PPTX: "📋",
        ZIP: "📦",
        PNG: "🖼️",
        JPG: "🖼️",
        JPEG: "🖼️",
        MP4: "🎬",
        CSV: "📊",
        TXT: "📄",
      }[ext] || "📁"
    );
  }

  /* ── CHAT ────────────────────────────────────────────────── */
  function initChat() {
    const input = document.getElementById("chat-input"),
      sendBtn = document.getElementById("chat-send"),
      msgs = document.getElementById("chat-messages");
    if (!input || !msgs) return;
    function send() {
      const text = input.value.trim();
      if (!text) return;
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const session = getSession();
      const init = session?.initials || "JD";
      const row = document.createElement("div");
      row.className = "msg-row own";
      row.innerHTML = `<div class="msg-content"><div class="msg-bubble">${escHtml(text)}</div><div class="msg-time">${now}</div></div><div class="msg-avatar">${init}</div>`;
      msgs.appendChild(row);
      msgs.scrollTop = msgs.scrollHeight;
      input.value = "";
      setTimeout(
        () => {
          const replies = [
            "Thanks for your message! Our team will review this shortly.",
            "Noted! I'll escalate to the project manager.",
            "Let me check with the technical team and confirm.",
            "We're tracking this in our project board.",
          ];
          const rep = document.createElement("div");
          rep.className = "msg-row";
          rep.innerHTML = `<div class="msg-avatar">TN</div><div class="msg-content"><div class="msg-bubble">${replies[Math.floor(Math.random() * replies.length)]}</div><div class="msg-time">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></div>`;
          msgs.appendChild(rep);
          msgs.scrollTop = msgs.scrollHeight;
          const s = getSession();
          if (s)
            simulateEmail({
              to: s.email,
              subject: "TechNova Portal – New reply from your project team",
              body: `Hi ${s.name}, your TechNova team has replied to your message.`,
            });
        },
        1200 + Math.random() * 600,
      );
    }
    if (sendBtn) sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }
  function selectChat(el) {
    document
      .querySelectorAll(".chat-item")
      .forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
    const name = el.querySelector(".ci-name")?.textContent;
    const hdr = document.querySelector(".chat-win-name");
    if (hdr && name) hdr.textContent = name;
    el.querySelector(".ci-unread")?.remove();
  }

  /* ── MISC ────────────────────────────────────────────────── */
  function escHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function confirmAction(msg, cb) {
    if (window.confirm(msg)) cb();
  }
  function animateBars() {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.width = e.target.dataset.w + "%";
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".progress-fill[data-w]").forEach((b) => {
      b.style.width = "0%";
      obs.observe(b);
    });
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", () => {
    enforceAuth();
    setActiveLink();
    initTabs();
    initDropzones();
    initChat();
    animateBars();
    if (window.location.pathname.includes("projects.html")) {
          fetchAndRenderProjects();
      }
    document
      .querySelector(".sidebar-overlay")
      ?.addEventListener("click", closeSidebar);
    document.addEventListener("click", (e) => {
      const panel = document.getElementById("notif-panel");
      const btn = document.getElementById("notif-btn");
      if (
        panel?.classList.contains("open") &&
        !panel.contains(e.target) &&
        e.target !== btn &&
        !btn?.contains(e.target)
      )
        panel.classList.remove("open");
    });
  });



  /* ── PROJECT CRUD LOGIC ─────────────────────────────────── */

  async function fetchAndRenderProjects() {
      const container = document.querySelector('.project-cards');
      if (!container) return;

      try {
          const response = await fetch(PROJECTS_URL, {
              headers: { 
                  "Authorization": `Bearer ${localStorage.getItem("tn_token")}` 
              }
          });
          const data = await response.json();

          if (data.success) {
              // If DB is empty, show a nice message
              if (data.data.length === 0) {
                  container.innerHTML = `<p style="color:var(--gray); grid-column: 1/-1; text-align:center; padding:2rem;">No active projects found.</p>`;
                  return;
              }

              container.innerHTML = data.data.map(proj => renderProjectCardHTML(proj)).join('');
              animateBars(); // Re-trigger the progress bar animation
          }
      } catch (error) {
          console.error("Project Fetch Error:", error);
          showToast("Could not load projects.", "error");
      }
  }

  // Helper to keep the HTML clean (Matches your UI design)
  function renderProjectCardHTML(proj) {
      const stat = proj.Project_Status || 'New';
      let statusClass = 'inprogress';
      let barColor = 'cyan-bar';
      let progClass = 'cyan';
      let progress = 65; 

      // Handle styling based on status
      if (stat === 'Completed') {
          statusClass = 'complete';
          barColor = 'green-bar';
          progClass = 'green';
          progress = 100;
      } else if (stat === 'Delayed') {
          statusClass = 'overdue';
          barColor = 'purple-bar';
          progClass = 'yellow';
          progress = 30;
      } else if (stat === 'Active' || stat === 'In Progress') {
          statusClass = 'inprogress';
      } else {
          statusClass = 'review';
          barColor = 'purple-bar';
          progress = 15;
      }

      // Format dates safely
      const formatDt = (dateString) => {
          if (!dateString) return 'N/A';
          const d = new Date(dateString);
          return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      };

      // Package the data for the Master Details Modal
      const encodedData = encodeURIComponent(JSON.stringify({
          title: proj.Project_Name || proj.Client_Name || 'TechNova Project',
          id: proj.Project_ID,
          statusHtml: `<span class="badge ${statusClass}">${stat}</span>`,
          start: formatDt(proj.Start_Date),
          deadline: formatDt(proj.Deadline),
          val: proj.Project_Value || 0,
          tech: proj.Service_Interested || proj.Technology || 'Various',
          prog: progress,
          pclass: progClass
      }));

      return `
      <div class="proj-card">
          <div class="proj-card-top ${barColor}">
              <div class="proj-header">
                  <div class="proj-emoji" style="background:rgba(0,212,255,0.1)">
                      <i class="fa-solid fa-laptop-code" style="color:var(--cyan)"></i>
                  </div>
                  <div style="flex:1; min-width:0; padding-right:10px;">
                      <div class="proj-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                          ${proj.Project_Name || proj.Client_Name || 'Project'}
                      </div>
                      <div class="proj-client">Ref: ${proj.Project_ID}</div>
                  </div>
                  <span class="badge ${statusClass}">${stat}</span>
              </div>
              
              <p class="proj-desc">Delivering ${proj.Service_Interested || proj.Technology || 'Software Services'} for ${proj.Country || 'Client'}.</p>
              
              <div class="proj-stats-row">
                  <div class="proj-stat">
                      <div class="proj-stat-val">£${(proj.Project_Value || 0).toLocaleString()}</div>
                      <div class="proj-stat-lbl">Value</div>
                  </div>
                  <div class="proj-stat">
                      <div class="proj-stat-val">${proj.Assigned_Team_Size || 1}</div>
                      <div class="proj-stat-lbl">Team</div>
                  </div>
                  <div class="proj-stat">
                      <div class="proj-stat-val">${formatDt(proj.Deadline)}</div>
                      <div class="proj-stat-lbl">Due</div>
                  </div>
              </div>
              
              <div class="progress-meta">
                  <span>Current Progress</span>
                  <strong>${progress}%</strong>
              </div>
              <div class="progress-bar">
                  <div class="progress-fill ${progClass}" data-w="${progress}" style="width:0%"></div>
              </div>
          </div>
          
          <div class="proj-card-bottom">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                  <div class="proj-team">
                      <div class="avatar-stack">
                          <div class="av" style="background:var(--navy2)"><i class="fa-solid fa-user"></i></div>
                      </div>
                      <span class="proj-team-label">Assigned</span>
                  </div>
                  
                  <div style="display:flex;gap:0.5rem">
                      <button class="btn btn-ghost btn-sm" onclick="openClientProjectModal('${encodedData}')">
                          <i class="fa-solid fa-circle-info"></i> Details
                      </button>
                      <a href="messages.html" class="btn btn-primary btn-sm">
                          <i class="fa-solid fa-comment-dots"></i> Message
                      </a>
                  </div>
              </div>
          </div>
      </div>`;
  }

  async function deleteProject(id) {
      if (!confirm("Are you sure you want to delete this project?")) return;

      try {
          const response = await fetch(`${PROJECTS_URL}/${id}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${localStorage.getItem("tn_token")}` }
          });

          if (response.ok) {
              showToast("Project deleted successfully");
              fetchAndRenderProjects(); // Refresh the list
          }
      } catch (error) {
          showToast("Failed to delete project", "error");
      }
  }