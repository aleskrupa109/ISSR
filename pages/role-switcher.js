/**
 * role-switcher.js — Plovoucí přepínač rolí pro ISSŘ 2.0 prototyp
 *
 * Použití: <script src="role-switcher.js"></script>
 * Automaticky detekuje aktuální roli podle URL a zobrazí plovoucí tlačítko vlevo dole.
 *
 * Role:
 *   - urednik   → povoleni-2.html     (Stavební úředník)
 *   - koordinator → koordinator-1.html  (Koordinátor DO)
 *   - prispevatele → ochrana-prirody-1.html (Přispěvatel — simuluje všechny DO)
 */
(function () {
    'use strict';

    // ── Konfigurace rolí ─────────────────────────────────────────────
    var ROLES = [
        {
            id: 'urednik',
            label: 'Stavební úředník',
            shortLabel: 'Úředník',
            icon: 'gavel',
            color: '#1a73e8',
            bg: '#e8f0fe',
            page: 'povoleni-2.html',
            desc: 'Vede řízení, kontroluje žádost'
        },
        {
            id: 'koordinator',
            label: 'Koordinátor DO',
            shortLabel: 'Koordinátor',
            icon: 'hub',
            color: '#0d652d',
            bg: '#e6f4ea',
            page: 'koordinator-1.html',
            desc: 'Koordinuje dotčené orgány'
        },
        {
            id: 'prispevatele',
            label: 'Přispěvatel (DO)',
            shortLabel: 'Přispěvatel',
            icon: 'shield',
            color: '#b06000',
            bg: '#fef7e0',
            page: 'ochrana-prirody-1.html',
            desc: 'Kontrola a vyjádření za DO'
        }
    ];

    // ── Detekce aktuální role z URL ──────────────────────────────────
    function detectCurrentRole() {
        var path = window.location.pathname + window.location.href;
        if (path.indexOf('koordinator') !== -1) return 'koordinator';
        if (path.indexOf('ochrana-') !== -1) return 'prispevatele';
        if (path.indexOf('povoleni') !== -1) return 'urednik';
        return 'urednik'; // default
    }

    var _currentRole = detectCurrentRole();
    var _menuOpen = false;

    // ── Detekce sim-panelu (povoleni-2) pro úpravu pozice ──────────
    function hasSimPanel() {
        return !!document.querySelector('.sim-panel');
    }

    // ── CSS injection ────────────────────────────────────────────────
    function injectCSS() {
        var fabBottom = hasSimPanel() ? 76 : 24;
        var menuBottom = fabBottom + 52; // fab height (44) + gap (8)
        var style = document.createElement('style');
        style.textContent =
            /* Plovoucí tlačítko */
            '.rs-fab {' +
                'position: fixed; bottom: ' + fabBottom + 'px; left: 24px; z-index: 10000;' +
                'display: flex; align-items: center; gap: 8px;' +
                'padding: 0 16px 0 12px; height: 44px;' +
                'background: #fff; color: #3c4043;' +
                'border: 1px solid #dadce0; border-radius: 22px;' +
                'box-shadow: 0 2px 8px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.08);' +
                'cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
                'font-size: 13px; font-weight: 500;' +
                'transition: box-shadow .2s, transform .15s;' +
                'user-select: none;' +
            '}' +
            '.rs-fab:hover {' +
                'box-shadow: 0 4px 14px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.1);' +
                'transform: translateY(-1px);' +
            '}' +
            '.rs-fab-icon {' +
                'width: 28px; height: 28px; border-radius: 50%;' +
                'display: flex; align-items: center; justify-content: center;' +
                'font-size: 16px; flex-shrink: 0;' +
            '}' +
            '.rs-fab-arrow {' +
                'font-size: 18px; color: #9aa0a6; margin-left: 2px;' +
                'transition: transform .2s;' +
            '}' +
            '.rs-fab.open .rs-fab-arrow { transform: rotate(180deg); }' +

            /* Menu */
            '.rs-menu {' +
                'position: fixed; bottom: ' + menuBottom + 'px; left: 24px; z-index: 10001;' +
                'background: #fff; border-radius: 12px;' +
                'box-shadow: 0 8px 28px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);' +
                'border: 1px solid #e0e0e0;' +
                'padding: 6px; min-width: 260px;' +
                'opacity: 0; transform: translateY(8px) scale(.97);' +
                'pointer-events: none;' +
                'transition: opacity .15s ease, transform .15s ease;' +
                'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
            '}' +
            '.rs-menu.open {' +
                'opacity: 1; transform: translateY(0) scale(1);' +
                'pointer-events: auto;' +
            '}' +
            '.rs-menu-title {' +
                'font-size: 10px; font-weight: 600; color: #9aa0a6;' +
                'text-transform: uppercase; letter-spacing: 0.5px;' +
                'padding: 8px 12px 6px;' +
            '}' +

            /* Položka menu */
            '.rs-menu-item {' +
                'display: flex; align-items: center; gap: 10px;' +
                'padding: 10px 12px; border-radius: 8px;' +
                'cursor: pointer; transition: background .12s;' +
                'text-decoration: none; color: inherit;' +
            '}' +
            '.rs-menu-item:hover { background: #f1f3f4; }' +
            '.rs-menu-item.active {' +
                'background: #e8f0fe;' +
            '}' +
            '.rs-menu-item-icon {' +
                'width: 36px; height: 36px; border-radius: 8px;' +
                'display: flex; align-items: center; justify-content: center;' +
                'font-size: 18px; flex-shrink: 0;' +
            '}' +
            '.rs-menu-item-info { flex: 1; min-width: 0; }' +
            '.rs-menu-item-label {' +
                'font-size: 13px; font-weight: 600; color: #202124;' +
            '}' +
            '.rs-menu-item-desc {' +
                'font-size: 11px; color: #5f6368; margin-top: 1px;' +
            '}' +
            '.rs-menu-item-check {' +
                'font-size: 18px; color: #1a73e8; flex-shrink: 0;' +
            '}' +

            /* Overlay */
            '.rs-overlay {' +
                'position: fixed; inset: 0; z-index: 9999;' +
                'display: none;' +
            '}' +
            '.rs-overlay.open { display: block; }';

        document.head.appendChild(style);
    }

    // ── Sestavení URL se zachováním query parametrů ───────────────────
    function buildUrl(page) {
        // Zachovat scenar query param pokud existuje
        var basePath = '';
        var currentPath = window.location.pathname;
        var lastSlash = currentPath.lastIndexOf('/');
        if (lastSlash !== -1) {
            basePath = currentPath.substring(0, lastSlash + 1);
        }
        var url = basePath + page;

        // Přenést parametr rychlost/scenar
        var params = new URLSearchParams(window.location.search);
        var keep = [];
        if (params.get('rychlost')) keep.push('rychlost=' + params.get('rychlost'));
        if (keep.length > 0) url += '?' + keep.join('&');

        return url;
    }

    // ── Sestavení HTML ───────────────────────────────────────────────
    function buildDOM() {
        var currentRoleObj = ROLES.filter(function (r) { return r.id === _currentRole; })[0] || ROLES[0];

        // Overlay pro zavření
        var overlay = document.createElement('div');
        overlay.className = 'rs-overlay';
        overlay.id = 'rsOverlay';
        overlay.addEventListener('click', toggleMenu);

        // Menu
        var menu = document.createElement('div');
        menu.className = 'rs-menu';
        menu.id = 'rsMenu';

        var menuHtml = '<div class="rs-menu-title">Přepnout roli</div>';
        for (var i = 0; i < ROLES.length; i++) {
            var r = ROLES[i];
            var isActive = r.id === _currentRole;
            var href = isActive ? '#' : buildUrl(r.page);
            menuHtml +=
                '<a class="rs-menu-item' + (isActive ? ' active' : '') + '" ' +
                    (isActive ? '' : 'href="' + href + '"') +
                    ' data-role="' + r.id + '">' +
                    '<div class="rs-menu-item-icon" style="background:' + r.bg + ';color:' + r.color + ';">' +
                        '<span class="material-icons-outlined">' + r.icon + '</span>' +
                    '</div>' +
                    '<div class="rs-menu-item-info">' +
                        '<div class="rs-menu-item-label">' + r.label + '</div>' +
                        '<div class="rs-menu-item-desc">' + r.desc + '</div>' +
                    '</div>' +
                    (isActive ? '<span class="material-icons-outlined rs-menu-item-check">check_circle</span>' : '') +
                '</a>';
        }
        menu.innerHTML = menuHtml;

        // FAB tlačítko
        var fab = document.createElement('div');
        fab.className = 'rs-fab';
        fab.id = 'rsFab';
        fab.innerHTML =
            '<div class="rs-fab-icon" style="background:' + currentRoleObj.bg + ';color:' + currentRoleObj.color + ';">' +
                '<span class="material-icons-outlined">' + currentRoleObj.icon + '</span>' +
            '</div>' +
            '<span>' + currentRoleObj.shortLabel + '</span>' +
            '<span class="material-icons-outlined rs-fab-arrow">expand_less</span>';
        fab.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
        });

        document.body.appendChild(overlay);
        document.body.appendChild(menu);
        document.body.appendChild(fab);
    }

    function toggleMenu() {
        _menuOpen = !_menuOpen;
        var menu = document.getElementById('rsMenu');
        var fab = document.getElementById('rsFab');
        var overlay = document.getElementById('rsOverlay');
        if (menu) menu.classList.toggle('open', _menuOpen);
        if (fab) fab.classList.toggle('open', _menuOpen);
        if (overlay) overlay.classList.toggle('open', _menuOpen);
    }

    // ── Init ─────────────────────────────────────────────────────────
    function init() {
        // Ověřit, že Material Icons jsou načtené
        if (!document.querySelector('link[href*="material-icons"]')) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
            document.head.appendChild(link);
        }
        injectCSS();
        buildDOM();
    }

    // Spustit po DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
