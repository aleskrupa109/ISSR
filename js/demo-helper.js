/**
 * NÁPOVĚDA K PROTOTYPU (demo-helper) — sdílený drop-in modul
 * =========================================================
 * Určeno pro klikací makety (Portál stavebníka, ISSŘ, …). Soubor je
 * PROJEKTOVĚ NEZÁVISLÝ — vše specifické se předává přes window.DEMO_CONFIG.
 *
 * Poskytuje dvě vrstvy nápovědy:
 *   1) CO SE SIMULUJE  – kde prototyp předstírá reálnou funkci
 *                        (rejstříky, registry, e-maily, backend => localStorage).
 *   2) CO TO ZNAMENÁ   – věcné/doménové vysvětlení pojmů a kroků.
 *
 * Použití na stránce:
 *   1. definovat konfiguraci:
 *        <script>
 *          window.DEMO_CONFIG = {
 *            appPrefix: 'issr',            // nepovinné, default 'ps'
 *                                          // ODDĚLUJE localStorage maket na společné doméně!
 *            homeUrl: '../index.html',     // nepovinné, kam vede úplný reset
 *            controls: ['<strong>Logo lva</strong> … — návrat na úvodní stránku.'],
 *            reset: {                      // nepovinné; bez hooku se tlačítko skryje
 *              soft: function () { MujStav.resetData(); },
 *              hard: function () { MujStav.resetAll(); },
 *              softNote: '…', hardNote: '…'
 *            },
 *            about: { title: '…', html: '…' },
 *            annotations: [
 *              { selector: '.neco', label: '…', simulace: '…', vyznam: '…' }
 *            ]
 *          };
 *        </script>
 *   2. připojit tento skript:
 *        <script src="../js/demo-helper.js"></script>   (na index.html bez "../")
 *
 * Bez uvedení `reset` se modul zpětně kompatibilně naváže na window.PortalStavebnika.
 * Modul si sám vkládá CSS i ovládací prvky, nepotřebuje zásah do rozvržení
 * stránky a je nezávislý na tom, jak je stránka jinak "zadrátovaná".
 */

