/**
 * ISSŘ — Sdílená hlavička řízení
 * issr-case-header.js
 *
 * Použití na stránce:
 *   <div id="issr-header-root"></div>
 *   <script src="issr-case-header.js"></script>
 *   <script>
 *     renderCaseHeader({
 *       activeStep: 2,           // 1=Založení, 2=Kontrola, 3=Projednání, 4=Rozhodnutí
 *       caseNumber: 'SZ DESU/000612/26',
 *       caseTitle: 'Oprava zabezpečovacího zařízení...',
 *       caseType: 'Povolení stavby',
 *       caseCategory: 'Stavba dráhy',  // volitelné
 *       caseIcon: 'train',             // material icon, default 'gavel'
 *       zamerNumber: 'Z/2026/1596',    // volitelné — odkaz na záměr
 *       linkedZamer: 'Z/2025/0847',    // volitelné — propojený záměr
 *       badgeText: 'Kontrola',         // text stavového badge
 *       badgeType: 'draft',            // 'draft'|'active'|'fast'|'in-progress'
 *       backHref: 'detail-dokumentu.html',
 *       backTitle: 'Zpět',
 *       docButtons: [                  // tlačítka dokumentů (volitelné, default sada)
 *         { icon: 'description', label: 'Žádost', onclick: "openModal('zadostModal')" },
 *         ...
 *       ],
 *       showNedostatky: false,         // zobrazit tlačítko Nedostatky (default false)
 *       nedostatkyCount: 0,
 *       actionMenuItems: null,         // null = default položky, [] = skrýt menu
 *     });
 *   </script>
 */