(function () {
    'use strict';

    var config = window.DEMO_CONFIG || {};
    var annotations = config.annotations || [];

    // Prefix odděluje úložiště jednotlivých maket (na GitHub Pages sdílejí doménu).
    var PREFIX = config.appPrefix || 'ps';
    var STATE_KEY = PREFIX + '_demo_help';      // zapnutý režim nápovědy (napříč stránkami)
    var HINT_KEY = PREFIX + '_demo_hint_seen';  // jednorázový úvodní tip

    var helpOn = false;
    var els = {};           // reference na vytvořené prvky
    var openPopoverAnn = null;

    // ---------- perzistence stavu ----------
    function readState() {
        try { return localStorage.getItem(STATE_KEY) === '1'; }
        catch (e) { return false; }
    }
    function writeState(on) {
        try { localStorage.setItem(STATE_KEY, on ? '1' : '0'); }
        catch (e) {}
    }

    // ---------- vkládání CSS ----------
    function injectStyles() {
        if (document.getElementById('ds-styles')) return;
        var css = [
            ':root{--ds-accent:var(--gov-primary,#2c5a8c);--ds-sim:#b45309;--ds-mean:#1d4ed8;}',
            // plovoucí ovládání
            '.ds-fab{position:fixed;right:20px;bottom:20px;z-index:31000;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:"Roboto",-apple-system,sans-serif;}',
            '.ds-fab-main{display:inline-flex;align-items:center;gap:8px;border:none;cursor:pointer;padding:11px 16px;border-radius:24px;background:var(--ds-accent);color:#fff;font-size:14px;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,.22);transition:transform .12s,box-shadow .12s;}',
            '.ds-fab-main:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(0,0,0,.28);}',
            '.ds-fab-main.ds-active{background:#0f7b3f;}',
            '.ds-fab-main .ds-ico{width:20px;height:20px;display:inline-flex;}',
            '.ds-fab-mini{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.5);cursor:pointer;background:#fff;color:var(--ds-accent);font-weight:700;font-size:15px;box-shadow:0 3px 10px rgba(0,0,0,.2);display:inline-flex;align-items:center;justify-content:center;}',
            '.ds-fab-mini:hover{background:var(--ds-accent);color:#fff;}',
            // úvodní tip
            '.ds-hint{position:fixed;right:20px;bottom:78px;z-index:31001;max-width:250px;background:#111827;color:#fff;padding:12px 14px;border-radius:10px;font-size:13px;line-height:1.5;box-shadow:0 8px 24px rgba(0,0,0,.35);font-family:"Roboto",sans-serif;}',
            '.ds-hint:after{content:"";position:absolute;right:26px;bottom:-7px;border:7px solid transparent;border-top-color:#111827;border-bottom:0;}',
            '.ds-hint button{margin-top:8px;background:#fff;color:#111827;border:none;border-radius:6px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;}',
            // anotované prvky + značky
            '.ds-help-on .ds-annotated{outline:2px dashed var(--ds-accent);outline-offset:3px;border-radius:4px;}',
            '.ds-marker{position:absolute;top:-10px;right:-10px;width:24px;height:24px;box-sizing:border-box;border-radius:50%;background:var(--ds-accent);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff;user-select:none;}',
            '.ds-marker:hover{transform:scale(1.12);}',
            'body:not(.ds-help-on) .ds-marker{display:none;}',
            // popover
            '.ds-pop{position:fixed;z-index:32000;width:320px;max-width:calc(100vw - 24px);background:#fff;border:1px solid var(--gov-neutral-200,#e0e0e0);border-radius:10px;box-shadow:0 12px 34px rgba(0,0,0,.22);font-family:"Roboto",sans-serif;color:#1f2937;overflow:hidden;display:none;}',
            '.ds-pop.ds-show{display:block;}',
            '.ds-pop-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;background:var(--ds-accent);color:#fff;}',
            '.ds-pop-head strong{font-size:14px;font-weight:600;}',
            '.ds-pop-close{background:transparent;border:none;color:#fff;font-size:20px;line-height:1;cursor:pointer;padding:0 2px;}',
            '.ds-pop-body{padding:12px 14px;font-size:13px;line-height:1.55;}',
            '.ds-block{margin-bottom:12px;}',
            '.ds-block:last-child{margin-bottom:0;}',
            '.ds-tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;padding:2px 7px;border-radius:4px;margin-bottom:5px;}',
            '.ds-tag-sim{background:#fef3c7;color:var(--ds-sim);}',
            '.ds-tag-mean{background:#dbeafe;color:var(--ds-mean);}',
            // panel "O prototypu"
            '.ds-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:32500;display:none;}',
            '.ds-overlay.ds-show{display:block;}',
            '.ds-panel{position:fixed;top:0;right:0;height:100%;width:400px;max-width:90vw;background:#fff;z-index:33000;box-shadow:-8px 0 30px rgba(0,0,0,.25);transform:translateX(100%);transition:transform .22s ease;display:flex;flex-direction:column;font-family:"Roboto",sans-serif;color:#1f2937;}',
            '.ds-panel.ds-show{transform:translateX(0);}',
            '.ds-panel-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:var(--ds-accent);color:#fff;}',
            '.ds-panel-head h2{font-size:16px;font-weight:600;margin:0;}',
            '.ds-panel-head button{background:transparent;border:none;color:#fff;font-size:24px;line-height:1;cursor:pointer;}',
            '.ds-panel-body{padding:18px;overflow-y:auto;font-size:14px;line-height:1.6;}',
            '.ds-panel-body h3{font-size:14px;margin:16px 0 6px;color:var(--ds-accent);}',
            '.ds-panel-body ul{margin:6px 0 6px 18px;}',
            '.ds-panel-body li{margin-bottom:4px;}',
            '.ds-controls{margin:6px 0 6px 18px;}',
            '.ds-controls li{margin-bottom:4px;font-size:13px;}',
            '.ds-reset{margin-top:18px;padding-top:14px;border-top:1px solid var(--gov-neutral-200,#e0e0e0);}',
            '.ds-reset button{display:block;width:100%;border-radius:6px;padding:9px 12px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:4px;}',
            '.ds-reset-soft{background:#fff;color:var(--ds-accent);border:1px solid var(--ds-accent);}',
            '.ds-reset-soft:hover{background:var(--ds-accent);color:#fff;}',
            '.ds-reset-hard{background:#fff;color:#b91c1c;border:1px solid #b91c1c;}',
            '.ds-reset-hard:hover{background:#b91c1c;color:#fff;}',
            '.ds-reset-note{font-size:12px;color:#6b7280;margin:0 0 14px;line-height:1.45;}',
            '@media print{.ds-fab,.ds-hint,.ds-marker,.ds-pop,.ds-overlay,.ds-panel{display:none!important;}}'
        ].join('\n');
        var style = document.createElement('style');
        style.id = 'ds-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ---------- plovoucí ovládání (FAB) ----------
    function buildFab() {
        var fab = document.createElement('div');
        fab.className = 'ds-fab';

        // Volitelné přepolohování FAB přes config.fabPosition
        var pos = config.fabPosition;
        if (pos) {
            if (pos.bottom) fab.style.bottom = pos.bottom;
            if (pos.top)    fab.style.top    = pos.top;
            if (pos.right)  fab.style.right  = pos.right;
            if (pos.left)   { fab.style.left = pos.left; fab.style.right = 'auto'; }
        }

        var about = document.createElement('button');
        about.className = 'ds-fab-mini';
        about.type = 'button';
        about.title = 'O tomto prototypu';
        about.textContent = 'i';
        about.addEventListener('click', openAbout);

        var main = document.createElement('button');
        main.className = 'ds-fab-main';
        main.type = 'button';
        main.innerHTML =
            '<span class="ds-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 11v5"/><circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"/>' +
            '</svg></span><span class="ds-fab-label">Nápověda</span>';
        main.addEventListener('click', function () { toggleHelp(); });

        fab.appendChild(about);
        fab.appendChild(main);
        document.body.appendChild(fab);
        els.fabMain = main;
        els.fabLabel = main.querySelector('.ds-fab-label');
    }

    function maybeShowHint() {
        var seen;
        try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch (e) { seen = false; }
        if (seen || helpOn) return;
        var hint = document.createElement('div');
        hint.className = 'ds-hint';
        // Posunutí tipu spolu s FAB
        var pos = config.fabPosition;
        if (pos && pos.bottom) {
            var fabBottom = parseInt(pos.bottom, 10) || 20;
            hint.style.bottom = (fabBottom + 58) + 'px';
        }
        if (pos && pos.left) {
            hint.style.left = pos.left;
            hint.style.right = 'auto';
        }
        hint.innerHTML = 'Toto je klikací prototyp. Tlačítkem <strong>Nápověda</strong> zapnete vysvětlivky, co se simuluje a co jednotlivé kroky znamenají.<br><button type="button">Rozumím</button>';
        hint.querySelector('button').addEventListener('click', function () {
            try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {}
            if (hint.parentNode) hint.parentNode.removeChild(hint);
        });
        document.body.appendChild(hint);
    }

    // ---------- popover ----------
    function buildPopover() {
        var pop = document.createElement('div');
        pop.className = 'ds-pop';
        pop.innerHTML =
            '<div class="ds-pop-head"><strong class="ds-pop-title"></strong>' +
            '<button type="button" class="ds-pop-close" aria-label="Zavřít">&times;</button></div>' +
            '<div class="ds-pop-body"></div>';
        document.body.appendChild(pop);
        pop.querySelector('.ds-pop-close').addEventListener('click', closePopover);
        els.pop = pop;
        els.popTitle = pop.querySelector('.ds-pop-title');
        els.popBody = pop.querySelector('.ds-pop-body');
    }

    function openPopover(marker, ann) {
        var body = '';
        if (ann.simulace) {
            body += '<div class="ds-block"><span class="ds-tag ds-tag-sim">Co se simuluje</span><div>' + ann.simulace + '</div></div>';
        }
        if (ann.vyznam) {
            body += '<div class="ds-block"><span class="ds-tag ds-tag-mean">Co to znamená</span><div>' + ann.vyznam + '</div></div>';
        }
        els.popTitle.textContent = ann.label || 'Vysvětlivka';
        els.popBody.innerHTML = body;
        els.pop.classList.add('ds-show');
        openPopoverAnn = marker;
        positionPopover(marker);
    }

    function positionPopover(marker) {
        var r = marker.getBoundingClientRect();
        var pop = els.pop;
        var pw = pop.offsetWidth || 320;
        var ph = pop.offsetHeight || 160;
        var left = r.left + r.width / 2 - pw / 2;
        var top = r.bottom + 10;
        // svislé přeteče => nad značku
        if (top + ph > window.innerHeight - 8) {
            top = r.top - ph - 10;
        }
        if (top < 8) top = 8;
        // vodorovné ukotvení do viewportu
        if (left < 8) left = 8;
        if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
    }

    function closePopover() {
        els.pop.classList.remove('ds-show');
        openPopoverAnn = null;
    }

    // ---------- ukotvení anotací ----------
    function ensurePositioned(el) {
        var pos = window.getComputedStyle(el).position;
        if (pos === 'static') {
            el.style.position = 'relative';
            el.setAttribute('data-ds-pos', '1');
        }
    }

    function attachMarker(el, ann, idx) {
        if (el.getAttribute('data-ds-marked') === String(idx)) return;
        el.setAttribute('data-ds-marked', String(idx));
        el.classList.add('ds-annotated');
        ensurePositioned(el);
        var m = document.createElement('span');
        m.className = 'ds-marker';
        m.textContent = 'i';
        m.title = ann.label || 'Vysvětlivka';
        m.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (openPopoverAnn === m && els.pop.classList.contains('ds-show')) {
                closePopover();
            } else {
                openPopover(m, ann);
            }
        });
        el.appendChild(m);
    }

    function scanAndAttach() {
        annotations.forEach(function (ann, idx) {
            var el = document.querySelector(ann.selector);
            if (el) attachMarker(el, ann, idx);
        });
    }

    function removeMarkers() {
        var marks = document.querySelectorAll('.ds-marker');
        Array.prototype.forEach.call(marks, function (m) {
            if (m.parentNode) m.parentNode.removeChild(m);
        });
        var ann = document.querySelectorAll('.ds-annotated[data-ds-marked]');
        Array.prototype.forEach.call(ann, function (el) {
            el.classList.remove('ds-annotated');
            el.removeAttribute('data-ds-marked');
            if (el.getAttribute('data-ds-pos') === '1') {
                el.style.position = '';
                el.removeAttribute('data-ds-pos');
            }
        });
    }

    // ---------- zapnutí / vypnutí režimu ----------
    function toggleHelp() { setHelp(!helpOn); }

    function setHelp(on) {
        helpOn = on;
        writeState(on);
        if (on) {
            document.body.classList.add('ds-help-on');
            els.fabMain.classList.add('ds-active');
            if (els.fabLabel) els.fabLabel.textContent = 'Nápověda: zapnuto';
            scanAndAttach();
        } else {
            document.body.classList.remove('ds-help-on');
            els.fabMain.classList.remove('ds-active');
            if (els.fabLabel) els.fabLabel.textContent = 'Nápověda';
            closePopover();
            removeMarkers();
        }
    }

    // ---------- panel "O prototypu" ----------
    function buildAbout() {
        var overlay = document.createElement('div');
        overlay.className = 'ds-overlay';
        overlay.addEventListener('click', closeAbout);

        var panel = document.createElement('div');
        panel.className = 'ds-panel';

        var about = config.about || {};
        var reset = config.reset || {};
        var defaultHtml =
            '<p>Toto je <strong>klikací prototyp</strong>. Neběží proti žádnému reálnému systému a neodesílá nikam žádná data.</p>' +
            '<h3>Kde se drží data</h3>' +
            '<p>Všechna data existují pouze ve vašem prohlížeči (localStorage). Zůstanou i po zavření okna; jiného uživatele ani jiný počítač neovlivní.</p>';

        var controls = config.controls || ['<strong>Logo lva</strong> (vlevo nahoře) — návrat na úvodní stránku.'];
        var controlsHtml = controls.length
            ? '<h3>Ovládací prvky</h3><ul class="ds-controls">' + controls.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>'
            : '';

        // Resetovací tlačítka se zobrazí jen tam, kde je na co navázat.
        var hasSoft = !!(reset.soft || (window.PortalStavebnika && PortalStavebnika.resetData));
        var hasHard = !!(reset.hard || (window.PortalStavebnika && PortalStavebnika.resetAll));
        var resetHtml = '';
        if (hasSoft || hasHard) {
            resetHtml = '<div class="ds-reset"><h3 style="margin-top:0;">Reset dat</h3>' +
                '<p style="font-size:13px;margin-bottom:10px;">Prototyp si zadaná data pamatuje v prohlížeči. Můžete je kdykoli vrátit do výchozího stavu:</p>';
            if (hasSoft) {
                resetHtml += '<button type="button" class="ds-reset-soft">Obnovit výchozí demo data</button>' +
                    '<p class="ds-reset-note">' + (reset.softNote || 'Zůstanete přihlášený. Smažou se data vytvořená během klikání a obnoví se výchozí testovací sada. Stránka se poté znovu načte.') + '</p>';
            }
            if (hasHard) {
                resetHtml += '<button type="button" class="ds-reset-hard">Úplný reset a odhlášení</button>' +
                    '<p class="ds-reset-note">' + (reset.hardNote || 'Smaže úplně vše včetně přihlášení a vrátí na úvodní stránku. Vhodné pro předání dema jiné osobě nebo start s jiným jménem.') + '</p>';
            }
            resetHtml += '</div>';
        }

        panel.innerHTML =
            '<div class="ds-panel-head"><h2>' + (about.title || 'O tomto prototypu') + '</h2>' +
            '<button type="button" aria-label="Zavřít">&times;</button></div>' +
            '<div class="ds-panel-body">' + (about.html || defaultHtml) +
            controlsHtml + resetHtml +
            '</div>';

        panel.querySelector('.ds-panel-head button').addEventListener('click', closeAbout);
        var softBtn = panel.querySelector('.ds-reset-soft');
        var hardBtn = panel.querySelector('.ds-reset-hard');
        if (softBtn) softBtn.addEventListener('click', resetToDefaults);
        if (hardBtn) hardBtn.addEventListener('click', resetAllData);

        document.body.appendChild(overlay);
        document.body.appendChild(panel);
        els.overlay = overlay;
        els.panel = panel;
    }

    function openAbout() {
        els.overlay.classList.add('ds-show');
        els.panel.classList.add('ds-show');
    }
    function closeAbout() {
        els.overlay.classList.remove('ds-show');
        els.panel.classList.remove('ds-show');
    }

    function resetToDefaults() {
        if (!confirm('Obnovit výchozí demo data? Zůstanete přihlášený. Smažou se vámi vytvořená data a obnoví se výchozí testovací sada.')) return;
        var reset = config.reset || {};
        try {
            if (reset.soft) { reset.soft(); }
            else if (window.PortalStavebnika && PortalStavebnika.resetData) { PortalStavebnika.resetData(); }
        } catch (e) {}
        window.location.reload();
    }

    function resetAllData() {
        if (!confirm('Úplný reset? Smaže se úplně vše včetně přihlášení a vrátíte se na úvodní stránku.')) return;
        var reset = config.reset || {};
        try {
            if (reset.hard) { reset.hard(); }
            else if (window.PortalStavebnika && PortalStavebnika.resetAll) { PortalStavebnika.resetAll(); }
        } catch (e) {}
        var toIndex = config.homeUrl ||
            (window.location.pathname.indexOf('/pages/') > -1 ? '../index.html' : 'index.html');
        window.location.href = toIndex;
    }

    // ---------- globální handlery ----------
    function onDocClick(e) {
        if (!els.pop.classList.contains('ds-show')) return;
        if (els.pop.contains(e.target)) return;
        if (e.target.classList && e.target.classList.contains('ds-marker')) return;
        closePopover();
    }
    function onKey(e) {
        if (e.key === 'Escape') { closePopover(); closeAbout(); }
    }
    function onReflow() {
        if (openPopoverAnn) positionPopover(openPopoverAnn);
    }

    // ---------- init ----------
    function init() {
        injectStyles();
        buildFab();
        buildPopover();
        buildAbout();

        document.addEventListener('click', onDocClick, true);
        document.addEventListener('keydown', onKey);
        window.addEventListener('scroll', onReflow, true);
        window.addEventListener('resize', onReflow);

        // sledování dynamicky vykreslených prvků (např. karty identit)
        if (window.MutationObserver && annotations.length) {
            var pending = false;
            var mo = new MutationObserver(function () {
                if (!helpOn || pending) return;
                pending = true;
                setTimeout(function () { pending = false; scanAndAttach(); }, 120);
            });
            mo.observe(document.body, { childList: true, subtree: true });
        }

        helpOn = readState();
        if (helpOn) {
            setHelp(true);
        } else {
            maybeShowHint();
        }

        window.DemoHelper = {
            toggle: toggleHelp,
            setHelp: setHelp,
            openAbout: openAbout,
            rescan: scanAndAttach
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