(function () {

  // ─── CSS ──────────────────────────────────────────────────────────────────

  const CSS = `
    /* ISSŘ App Header */
    .issr-header {
      background-color: #004289; height: 56px; display: flex; align-items: center;
      padding: 0 24px; position: sticky; top: 0; z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,.1), 0 2px 4px rgba(0,0,0,.06);
    }
    .issr-header__logo { display:flex; align-items:center; gap:12px; text-decoration:none; color:#fff; }
    .issr-header__logo-img { height:40px; width:auto; }
    .issr-header__title { font-size:12px; font-weight:400; color:#fff; letter-spacing:.5px; white-space:nowrap; }
    .issr-header__search { flex:1; max-width:500px; margin:0 40px; }
    .issr-header__search-input { width:100%; height:32px; padding:0 16px; border:none; border-radius:4px; font-size:14px; outline:none; }
    .issr-header__search-input::placeholder { color:#adb5bd; }
    .issr-header__actions { display:flex; align-items:center; gap:20px; margin-left:auto; }
    .issr-header__notification { position:relative; color:#fff; cursor:pointer; }
    .issr-header__notification-icon { width:20px; height:20px; }
    .issr-header__notification-badge { position:absolute; top:-6px; right:-8px; background:#0066cc; color:#fff;
      font-size:10px; font-weight:600; min-width:16px; height:16px; border-radius:50%;
      display:flex; align-items:center; justify-content:center; padding:0 4px; }
    .issr-header__user { display:flex; align-items:center; gap:8px; color:#fff; font-size:12px; font-weight:600; cursor:pointer; }
    .issr-header__user-icon { width:16px; height:16px; }
    @media(max-width:992px){.issr-header__search{max-width:300px;margin:0 20px;}.issr-header__title{display:none;}}
    @media(max-width:768px){.issr-header{padding:0 16px;}.issr-header__search{display:none;}}

    /* Case Header */
    .case-header { background:#fff; position:sticky; top:56px; z-index:100; box-shadow:0 2px 8px rgba(0,0,0,.1); }
    .case-header-main { padding:16px 32px; display:flex; align-items:center; justify-content:space-between; gap:24px; border-bottom:1px solid #f0f0f0; }
    .case-header-left { display:flex; align-items:center; gap:16px; }
    .case-header-actions { display:flex; align-items:center; gap:8px; }

    .btn-back { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px;
      border:1px solid #dadce0; border-radius:8px; background:#fff; color:#5f6368; cursor:pointer;
      transition:all .15s; text-decoration:none; }
    .btn-back:hover { background:#f1f3f4; border-color:#5f6368; }

    .case-info { flex:1; }
    .case-number { font-size:12px !important; color:#5f6368 !important; font-family:'Roboto Mono',monospace !important; margin-bottom:2px !important; }
    .case-title { font-size:18px !important; font-weight:500 !important; color:#202124 !important; font-style:normal !important; }
    .case-meta { display:flex !important; align-items:center !important; gap:16px !important; margin-top:4px !important; flex-wrap:wrap !important; }
    .case-meta-item { display:inline-flex !important; align-items:center !important; gap:4px !important; font-size:12px !important; color:#5f6368 !important; }
    .case-meta-item .material-icons-outlined { font-size:16px; }
    .case-meta-link { text-decoration:none; color:#1a73e8 !important; cursor:pointer; padding:4px 8px; margin:-4px -8px; border-radius:4px; transition:background .15s; display:inline-flex; align-items:center; gap:4px; }
    .case-meta-link:hover { background:#e8f0fe; }
    .case-meta-link .material-icons-outlined { font-size:16px; color:#1a73e8; }
    .case-meta-linked-separator { color:#9aa0a6; font-size:16px; line-height:1; margin:0 -4px; }
    .case-meta-linked-tag { display:inline-flex; align-items:center; gap:4px; padding:2px 8px 2px 6px;
      background:#e6f4ea; border:1px solid #a8d5b5; border-radius:12px; color:#137333 !important;
      font-size:12px !important; font-weight:500; text-decoration:none; cursor:pointer; transition:background .15s; }
    .case-meta-linked-tag:hover { background:#ceead6; }
    .case-meta-linked-tag .material-icons-outlined { font-size:13px !important; color:#137333 !important; }

    .case-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:500; }
    .case-badge.draft { background:#fef7e0; color:#b06000; }
    .case-badge.active { background:#e6f4ea; color:#137333; }
    .case-badge.fast { background:#e8f1fa; color:#004289; }
    .case-badge.in-progress { background:#e8f1fa; color:#004289; }

    /* Action buttons */
    .header-action-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px;
      background:#fff; border:1px solid #dadce0; border-radius:6px; font-size:13px; font-weight:500;
      color:#202124; cursor:pointer; transition:all .15s; text-decoration:none; white-space:nowrap; }
    .header-action-btn:hover { background:#f1f3f4; border-color:#5f6368; }
    .header-action-btn .material-icons-outlined { font-size:18px; color:#5f6368; }
    .header-action-btn.has-issues { border-color:#f9ab00; background:#fef7e0; }
    .header-action-btn.has-issues:hover { background:#feefc3; border-color:#f29900; }
    .header-action-btn.has-issues .material-icons-outlined { color:#b06000; }
    .header-action-badge { display:inline-flex; align-items:center; justify-content:center;
      min-width:18px; height:18px; padding:0 5px; background:#ea4335; color:#fff;
      border-radius:9px; font-size:11px; font-weight:500; }
    .header-action-badge.warning { background:#f9ab00; color:#202124; }

    .action-dropdown { position:relative; }
    .action-dropdown-menu { position:absolute; top:100%; right:0; margin-top:4px; min-width:220px;
      background:#fff; border:1px solid #dadce0; border-radius:8px;
      box-shadow:0 4px 12px rgba(0,0,0,.15); z-index:1000; display:none; }
    .action-dropdown-menu.open { display:block; }
    .action-dropdown-item { display:flex; align-items:center; gap:10px; padding:10px 14px;
      font-size:13px; color:#202124; cursor:pointer; transition:background .1s; }
    .action-dropdown-item:first-child { border-radius:8px 8px 0 0; }
    .action-dropdown-item:last-child { border-radius:0 0 8px 8px; }
    .action-dropdown-item:hover { background:#f1f3f4; }
    .action-dropdown-item .material-icons-outlined { font-size:18px; color:#5f6368; }
    .action-dropdown-item.danger { color:#c5221f; }
    .action-dropdown-item.danger .material-icons-outlined { color:#c5221f; }
    .action-dropdown-divider { height:1px; background:#e8eaed; margin:4px 0; }

    /* Workflow bar */
    .workflow-bar { display:flex !important; align-items:center !important; justify-content:space-between !important;
      padding:10px 32px !important; background:#f8f9fa !important; border-bottom:1px solid #e0e0e0 !important; flex-wrap:nowrap !important; }
    .document-access-buttons { display:flex !important; gap:8px !important; flex-wrap:nowrap !important; }
    .doc-access-btn { display:inline-flex !important; align-items:center !important; gap:6px !important;
      padding:6px 12px !important; background:#fff !important; border:1px solid #dadce0 !important;
      border-radius:6px !important; font-size:12px !important; font-weight:400 !important; color:#202124 !important;
      cursor:pointer !important; text-decoration:none !important; white-space:nowrap !important; transition:all .15s !important; }
    .doc-access-btn:hover { background:#e8f4fd !important; border-color:#004289 !important; color:#004289 !important; }
    .doc-access-btn .material-icons-outlined { font-size:16px !important; color:#5f6368 !important; }
    .doc-access-btn:hover .material-icons-outlined { color:#004289 !important; }
    .doc-access-btn .badge { background:#e8f4fd !important; color:#004289 !important; padding:2px 6px !important;
      border-radius:10px !important; font-size:10px !important; font-weight:500 !important; }

    /* Workflow stepper */
    .workflow-stepper { display:flex; align-items:center; gap:6px; flex-wrap:nowrap; }
    .wf-step { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px;
      font-size:12px; white-space:nowrap; transition:all .15s; }
    .wf-step-num { width:20px; height:20px; min-width:20px; border-radius:50%; display:inline-flex;
      align-items:center; justify-content:center; font-size:11px; font-weight:600; }
    .wf-step.pending { background:#fff; border:1.5px solid #e0e0e0; color:#9aa0a6; font-weight:400; }
    .wf-step.pending .wf-step-num { background:#f1f3f4; color:#9aa0a6; }
    .wf-step.completed { background:#e6f4ea; border:1.5px solid #a8d5b5; color:#137333; font-weight:500; }
    .wf-step.completed .wf-step-num { background:#137333; color:#fff; }
    .wf-step.active { background:#004289; border:1.5px solid #004289; color:#fff; font-weight:500; }
    .wf-step.active .wf-step-num { background:rgba(255,255,255,.2); color:#fff; }
    .wf-connector { width:28px; height:2px; flex-shrink:0; background:#dadce0; }
    .wf-connector.completed { background:#a8d5b5; }

    /* Slideout panel */
    .slideout-panel { position:fixed; top:0; right:-500px; width:500px; height:100vh;
      background:#fff; box-shadow:-4px 0 20px rgba(0,0,0,.15); z-index:2000;
      display:flex; flex-direction:column; transition:right .3s ease; }
    .slideout-panel.open { right:0; }
    .slideout-overlay { position:fixed; top:0; left:0; right:0; bottom:0;
      background:rgba(0,0,0,.3); z-index:1999; opacity:0; visibility:hidden; transition:all .3s ease; }
    .slideout-overlay.open { opacity:1; visibility:visible; }
    .slideout-header { display:flex; align-items:center; justify-content:space-between;
      padding:16px 20px; border-bottom:1px solid #e8eaed; background:#f8f9fa; }
    .slideout-title { display:flex; align-items:center; gap:10px; font-size:16px; font-weight:500; color:#202124; }
    .slideout-title .material-icons-outlined { font-size:22px; color:#5f6368; }
    .slideout-close { width:36px; height:36px; border:none; background:transparent; border-radius:50%;
      cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5f6368; transition:background .15s; }
    .slideout-close:hover { background:#e8eaed; }
    .slideout-body { flex:1; overflow-y:auto; padding:20px; }
    .slideout-footer { padding:16px 20px; border-top:1px solid #e8eaed; display:flex; justify-content:flex-end; gap:10px; }
  `;

  // ─── Stepper helper ───────────────────────────────────────────────────────

  const STEPS = [
    { num: 1, label: 'Založení řízení' },
    { num: 2, label: 'Kontrola a zahájení' },
    { num: 3, label: 'Projednání' },
    { num: 4, label: 'Rozhodnutí' },
  ];

  function buildStepper(activeStep) {
    return STEPS.map((s, i) => {
      const state = s.num < activeStep ? 'completed' : s.num === activeStep ? 'active' : 'pending';
      const connState = s.num < activeStep ? 'completed' : '';
      const icon = state === 'completed'
        ? `<span class="material-icons-outlined" style="font-size:13px;">check</span>`
        : s.num;
      const connector = i < STEPS.length - 1
        ? `<div class="wf-connector ${connState}"></div>`
        : '';
      return `
        <div class="wf-step ${state}">
          <span class="wf-step-num">${icon}</span>
          ${s.label}
        </div>${connector}`;
    }).join('');
  }

  // ─── Doc buttons helper ───────────────────────────────────────────────────

  const DEFAULT_DOC_BUTTONS = [
    { icon: 'description', label: 'Žádost', onclick: "openDocModal && openDocModal('zadostModal')" },
    { icon: 'attach_file', label: 'Přílohy', badge: '12', onclick: "openDocModal && openDocModal('prilohyModal')" },
    { icon: 'folder', label: 'El. dokumentace', onclick: "openDocModal && openDocModal('eedModal')" },
    { icon: 'fact_check', label: 'Dokladová část', onclick: "openDocModal && openDocModal('dokladyModal')" },
  ];

  function buildDocButtons(buttons) {
    return (buttons || DEFAULT_DOC_BUTTONS).map(b => `
      <a href="#" class="doc-access-btn" onclick="${b.onclick}; return false;">
        <span class="material-icons-outlined">${b.icon}</span>
        ${b.label}
        ${b.badge ? `<span class="badge">${b.badge}</span>` : ''}
      </a>`).join('');
  }

  // ─── Action menu helper ───────────────────────────────────────────────────

  const DEFAULT_ACTION_ITEMS = [
    { icon: 'pause_circle', label: 'Přerušit řízení', action: 'prerusit' },
    { icon: 'send', label: 'Postoupit řízení', action: 'postoupit' },
    { icon: 'person_add', label: 'Předat jinému referentovi', action: 'predat' },
    { icon: 'merge', label: 'Spojit s jiným řízením', action: 'spojit' },
    null, // divider
    { icon: 'history', label: 'Historie řízení', action: 'historie' },
    null,
    { icon: 'cancel', label: 'Zastavit řízení (zpětvzetí)', action: 'zastavit', danger: true },
  ];

  function buildActionMenu(items) {
    return (items || DEFAULT_ACTION_ITEMS).map(item => {
      if (!item) return `<div class="action-dropdown-divider"></div>`;
      return `<div class="action-dropdown-item${item.danger ? ' danger' : ''}" onclick="issrCaseHeader.onAction('${item.action}')">
        <span class="material-icons-outlined">${item.icon}</span>
        ${item.label}
      </div>`;
    }).join('');
  }

  // ─── Main render ─────────────────────────────────────────────────────────

  function renderCaseHeader(cfg) {
    cfg = cfg || {};

    // Inject CSS once
    if (!document.getElementById('issr-case-header-css')) {
      const style = document.createElement('style');
      style.id = 'issr-case-header-css';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    const activeStep = cfg.activeStep || 1;
    const badgeType = cfg.badgeType || 'draft';
    const badgeText = cfg.badgeText || '';
    const showNedostatky = cfg.showNedostatky !== false && cfg.showNedostatky;
    const actionMenuItems = cfg.actionMenuItems !== undefined ? cfg.actionMenuItems : DEFAULT_ACTION_ITEMS;

    // Linked záměr tag
    const linkedTag = cfg.linkedZamer ? `
      <span class="case-meta-linked-separator">·</span>
      <a href="#" class="case-meta-linked-tag" onclick="event.preventDefault()">
        <span class="material-icons-outlined">link</span>
        ${cfg.linkedZamer}
      </a>` : '';

    // Badge
    const badge = badgeText ? `
      <span class="case-badge ${badgeType}">
        ${badgeType === 'in-progress' ? '<span class="material-icons-outlined" style="font-size:14px;">hourglass_top</span>' : ''}
        ${badgeText}
      </span>` : '';

    // Nedostatky button
    const nedostatkyBtn = showNedostatky ? `
      <button class="header-action-btn has-issues" onclick="issrCaseHeader.onNedostatky()" id="issr-btn-nedostatky" title="Přehled nedostatků">
        <span class="material-icons-outlined">warning_amber</span>
        Nedostatky
        <span class="header-action-badge warning" id="issr-nedostatky-badge">${cfg.nedostatkyCount || 0}</span>
      </button>` : '';

    // Action menu
    const menuHtml = actionMenuItems && actionMenuItems.length ? `
      <div class="action-dropdown">
        <button class="header-action-btn" onclick="issrCaseHeader._toggleDropdown()" id="issr-akce-btn">
          <span class="material-icons-outlined">more_vert</span>
          Akce řízení
          <span class="material-icons-outlined" style="font-size:16px;margin-left:-2px;">expand_more</span>
        </button>
        <div class="action-dropdown-menu" id="issr-akce-menu">
          ${buildActionMenu(actionMenuItems)}
        </div>
      </div>` : '';

    const html = `
      <!-- ISSŘ App Header -->
      <header class="issr-header">
        <a href="${cfg.homeHref || '../index.html'}" class="issr-header__logo">
          <img src="${cfg.logoSrc || '../images/logo-issr.png'}" alt="ISSŘ Logo" class="issr-header__logo-img">
          <span class="issr-header__title">INFORMAČNÍ SYSTÉM STAVEBNÍHO ŘÍZENÍ</span>
        </a>
        <div class="issr-header__search">
          <input type="text" class="issr-header__search-input" placeholder="Hledat">
        </div>
        <div class="issr-header__actions">
          <div class="issr-header__notification">
            <svg class="issr-header__notification-icon" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
            </svg>
            <span class="issr-header__notification-badge">2</span>
          </div>
          <div class="issr-header__user">
            <span>${cfg.userName || 'Aleš Krupa'}</span>
            <svg class="issr-header__user-icon" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
            </svg>
          </div>
        </div>
      </header>

      <!-- Case Header -->
      <header class="case-header" id="issr-case-header">
        <div class="case-header-main">
          <div class="case-header-left">
            <a href="${cfg.backHref || '#'}" class="btn-back" title="${cfg.backTitle || 'Zpět'}">
              <span class="material-icons-outlined">arrow_back</span>
            </a>
            <div class="case-info">
              <div class="case-number">${cfg.caseNumber || ''}</div>
              <h1 class="case-title">${cfg.caseTitle || ''}</h1>
              <div class="case-meta">
                ${cfg.zamerNumber ? `
                <a href="${cfg.zamerHref || '#'}" class="case-meta-item case-meta-link" title="Otevřít detail záměru">
                  <span class="material-icons-outlined">inventory_2</span>
                  Záměr ${cfg.zamerNumber}
                </a>
                <span class="case-meta-linked-separator">·</span>` : ''}
                ${linkedTag}
                <span class="case-meta-item">
                  <span class="material-icons-outlined">gavel</span>
                  ${cfg.caseType || 'Povolení stavby'}
                </span>
                ${cfg.caseCategory ? `
                <span class="case-meta-item">
                  <span class="material-icons-outlined">${cfg.caseIcon || 'home'}</span>
                  ${cfg.caseCategory}
                </span>` : ''}
                ${badge}
              </div>
            </div>
          </div>
          <div class="case-header-actions">
            <button class="header-action-btn" onclick="issrCaseHeader.onUdaje()" title="Údaje řízení">
              <span class="material-icons-outlined">assignment</span>
              Údaje řízení
            </button>
            ${nedostatkyBtn}
            ${menuHtml}
          </div>
        </div>

        <!-- Workflow bar -->
        <div class="workflow-bar">
          <div class="document-access-buttons">
            ${buildDocButtons(cfg.docButtons)}
          </div>
          <div class="workflow-stepper">
            ${buildStepper(activeStep)}
          </div>
        </div>
      </header>

      <!-- Slideout overlay -->
      <div class="slideout-overlay" id="issr-slideout-overlay" onclick="issrCaseHeader._closeSlideout()"></div>
      <div class="slideout-panel" id="issr-slideout-panel">
        <div class="slideout-header">
          <div class="slideout-title">
            <span class="material-icons-outlined" id="issr-slideout-icon">assignment</span>
            <span id="issr-slideout-title">Panel</span>
          </div>
          <button class="slideout-close" onclick="issrCaseHeader._closeSlideout()">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
        <div class="slideout-body" id="issr-slideout-body"></div>
      </div>
    `;

    // Inject into root element or <body> before <main>
    const root = document.getElementById('issr-header-root');
    if (root) {
      root.innerHTML = html;
    } else {
      // Fallback: prepend to body
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      document.body.insertBefore(tmp, document.body.firstChild);
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  window.issrCaseHeader = {
    render: renderCaseHeader,

    // Aktualizovat počet nedostatků za běhu
    setNedostatkyCount: function(n) {
      const el = document.getElementById('issr-nedostatky-badge');
      if (el) el.textContent = n;
    },

    // Callback hookupy — přepište na stránce
    onUdaje: function() { this._openSlideout('assignment', 'Údaje řízení', '<p>Zde budou údaje řízení.</p>'); },
    onNedostatky: function() { this._openSlideout('warning_amber', 'Nedostatky', '<p>Žádné nedostatky.</p>'); },
    onAction: function(action) {
      this._toggleDropdown(false);
      console.log('Akce řízení:', action);
    },

    _toggleDropdown: function(force) {
      const menu = document.getElementById('issr-akce-menu');
      if (!menu) return;
      if (force === false) menu.classList.remove('open');
      else menu.classList.toggle('open');
    },

    _openSlideout: function(icon, title, bodyHtml) {
      document.getElementById('issr-slideout-icon').textContent = icon;
      document.getElementById('issr-slideout-title').textContent = title;
      document.getElementById('issr-slideout-body').innerHTML = bodyHtml;
      document.getElementById('issr-slideout-panel').classList.add('open');
      document.getElementById('issr-slideout-overlay').classList.add('open');
    },

    _closeSlideout: function() {
      document.getElementById('issr-slideout-panel')?.classList.remove('open');
      document.getElementById('issr-slideout-overlay')?.classList.remove('open');
    },
  };

  // Zkratka pro jednoduché volání
  window.renderCaseHeader = renderCaseHeader;

  // Zavřít dropdown při kliknutí mimo
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.action-dropdown')) {
      window.issrCaseHeader._toggleDropdown(false);
    }
  });

})();
