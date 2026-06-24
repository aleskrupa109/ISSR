/**
 * verejne-zajmy-shared.js
 * Sdílený modul pro obsah Veřejné zájmy — Identifikace dotčených VZ.
 * Používá se v povoleni-2.html (kontrola VZ) i koordinator-1.html (rozhraní koordinátora).
 *
 * Podscénáře identifikace:
 *   rucni     — Ruční identifikace (úředník vybírá z navržených + katalogu)
 *   rozeslat  — Rozeslat integrovaným DO (DO sami posoudí dotčenost)
 *
 * Způsoby posouzení (multi-select, pro ruční režim):
 *   interni    — Interní přispěvatel
 *   prilozeno  — Stanovisko DO přiloženo
 *   vyzadat    — Vyžádat od DO
 *
 * Stavy tlačítek:
 *   suggested (modrá) — systém navrhl, úředník ještě nepotvrdil
 *   confirmed (zelená) — úředník vědomě potvrdil kliknutím
 *   neutral   (šedá)   — bez výběru
 *
 * Použití:
 *   <script src="verejne-zajmy-shared.js"></script>
 *   ...
 *   VZShared.init('containerId');
 */
(function () {
    'use strict';

    // ======================================================================
    // DATA
    // ======================================================================

    /** Předvyplněné VZ položky — ruční identifikace */
    var VZ_ITEMS = [
        {
            id: 'opk',
            name: 'Ochrana přírody a krajiny',
            icon: 'eco',
            color: '#2e7d32',
            desc: 'Kácení 2 dřevin na pozemku parc. č. 981/31 — § 8 zák. č. 114/1992 Sb.',
            defaultMethods: ['interni']
        },
        {
            id: 'les',
            name: 'Ochrana lesa',
            icon: 'park',
            color: '#558b2f',
            desc: 'Ochranné pásmo lesa parc. č. 981/31 — § 14 odst. 2 zák. č. 289/1995 Sb.',
            defaultMethods: ['vyzadat']
        },
        {
            id: 'voda',
            name: 'Ochrana vod',
            icon: 'water_drop',
            color: '#0277bd',
            desc: 'Záplavové území Divoká Orlice, podmínky Povodí Labe — § 17 zák. č. 254/2001 Sb.',
            defaultMethods: ['vyzadat']
        },
        {
            id: 'pamatky',
            name: 'Památková péče',
            icon: 'account_balance',
            color: '#6d4c41',
            desc: 'Ochranné pásmo zámku Doudleby n. O., archeologické nálezy — § 14 zák. č. 20/1987 Sb.',
            defaultMethods: ['interni']
        },
        {
            id: 'odpady',
            name: 'Odpadové hospodářství',
            icon: 'delete_outline',
            color: '#ef6c00',
            desc: 'Nakládání s odpady ze stavby — zák. č. 541/2020 Sb.',
            defaultMethods: ['interni']
        },
        {
            id: 'uplan',
            name: 'Územní plánování',
            icon: 'map',
            color: '#1565c0',
            desc: 'Soulad s územně plánovací dokumentací — § 188 zák. č. 283/2021 Sb.',
            defaultMethods: ['interni']
        },
        {
            id: 'havarie',
            name: 'Prevence závažných havárií',
            icon: 'warning_amber',
            color: '#e65100',
            desc: 'Zóna havarijního plánování — zák. č. 224/2015 Sb.',
            defaultMethods: ['interni']
        }
    ];

    /** Katalog dalších VZ (přidání uživatelem) */
    var VZ_CATALOG = [
        { id: 'zpf', name: 'Ochrana ZPF', desc: 'Odnětí ze ZPF — § 9 zák. č. 334/1992 Sb.', icon: 'grass', color: '#33691e' },
        { id: 'ovzdusi', name: 'Ochrana ovzduší', desc: 'Zdroj znečišťování — zák. č. 201/2012 Sb.', icon: 'air', color: '#546e7a' },
        { id: 'khs', name: 'Ochrana veřejného zdraví', desc: 'Hluk, vibrace — zák. č. 258/2000 Sb.', icon: 'health_and_safety', color: '#00838f' },
        { id: 'geologie', name: 'Ochrana nerostného bohatství', desc: 'Ložisková území — zák. č. 44/1988 Sb.', icon: 'diamond', color: '#4e342e' },
        { id: 'doprava', name: 'Ochrana pozemních komunikací', desc: 'Připojení, ochranná pásma — zák. č. 13/1997 Sb.', icon: 'directions_car', color: '#1565c0' },
        { id: 'energetika', name: 'Energetika', desc: 'Ochranná pásma energetické infrastruktury — zák. č. 458/2000 Sb.', icon: 'bolt', color: '#f57f17' }
    ];

    /** Integrované DO pro režim „rozeslat" */
    var VZ_BROADCAST_DOS = [
        { name: 'Ochrana přírody a krajiny', org: 'ÚP Kostelec nad Orlicí', icon: 'eco', color: '#2e7d32',
          prispevatel: 'Dobisík Ondřej', usek: 'PAK',
          kontrola: 'dotcen', kontrolaNote: 'Dotčen — kácení 2 dřevin', kontrolaForma: 'interni',
          vyjadreni: 'hotovo', vyjadreniNote: 'Interní posouzení — bez námitek, podmínky stanoveny',
          page: 'ochrana-prirody-1.html' },
        { name: 'Ochrana lesa', org: 'ÚP Kostelec nad Orlicí', icon: 'park', color: '#558b2f',
          prispevatel: 'Herbrychová Jarmila', usek: 'LES',
          kontrola: 'dotcen', kontrolaNote: 'Dotčen — ochranné pásmo lesa', kontrolaForma: 'externi',
          vyjadreni: 'hotovo', vyjadreniNote: 'Vyžádáno ext. vyjádření → doručeno, bez námitek',
          page: 'ochrana-lesa-1.html' },
        { name: 'Ochrana vod', org: 'ÚP Kostelec nad Orlicí', icon: 'water_drop', color: '#0277bd',
          prispevatel: 'Herbrychová Jarmila', usek: 'VOD',
          kontrola: 'dotcen', kontrolaNote: 'Dotčen — záplavové území Q100', kontrolaForma: 'externi',
          vyjadreni: 'ceka', vyjadreniNote: '' },
        { name: 'Památková péče', org: 'ÚP Kostelec nad Orlicí', icon: 'account_balance', color: '#6d4c41',
          prispevatel: 'Krupa Aleš', usek: 'PAM',
          kontrola: 'nedotcen', kontrolaNote: 'Záměr mimo ochranné pásmo',
          vyjadreni: null, vyjadreniNote: '' },
        { name: 'Odpadové hospodářství', org: 'ÚP Kostelec nad Orlicí', icon: 'delete_outline', color: '#ef6c00',
          prispevatel: 'Herbrychová Jarmila', usek: 'ODP',
          kontrola: 'ceka', kontrolaNote: '',
          vyjadreni: null, vyjadreniNote: '' },
        { name: 'Ochrana veřejného zdraví', org: 'KHS Královéhradeckého kraje', icon: 'health_and_safety', color: '#00838f',
          prispevatel: 'Marková Lucie', usek: 'HYG',
          kontrola: 'dotcen', kontrolaNote: 'Dotčen — hluk ze stavby', kontrolaForma: 'interni',
          vyjadreni: 'ceka', vyjadreniNote: '' },
        { name: 'Územní plánování', org: 'ÚP Kostelec nad Orlicí', icon: 'map', color: '#1565c0',
          prispevatel: 'Janovský Martin', usek: 'UUP',
          kontrola: 'dotcen', kontrolaNote: 'Dotčen — soulad s ÚPD', kontrolaForma: 'interni',
          vyjadreni: 'hotovo', vyjadreniNote: 'Interní posouzení — v souladu s ÚPD' },
        { name: 'Prevence závažných havárií', org: 'ÚP Kostelec nad Orlicí', icon: 'warning_amber', color: '#e65100',
          prispevatel: 'Dobisík Ondřej', usek: 'ZAV',
          kontrola: 'nedotcen', kontrolaNote: 'Stavba není v zóně havarijního plánování',
          vyjadreni: null, vyjadreniNote: '' }
    ];

    /** Aktuální fáze workflow rozeslání — čte se z ISSRState pokud je dostupný */
    var _broadcastPhase = 'ready'; // ready → sent → kontrola → vyjadreni → done

    /** Načte fázi z ISSRState (pokud je dostupný) */
    function _loadPhase() {
        if (typeof ISSRState !== 'undefined') {
            _broadcastPhase = ISSRState.getPhase();
        }
    }

    /** Vrátí DO data s aplikovaným stavem z ISSRState */
    function _getEffectiveDOS() {
        if (typeof ISSRState === 'undefined') return VZ_BROADCAST_DOS;
        return VZ_BROADCAST_DOS.map(function (doItem) {
            return ISSRState.applyToEntry(doItem);
        });
    }

    // ======================================================================
    // CSS INJECTION
    // ======================================================================

    var _cssInjected = false;

    function injectCSS() {
        if (_cssInjected) return;
        _cssInjected = true;
        var style = document.createElement('style');
        style.textContent =
            /* Method grid */
            '.vz-method-grid { display:flex; flex-direction:column; gap:6px; }\n' +
            '.vz-method-row { display:flex; gap:6px; }\n' +
            '.vz-method-row-ext { flex-wrap:wrap; }\n' +
            '.vz-method-option { transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; padding:5px 10px; border:1px solid #dadce0; border-radius:6px; font-size:11px; font-family:inherit; cursor:pointer; background:#fff; color:#5f6368; justify-content:center; white-space:nowrap; }\n' +
            '.vz-method-option.suggested { border-color:#1a73e8; background:#e8f0fe; color:#1a73e8; font-weight:500; }\n' +
            '.vz-method-option.confirmed { border-color:#1e8e3e; background:#e6f4ea; color:#1e8e3e; font-weight:500; }\n' +
            '.vz-method-option:hover:not(.confirmed):not(.suggested) { border-color:#9aa0a6; background:#f8f9fa; }\n' +
            '.vz-method-option.suggested:hover { border-color:#1557b0; background:#d2e3fc; }\n' +
            '.vz-method-option.confirmed:hover { border-color:#137333; background:#ceead6; }\n' +
            '.vz-ident-item { transition:all 0.2s; }\n' +
            '.vz-remove-btn:hover { color:#d32f2f !important; }\n' +
            /* Submode selector */
            '.vz-submode-bar { display:flex; gap:4px; margin-bottom:16px; background:#f1f3f4; padding:4px; border-radius:8px; }\n' +
            '.vz-submode-btn { flex:1; display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:8px 12px; border:none; border-radius:6px; font-size:11px; font-family:inherit; font-weight:500; cursor:pointer; background:transparent; color:#5f6368; transition:all 0.15s; }\n' +
            '.vz-submode-btn.active { background:#fff; color:#1a73e8; box-shadow:0 1px 3px rgba(0,0,0,0.1); }\n' +
            '.vz-submode-btn:hover:not(.active) { color:#202124; }\n' +
            '.vz-submode-btn .material-icons-outlined { font-size:15px; }\n' +
            /* Broadcast DO list */
            '.vz-do-item { display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border-bottom:1px solid #f0f0f0; font-size:12px; }\n' +
            '.vz-do-item:last-child { border-bottom:none; }\n' +
            '.vz-do-status { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:600; white-space:nowrap; }\n' +
            '.vz-do-status.s-dotcen { background:#e6f4ea; color:#1e8e3e; }\n' +
            '.vz-do-status.s-nedotcen { background:#f1f3f4; color:#9aa0a6; }\n' +
            '.vz-do-status.s-ceka { background:#fef7e0; color:#e37400; }\n' +
            '.vz-do-status.s-kontrola { background:#e8f0fe; color:#1a73e8; }\n' +
            '.vz-do-status.s-hotovo { background:#e6f4ea; color:#1e8e3e; }\n' +
            '.vz-do-status.s-doplnit { background:#fce8e6; color:#d93025; }\n' +
            '.vz-do-status.s-interni { background:#f3e8fd; color:#7b1fa2; }\n' +
            '.vz-do-status.s-externi { background:#e8f0fe; color:#1a73e8; }\n' +
            '.vz-do-status.s-prilozeno { background:#f1f3f4; color:#5f6368; }\n' +
            /* Phase stepper */
            '.vz-phase-stepper { display:flex; gap:0; margin-bottom:16px; background:#f8f9fa; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden; }\n' +
            '.vz-phase-step { flex:1; padding:8px 6px; text-align:center; font-size:10px; color:#9aa0a6; border-right:1px solid #e0e0e0; position:relative; }\n' +
            '.vz-phase-step:last-child { border-right:none; }\n' +
            '.vz-phase-step.active { background:#e8f0fe; color:#1a73e8; font-weight:600; }\n' +
            '.vz-phase-step.done { background:#e6f4ea; color:#1e8e3e; font-weight:500; }\n' +
            '.vz-phase-step .material-icons-outlined { display:block; font-size:16px; margin:0 auto 2px; }\n' +
            /* Phase action button */
            '.vz-phase-action { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:6px; border:none; font-family:inherit; font-size:12px; font-weight:500; cursor:pointer; color:#fff; background:#1a73e8; transition:all 0.15s; }\n' +
            '.vz-phase-action:hover { background:#1967d2; }\n' +
            '.vz-phase-action .material-icons-outlined { font-size:16px; }\n' +
            /* Deadline bar */
            '.vz-deadline-bar { display:flex; align-items:center; gap:8px; padding:8px 12px; background:#fef7e0; border:1px solid #fdd835; border-radius:6px; margin-bottom:12px; font-size:11px; color:#e37400; }\n' +
            '.vz-deadline-bar .material-icons-outlined { font-size:16px; }\n';
        document.head.appendChild(style);
    }

    // ======================================================================
    // HELPERS
    // ======================================================================

    function parseList(str) {
        return str ? str.split(',').filter(Boolean) : [];
    }

    // ======================================================================
    // HTML GENERATORS — SUBMODE SELECTOR
    // ======================================================================

    function generateSubModeSelector() {
        return '<div class="vz-submode-bar">' +
            '<button class="vz-submode-btn active" id="vzSubBtnRozeslat" onclick="switchVZSubMode(\'rozeslat\')">' +
                '<span class="material-icons-outlined">campaign</span> Rozeslat integrovaným DO' +
            '</button>' +
            '<button class="vz-submode-btn" id="vzSubBtnRucni" onclick="switchVZSubMode(\'rucni\')">' +
                '<span class="material-icons-outlined">edit_note</span> Ruční identifikace' +
            '</button>' +
        '</div>';
    }

    // ======================================================================
    // HTML GENERATORS — RUČNÍ IDENTIFIKACE
    // ======================================================================

    function generateMethodGrid(id, defaultMethods) {
        var methods = [
            { key: 'interni',   icon: 'person_add',  label: 'Interní přispěvatel', row: 1 },
            { key: 'prilozeno', icon: 'attach_file',  label: 'Externí — přiloženo',  row: 2 },
            { key: 'vyzadat',   icon: 'send',         label: 'Externí — vyžádat',   row: 2 }
        ];
        var row1 = '', row2 = '';
        methods.forEach(function (m) {
            var cls = defaultMethods.indexOf(m.key) >= 0 ? ' suggested' : '';
            var html = '<button class="vz-method-option' + cls + '" data-method="' + m.key + '" onclick="toggleVZMethod(this,\'' + id + '\',\'' + m.key + '\')">' +
                '<span class="material-icons-outlined" style="font-size:14px;">' + m.icon + '</span> ' + m.label +
                '</button>';
            if (m.row === 1) row1 += html;
            else row2 += html;
        });
        return '<div class="vz-method-grid">' +
            '<div class="vz-method-row">' + row1 + '</div>' +
            '<div class="vz-method-row vz-method-row-ext">' + row2 + '</div>' +
            '</div>';
    }

    function generateItem(item) {
        var defs = item.defaultMethods ? item.defaultMethods.join(',') : '';
        return '<div class="vz-ident-item" data-vz-id="' + item.id + '" data-vz-defaults="' + defs + '" data-vz-confirmed="" data-vz-touched="" style="border:1px solid #e0e0e0;border-radius:8px;padding:12px;margin-bottom:8px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">' +
                '<div style="flex:1;">' +
                    '<div style="font-size:13px;font-weight:600;color:#202124;">' +
                        '<span class="material-icons-outlined" style="font-size:15px;vertical-align:middle;color:' + item.color + ';margin-right:4px;">' + item.icon + '</span> ' +
                        item.name +
                    '</div>' +
                    '<div style="font-size:11px;color:#5f6368;margin-top:3px;">' + item.desc + '</div>' +
                '</div>' +
                '<button class="vz-remove-btn" onclick="removeVZItem(this)" title="Odebrat" style="background:none;border:none;cursor:pointer;padding:4px;color:#9aa0a6;">' +
                    '<span class="material-icons-outlined" style="font-size:16px;">close</span>' +
                '</button>' +
            '</div>' +
            generateMethodGrid(item.id, item.defaultMethods || []) +
        '</div>';
    }

    function generateCatalog() {
        var html = '<div id="vzCatalog" style="display:none;margin-top:8px;border:1px solid #dadce0;border-radius:8px;background:#fff;max-height:200px;overflow-y:auto;">';
        html += '<div style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:11px;font-weight:600;color:#5f6368;">Katalog veřejných zájmů</div>';
        VZ_CATALOG.forEach(function (c, i) {
            var border = i < VZ_CATALOG.length - 1 ? 'border-bottom:1px solid #f8f8f8;' : '';
            html += '<div class="vz-catalog-item" onclick="addVZFromCatalog(\'' + c.id + '\',\'' + c.name + '\',\'' + c.desc.replace(/'/g, "\\'") + '\',\'' + c.icon + '\',\'' + c.color + '\')" style="padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:12px;' + border + '">' +
                '<span class="material-icons-outlined" style="font-size:15px;color:' + c.color + ';">' + c.icon + '</span> ' + c.name +
                '</div>';
        });
        html += '</div>';
        return html;
    }

    function generateRucniContent() {
        var html = '';
        // Info banner
        html += '<div style="padding:10px 12px;background:#e8f0fe;border:1px solid #c2dbf4;border-radius:8px;margin-bottom:16px;display:flex;align-items:flex-start;gap:8px;">' +
            '<span class="material-icons-outlined" style="font-size:16px;color:#1a73e8;margin-top:1px;">info</span>' +
            '<div style="font-size:11px;color:#3c4043;line-height:1.5;">' +
                'Systém předvyplnil dotčené veřejné zájmy na základě lokality, druhu záměru a vytěžení souhrnné zprávy pomocí AI. ' +
                '<span style="color:#1a73e8;font-weight:500;">Modře</span> zvýrazněné návrhy potvrďte kliknutím ' +
                '(<span style="color:#1e8e3e;font-weight:500;">zelená</span> = potvrzeno). ' +
                'U každého zájmu lze zvolit i více způsobů posouzení současně.' +
            '</div></div>';
        // Items list
        html += '<div id="vzIdentifikaceList">';
        VZ_ITEMS.forEach(function (item) {
            html += generateItem(item);
        });
        html += '</div>';
        // Add from catalog
        html += '<div style="margin-top:12px;">' +
            '<button class="btn btn-secondary" onclick="openVZCatalog()" id="vzAddBtn" style="width:100%;justify-content:center;gap:6px;border-style:dashed;">' +
                '<span class="material-icons-outlined" style="font-size:16px;">add_circle_outline</span> Přidat další veřejný zájem z katalogu' +
            '</button></div>';
        html += generateCatalog();
        // Summary
        html += '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;margin-top:16px;">' +
            '<div style="font-size:11px;color:#3c4043;line-height:1.6;" id="vzIdentSummary"></div></div>';
        return html;
    }

    // ======================================================================
    // HTML GENERATORS — ROZESLAT INTEGROVANÝM DO
    // ======================================================================

    /** Generuje stepper fází workflow */
    function generatePhaseStepper(activePhase) {
        var phases = [
            { id: 'ready',     icon: 'edit_note',     label: 'Příprava' },
            { id: 'sent',      icon: 'send',          label: 'Rozesláno' },
            { id: 'kontrola',  icon: 'gpp_maybe',     label: 'Posouzení dotčenosti' },
            { id: 'vyjadreni', icon: 'fact_check',     label: 'Kontrola podkladů' },
            { id: 'done',      icon: 'verified',      label: 'Koordinované vyj.' }
        ];
        var phaseOrder = ['ready','sent','kontrola','vyjadreni','done'];
        var activeIdx = phaseOrder.indexOf(activePhase);
        var html = '<div class="vz-phase-stepper">';
        phases.forEach(function (p, i) {
            var cls = '';
            if (i < activeIdx) cls = ' done';
            else if (i === activeIdx) cls = ' active';
            html += '<div class="vz-phase-step' + cls + '">' +
                '<span class="material-icons-outlined">' + p.icon + '</span>' + p.label + '</div>';
        });
        html += '</div>';
        return html;
    }

    /** Generuje položku DO podle aktuální fáze */
    function generateBroadcastDOItem(doItem, phase) {
        var statusHtml = '';

        if (phase === 'sent') {
            statusHtml = '<span class="vz-do-status s-kontrola"><span class="material-icons-outlined" style="font-size:12px;">schedule</span> Čeká na posouzení</span>';
        } else if (phase === 'kontrola') {
            if (doItem.kontrola === 'dotcen') {
                var formaLabel = doItem.kontrolaForma === 'externi' ? 'externí vyj.' : doItem.kontrolaForma === 'prilozeno' ? 'přiloženo' : 'interní';
                statusHtml = '<span class="vz-do-status s-dotcen"><span class="material-icons-outlined" style="font-size:12px;">check_circle</span> Dotčen</span>' +
                    ' <span class="vz-do-status s-' + doItem.kontrolaForma + '" style="margin-left:4px;"><span class="material-icons-outlined" style="font-size:12px;">' +
                    (doItem.kontrolaForma === 'interni' ? 'person' : doItem.kontrolaForma === 'externi' ? 'send' : 'attach_file') +
                    '</span> ' + formaLabel + '</span>';
            } else if (doItem.kontrola === 'nedotcen') {
                statusHtml = '<span class="vz-do-status s-nedotcen"><span class="material-icons-outlined" style="font-size:12px;">remove_circle_outline</span> Nedotčen</span>';
            } else {
                statusHtml = '<span class="vz-do-status s-ceka"><span class="material-icons-outlined" style="font-size:12px;">schedule</span> Čeká</span>';
            }
        } else if (phase === 'vyjadreni' || phase === 'done') {
            if (doItem.kontrola === 'nedotcen') {
                statusHtml = '<span class="vz-do-status s-nedotcen"><span class="material-icons-outlined" style="font-size:12px;">remove_circle_outline</span> Nedotčen</span>';
            } else if (doItem.kontrola === 'ceka') {
                statusHtml = '<span class="vz-do-status s-ceka"><span class="material-icons-outlined" style="font-size:12px;">schedule</span> Čeká na kontrolu</span>';
            } else if (doItem.vyjadreni === 'hotovo') {
                statusHtml = '<span class="vz-do-status s-hotovo"><span class="material-icons-outlined" style="font-size:12px;">check_circle</span> Podklady kompletní</span>';
            } else {
                statusHtml = '<span class="vz-do-status s-ceka"><span class="material-icons-outlined" style="font-size:12px;">schedule</span> Kontroluje podklady</span>';
            }
        }
        // phase === 'ready': no status badges

        var noteText = '';
        if (phase === 'kontrola' && doItem.kontrolaNote) noteText = doItem.kontrolaNote;
        else if ((phase === 'vyjadreni' || phase === 'done') && doItem.kontrola === 'dotcen') {
            noteText = doItem.vyjadreniNote || doItem.kontrolaNote || '';
        }

        var linkBtn = '';
        if (doItem.page) {
            linkBtn = '<a href="' + doItem.page + '" target="_blank" title="Otevřít stránku DO" ' +
                'style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:4px;color:#9aa0a6;text-decoration:none;flex-shrink:0;transition:background .15s,color .15s;" ' +
                'onmouseenter="this.style.background=\'#f1f3f4\';this.style.color=\'#1a73e8\';" ' +
                'onmouseleave="this.style.background=\'transparent\';this.style.color=\'#9aa0a6\';">' +
                '<span class="material-icons-outlined" style="font-size:14px;">open_in_new</span></a>';
        }

        return '<div class="vz-do-item">' +
            '<span class="material-icons-outlined" style="font-size:18px;color:' + doItem.color + ';margin-top:1px;">' + doItem.icon + '</span>' +
            '<div style="flex:1;min-width:0;">' +
                '<div style="font-weight:600;color:#202124;font-size:12px;">' + doItem.name + '</div>' +
                '<div style="font-size:10px;color:#9aa0a6;margin-top:1px;">' + doItem.org + '</div>' +
                (noteText ? '<div style="font-size:10px;color:#5f6368;margin-top:3px;">' + noteText + '</div>' : '') +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;flex-shrink:0;">' + statusHtml + linkBtn + '</div>' +
        '</div>';
    }

    /** Info banner pro každou fázi */
    function generateBroadcastBanner(phase) {
        var banners = {
            ready: { icon: 'campaign', bg: '#e8f0fe', border: '#c2dbf4', color: '#1a73e8', textColor: '#3c4043',
                text: 'Systém rozešle podklady záměru všem integrovaným dotčeným orgánům v působnosti. Každý DO posoudí, zda je záměrem dotčen, a zvolí formu vyjádření.' },
            sent: { icon: 'mark_email_read', bg: '#e8f0fe', border: '#c2dbf4', color: '#1a73e8', textColor: '#3c4043',
                text: 'Podklady byly rozeslány. Čeká se na posouzení dotčenosti jednotlivými DO.' },
            kontrola: { icon: 'gpp_maybe', bg: '#fef7e0', border: '#fdd835', color: '#e37400', textColor: '#3c4043',
                text: 'Běží lhůta pro posouzení dotčenosti. Každý DO posuzuje, zda je záměrem dotčen, a volí formu vyjádření. Nedotčené DO se z dalšího procesu vyřadí.' },
            vyjadreni: { icon: 'fact_check', bg: '#e8f0fe', border: '#c2dbf4', color: '#1a73e8', textColor: '#3c4043',
                text: 'Běží lhůta pro kontrolu podkladů. Dotčené DO kontrolují úplnost a správnost podkladů projektové dokumentace.' },
            done: { icon: 'verified', bg: '#e6f4ea', border: '#a8dab5', color: '#1e8e3e', textColor: '#3c4043',
                text: 'Všechna vyjádření jsou doručena. Koordinátor posoudil, že nejsou v rozporu. Koordinované vyjádření je připraveno k odeslání.' }
        };
        var b = banners[phase];
        return '<div style="padding:10px 12px;background:' + b.bg + ';border:1px solid ' + b.border + ';border-radius:8px;margin-bottom:12px;display:flex;align-items:flex-start;gap:8px;">' +
            '<span class="material-icons-outlined" style="font-size:16px;color:' + b.color + ';margin-top:1px;">' + b.icon + '</span>' +
            '<div style="font-size:11px;color:' + b.textColor + ';line-height:1.5;">' + b.text + '</div></div>';
    }

    /** Lhůta bar pro fáze kontrola a vyjadreni */
    function generateDeadlineBar(phase) {
        if (phase === 'kontrola') {
            return '<div class="vz-deadline-bar"><span class="material-icons-outlined">timer</span>' +
                '<strong>Lhůta pro posouzení dotčenosti:</strong> zbývá 12 dní (do 28. 6. 2026)' +
                '<span style="margin-left:auto;font-weight:600;">⏱ 12 d</span></div>';
        } else if (phase === 'vyjadreni') {
            return '<div class="vz-deadline-bar"><span class="material-icons-outlined">timer</span>' +
                '<strong>Lhůta pro kontrolu podkladů:</strong> zbývá 24 dní (do 10. 7. 2026)' +
                '<span style="margin-left:auto;font-weight:600;">⏱ 24 d</span></div>';
        }
        return '';
    }

    /** Summary bar — počty podle fáze */
    function generateBroadcastSummary(phase, dosList) {
        var dos = dosList || _getEffectiveDOS();
        if (phase === 'ready') {
            return '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;">' +
                '<div style="font-size:11px;color:#3c4043;line-height:1.6;">' +
                    '<strong>' + dos.length + ' integrovaných DO</strong> v působnosti — připraveno k rozeslání' +
                '</div></div>';
        }
        if (phase === 'sent') {
            return '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;">' +
                '<div style="font-size:11px;color:#3c4043;line-height:1.6;">' +
                    '<strong>Rozesláno ' + dos.length + ' DO</strong> · ' +
                    '<span style="color:#1a73e8;font-weight:500;">' + dos.length + ' čeká na posouzení dotčenosti</span>' +
                '</div></div>';
        }
        var cDotcen = 0, cNedotcen = 0, cCeka = 0;
        dos.forEach(function (d) {
            if (d.kontrola === 'dotcen') cDotcen++;
            else if (d.kontrola === 'nedotcen') cNedotcen++;
            else cCeka++;
        });
        if (phase === 'kontrola') {
            return '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;">' +
                '<div style="font-size:11px;color:#3c4043;line-height:1.6;">' +
                    '<strong>Posouzení dotčenosti ' + dos.length + ' DO</strong> · ' +
                    '<span style="color:#1e8e3e;font-weight:500;">' + cDotcen + ' dotčen</span> · ' +
                    '<span style="color:#9aa0a6;">' + cNedotcen + ' nedotčen</span>' +
                    (cCeka > 0 ? ' · <span style="color:#e37400;font-weight:500;">' + cCeka + ' čeká</span>' : '') +
                '</div></div>';
        }
        // vyjadreni / done
        var cHotovo = 0, cZpracovava = 0;
        dos.forEach(function (d) {
            if (d.kontrola !== 'dotcen') return;
            if (d.vyjadreni === 'hotovo') cHotovo++;
            else cZpracovava++;
        });
        return '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;">' +
            '<div style="font-size:11px;color:#3c4043;line-height:1.6;">' +
                '<strong>Kontrola podkladů: ' + cDotcen + ' dotčených DO</strong> · ' +
                '<span style="color:#1e8e3e;font-weight:500;">' + cHotovo + ' kompletní</span>' +
                (cZpracovava > 0 ? ' · <span style="color:#e37400;font-weight:500;">' + cZpracovava + ' kontroluje</span>' : '') +
                ' · <span style="color:#9aa0a6;">' + cNedotcen + ' nedotčen</span>' +
            '</div></div>';
    }

    /** Akční tlačítko pro přechod do další fáze */
    function generatePhaseAction(phase) {
        var actions = {
            ready:     { icon: 'send',        label: 'Rozeslat podklady všem DO',              next: 'sent' },
            sent:      { icon: 'fast_forward', label: 'Simulovat: DO posoudí dotčenost',    next: 'kontrola' },
            kontrola:  { icon: 'fast_forward', label: 'Simulovat: DO zkontrolují podklady', next: 'vyjadreni' },
            vyjadreni: { icon: 'fast_forward', label: 'Simulovat: kontrola dokončena',      next: 'done' }
        };
        if (!actions[phase]) return '';
        var a = actions[phase];
        return '<div style="text-align:' + (phase === 'ready' ? 'center' : 'right') + ';margin-top:12px;">' +
            '<button class="vz-phase-action" onclick="advanceBroadcastPhase(\'' + a.next + '\')">' +
                '<span class="material-icons-outlined">' + a.icon + '</span> ' + a.label +
            '</button></div>';
    }

    function generateBroadcastContent() {
        _loadPhase();
        var phase = _broadcastPhase;
        var effectiveDOS = _getEffectiveDOS();
        var html = '';
        // Phase stepper
        html += generatePhaseStepper(phase);
        // Banner
        html += generateBroadcastBanner(phase);
        // Deadline bar
        html += generateDeadlineBar(phase);
        // DO list
        html += '<div id="vzBroadcastDOList" style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin-bottom:12px;">' +
            '<div style="padding:8px 12px;background:#fafafa;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="font-size:11px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.3px;">Integrované DO v působnosti</div>' +
                '<div style="font-size:10px;color:#9aa0a6;">' + effectiveDOS.length + ' orgánů</div>' +
            '</div>';
        effectiveDOS.forEach(function (doItem) {
            html += generateBroadcastDOItem(doItem, phase);
        });
        html += '</div>';
        // Summary
        html += generateBroadcastSummary(phase, effectiveDOS);
        // Action button
        html += generatePhaseAction(phase);
        return html;
    }

    // ======================================================================
    // HTML GENERATORS — CELKOVÝ OBSAH
    // ======================================================================

    function generateContent() {
        var html = '';
        // Koordinátor rozesílá všem integrovaným DO — ruční identifikace odstraněna
        html += '<div id="vzSubModeRozeslat">';
        html += generateBroadcastContent();
        html += '</div>';
        return html;
    }

    // ======================================================================
    // INTERACTIVE FUNCTIONS (exposed globally for onclick handlers)
    // ======================================================================

    /** Přepínání podscénáře: ruční vs. rozeslat */
    window.switchVZSubMode = function (subMode) {
        var btnR = document.getElementById('vzSubBtnRucni');
        var btnB = document.getElementById('vzSubBtnRozeslat');
        var panelR = document.getElementById('vzSubModeRucni');
        var panelB = document.getElementById('vzSubModeRozeslat');
        if (!btnR || !btnB || !panelR || !panelB) return;

        if (subMode === 'rozeslat') {
            btnB.classList.add('active');
            btnR.classList.remove('active');
            panelB.style.display = '';
            panelR.style.display = 'none';
        } else {
            btnR.classList.add('active');
            btnB.classList.remove('active');
            panelR.style.display = '';
            panelB.style.display = 'none';
        }
    };

    /** Přechod do další fáze workflow rozeslání */
    window.advanceBroadcastPhase = function (nextPhase) {
        _broadcastPhase = nextPhase;
        // Uložit fázi do sdíleného stavu
        if (typeof ISSRState !== 'undefined') {
            ISSRState.setPhase(nextPhase);
        }
        var panel = document.getElementById('vzSubModeRozeslat');
        if (panel) {
            panel.innerHTML = generateBroadcastContent();
        }
        refreshDashboard();
    };

    /**
     * Přepínání způsobu posouzení (toggle):
     *   suggested (modrá) → klik → confirmed (zelená)
     *   confirmed (zelená) → klik → neutral (šedá)
     *   neutral   (šedá)   → klik → confirmed (zelená)
     * Multi-select: lze potvrdit více způsobů současně.
     */
    window.toggleVZMethod = function (btn, vzId, method) {
        var item = btn.closest('.vz-ident-item');
        if (!item) return;

        var confirmed = parseList(item.getAttribute('data-vz-confirmed'));
        var touched   = parseList(item.getAttribute('data-vz-touched'));
        var defaults  = parseList(item.getAttribute('data-vz-defaults'));

        // Označit jako interagované
        if (touched.indexOf(method) < 0) touched.push(method);

        // Toggle potvrzení
        var idx = confirmed.indexOf(method);
        if (idx >= 0) {
            confirmed.splice(idx, 1);   // byl confirmed → odebrat
        } else {
            confirmed.push(method);      // nebyl confirmed → přidat
        }

        item.setAttribute('data-vz-confirmed', confirmed.join(','));
        item.setAttribute('data-vz-touched', touched.join(','));

        // Aktualizovat CSS třídy všech tlačítek v této položce
        item.querySelectorAll('.vz-method-option').forEach(function (opt) {
            var m = opt.getAttribute('data-method');
            opt.classList.remove('suggested', 'confirmed');
            if (confirmed.indexOf(m) >= 0) {
                opt.classList.add('confirmed');
            } else if (defaults.indexOf(m) >= 0 && touched.indexOf(m) < 0) {
                opt.classList.add('suggested');
            }
        });

        updateVZIdentSummary();
    };

    window.removeVZItem = function (btn) {
        var item = btn.closest('.vz-ident-item');
        if (item) {
            item.style.transition = 'opacity 0.2s, max-height 0.3s';
            item.style.opacity = '0';
            item.style.maxHeight = '0';
            item.style.overflow = 'hidden';
            item.style.marginBottom = '0';
            item.style.padding = '0 12px';
            setTimeout(function () { item.remove(); updateVZIdentSummary(); }, 300);
        }
    };

    window.openVZCatalog = function () {
        var cat = document.getElementById('vzCatalog');
        if (cat) cat.style.display = cat.style.display === 'none' ? '' : 'none';
    };

    window.addVZFromCatalog = function (id, name, desc, icon, color) {
        var existing = document.querySelector('.vz-ident-item[data-vz-id="' + id + '"]');
        if (existing) return;
        var list = document.getElementById('vzIdentifikaceList');
        if (!list) return;
        var item = { id: id, name: name, icon: icon, color: color, desc: desc, defaultMethods: [] };
        list.insertAdjacentHTML('beforeend', generateItem(item));
        // Skrýt v katalogu
        var catItem = document.querySelector('.vz-catalog-item[onclick*="\'' + id + '\'"]');
        if (catItem) catItem.style.display = 'none';
        updateVZIdentSummary();
    };

    function updateVZIdentSummary() {
        var items = document.querySelectorAll('.vz-ident-item');
        var total = items.length;
        var confirmedItems = 0;
        var counts = { interni: 0, prilozeno: 0, vyzadat: 0 };

        items.forEach(function (item) {
            var confirmed = parseList(item.getAttribute('data-vz-confirmed'));
            if (confirmed.length > 0) {
                confirmedItems++;
                confirmed.forEach(function (m) {
                    if (counts[m] !== undefined) counts[m]++;
                });
            }
        });

        var el = document.getElementById('vzIdentSummary');
        if (!el) return;

        var unconfirmed = total - confirmedItems;
        var html = '<strong>Identifikováno ' + total + ' veřejných zájmů</strong>';

        if (confirmedItems > 0) {
            var parts = [];
            if (counts.interni)   parts.push(counts.interni + '× interní');
            if (counts.prilozeno) parts.push(counts.prilozeno + '× přiloženo');
            if (counts.vyzadat)   parts.push(counts.vyzadat + '× vyžádat');
            html += ' · potvrzeno ' + confirmedItems + '/' + total;
            if (parts.length) html += ': ' + parts.join(' · ');
        }

        if (unconfirmed > 0) {
            html += ' · <span style="color:#1a73e8;">' + unconfirmed + ' čeká na potvrzení</span>';
        }

        el.innerHTML = html;
    }
    window.updateVZIdentSummary = updateVZIdentSummary;

    // ======================================================================
    // DASHBOARD — levý panel úředníka (přehled stavu DO)
    // ======================================================================

    var _dashboardCssInjected = false;

    function injectDashboardCSS() {
        if (_dashboardCssInjected) return;
        _dashboardCssInjected = true;
        var s = document.createElement('style');
        s.textContent =
            '.vz-dash { font-family: inherit; height:100%; display:flex; flex-direction:column; }\n' +
            '.vz-dash-header { padding:16px 20px 12px; border-bottom:1px solid #e0e0e0; background:#fafafa; flex-shrink:0; }\n' +
            '.vz-dash-title { font-size:14px; font-weight:600; color:#202124; display:flex; align-items:center; gap:8px; margin-bottom:10px; }\n' +
            '.vz-dash-title .material-icons-outlined { font-size:20px; color:#004289; }\n' +
            '.vz-dash-stats { display:flex; gap:4px; flex-wrap:wrap; }\n' +
            '.vz-dash-stat { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; }\n' +
            '.vz-dash-stat.total { background:#e8f0fe; color:#004289; }\n' +
            '.vz-dash-stat.dotcen { background:#e6f4ea; color:#1e8e3e; }\n' +
            '.vz-dash-stat.nedotcen { background:#f1f3f4; color:#9aa0a6; }\n' +
            '.vz-dash-stat.ceka { background:#fef7e0; color:#e37400; }\n' +
            '.vz-dash-stat.hotovo { background:#e6f4ea; color:#137333; }\n' +
            /* Phase mini bar */
            '.vz-dash-phase { padding:10px 20px; border-bottom:1px solid #e0e0e0; flex-shrink:0; display:flex; gap:0; }\n' +
            '.vz-dash-phase-step { flex:1; text-align:center; font-size:9px; padding:6px 2px; color:#9aa0a6; position:relative; }\n' +
            '.vz-dash-phase-step .material-icons-outlined { display:block; font-size:14px; margin:0 auto 1px; }\n' +
            '.vz-dash-phase-step.active { color:#004289; font-weight:600; }\n' +
            '.vz-dash-phase-step.done { color:#1e8e3e; }\n' +
            '.vz-dash-phase-step::after { content:""; position:absolute; top:50%; right:0; width:calc(100% - 24px); height:2px; background:#e0e0e0; transform:translateX(50%); }\n' +
            '.vz-dash-phase-step:last-child::after { display:none; }\n' +
            '.vz-dash-phase-step.done::after { background:#1e8e3e; }\n' +
            '.vz-dash-phase-step.active::after { background:linear-gradient(90deg,#004289 50%,#e0e0e0 50%); }\n' +
            /* DO list */
            '.vz-dash-list { flex:1; overflow-y:auto; padding:8px 12px; }\n' +
            '.vz-dash-card { border:1px solid #e0e0e0; border-radius:10px; padding:10px 12px; margin-bottom:8px; background:#fff; transition:all 0.15s; cursor:default; }\n' +
            '.vz-dash-card:hover { border-color:#c2dbf4; box-shadow:0 1px 4px rgba(0,66,137,0.08); }\n' +
            '.vz-dash-card.nedotcen { opacity:0.55; }\n' +
            '.vz-dash-card-top { display:flex; align-items:center; gap:8px; margin-bottom:6px; }\n' +
            '.vz-dash-card-icon { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }\n' +
            '.vz-dash-card-icon .material-icons-outlined { font-size:16px; }\n' +
            '.vz-dash-card-name { font-size:12px; font-weight:600; color:#202124; flex:1; min-width:0; }\n' +
            '.vz-dash-card-usek { font-size:10px; font-weight:700; color:#5f6368; background:#f1f3f4; padding:2px 6px; border-radius:3px; flex-shrink:0; }\n' +
            '.vz-dash-card-mid { display:flex; align-items:center; gap:6px; margin-bottom:5px; }\n' +
            '.vz-dash-card-person { font-size:10px; color:#5f6368; display:flex; align-items:center; gap:3px; }\n' +
            '.vz-dash-card-person .material-icons-outlined { font-size:12px; }\n' +
            '.vz-dash-card-bottom { display:flex; align-items:center; justify-content:space-between; gap:6px; }\n' +
            /* DO progress dots */
            '.vz-dash-dots { display:flex; align-items:center; gap:3px; }\n' +
            '.vz-dash-dot { width:8px; height:8px; border-radius:50%; background:#e0e0e0; flex-shrink:0; }\n' +
            '.vz-dash-dot.done { background:#1e8e3e; }\n' +
            '.vz-dash-dot.active { background:#004289; box-shadow:0 0 0 2px rgba(0,66,137,0.2); }\n' +
            '.vz-dash-dot.skip { background:#e0e0e0; position:relative; }\n' +
            '.vz-dash-dot.skip::after { content:"—"; position:absolute; top:-7px; left:0; font-size:8px; color:#9aa0a6; }\n' +
            '.vz-dash-dot-sep { width:10px; height:2px; background:#e0e0e0; flex-shrink:0; }\n' +
            '.vz-dash-dot-sep.done { background:#1e8e3e; }\n' +
            /* Status badge in card */
            '.vz-dash-badge { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:600; white-space:nowrap; }\n' +
            '.vz-dash-badge.b-ready { background:#f1f3f4; color:#9aa0a6; }\n' +
            '.vz-dash-badge.b-sent { background:#e8f0fe; color:#004289; }\n' +
            '.vz-dash-badge.b-dotcen { background:#e6f4ea; color:#1e8e3e; }\n' +
            '.vz-dash-badge.b-nedotcen { background:#f1f3f4; color:#9aa0a6; }\n' +
            '.vz-dash-badge.b-ceka { background:#fef7e0; color:#e37400; }\n' +
            '.vz-dash-badge.b-komplet { background:#e6f4ea; color:#137333; }\n' +
            '.vz-dash-badge.b-kontroluje { background:#e8f0fe; color:#004289; }\n' +
            '.vz-dash-badge.b-done { background:#e6f4ea; color:#137333; }\n' +
            /* Link button in card */
            '.vz-dash-link { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:4px; color:#9aa0a6; text-decoration:none; flex-shrink:0; transition:all .15s; }\n' +
            '.vz-dash-link:hover { background:#e8f0fe; color:#004289; }\n';
        document.head.appendChild(s);
    }

    /** Vrátí stav jednoho DO podle globální fáze */
    function getDOPhaseInfo(doItem, phase) {
        var phaseIdx = ['ready','sent','kontrola','vyjadreni','done'].indexOf(phase);
        var badge = '', badgeCls = '', dots = [], note = '';

        // Dot states: 0=future, 1=done, 2=active, 3=skip
        // Dots: [Rozesláno, Dotčenost, Kontrola podkladů, Hotovo]
        if (phaseIdx <= 0) {
            badge = 'Připraveno'; badgeCls = 'b-ready';
            dots = [0,0,0,0];
        } else if (phaseIdx === 1) {
            badge = 'Rozesláno'; badgeCls = 'b-sent';
            dots = [2,0,0,0];
        } else if (phaseIdx === 2) {
            // Dotčenost phase
            if (doItem.kontrola === 'dotcen') {
                badge = 'Dotčen'; badgeCls = 'b-dotcen';
                note = doItem.kontrolaNote || '';
                dots = [1,2,0,0];
            } else if (doItem.kontrola === 'nedotcen') {
                badge = 'Nedotčen'; badgeCls = 'b-nedotcen';
                note = doItem.kontrolaNote || '';
                dots = [1,1,3,3]; // skip remaining
            } else {
                badge = 'Posuzuje'; badgeCls = 'b-ceka';
                dots = [1,2,0,0];
            }
        } else if (phaseIdx === 3) {
            // Kontrola podkladů phase
            if (doItem.kontrola === 'nedotcen') {
                badge = 'Nedotčen'; badgeCls = 'b-nedotcen';
                dots = [1,1,3,3];
            } else if (doItem.kontrola === 'ceka') {
                badge = 'Čeká na posouzení'; badgeCls = 'b-ceka';
                dots = [1,2,0,0];
            } else if (doItem.vyjadreni === 'hotovo') {
                badge = 'Podklady kompletní'; badgeCls = 'b-komplet';
                note = doItem.vyjadreniNote || '';
                dots = [1,1,1,0];
            } else {
                badge = 'Kontroluje podklady'; badgeCls = 'b-kontroluje';
                note = doItem.kontrolaNote || '';
                dots = [1,1,2,0];
            }
        } else {
            // Done
            if (doItem.kontrola === 'nedotcen') {
                badge = 'Nedotčen'; badgeCls = 'b-nedotcen';
                dots = [1,1,3,3];
            } else {
                badge = 'Vypořádáno'; badgeCls = 'b-done';
                note = doItem.vyjadreniNote || doItem.kontrolaNote || '';
                dots = [1,1,1,1];
            }
        }

        return { badge: badge, badgeCls: badgeCls, dots: dots, note: note };
    }

    function generateDashboardCard(doItem, phase) {
        var info = getDOPhaseInfo(doItem, phase);
        var isNedotcen = info.badgeCls === 'b-nedotcen';

        // Progress dots
        var dotLabels = ['Rozesl.', 'Dotčen.', 'Podkl.', 'Hotovo'];
        var dotsHtml = '<div class="vz-dash-dots" title="' + dotLabels.join(' → ') + '">';
        info.dots.forEach(function (state, i) {
            if (i > 0) dotsHtml += '<div class="vz-dash-dot-sep' + (state === 1 || info.dots[i-1] === 1 ? ' done' : '') + '"></div>';
            var cls = state === 1 ? ' done' : state === 2 ? ' active' : state === 3 ? ' skip' : '';
            dotsHtml += '<div class="vz-dash-dot' + cls + '"></div>';
        });
        dotsHtml += '</div>';

        var linkHtml = '';
        if (doItem.page) {
            linkHtml = '<a href="' + doItem.page + '" target="_blank" class="vz-dash-link" title="Otevřít detail DO">' +
                '<span class="material-icons-outlined" style="font-size:14px;">open_in_new</span></a>';
        }

        return '<div class="vz-dash-card' + (isNedotcen ? ' nedotcen' : '') + '">' +
            '<div class="vz-dash-card-top">' +
                '<div class="vz-dash-card-icon" style="background:' + doItem.color + '18;">' +
                    '<span class="material-icons-outlined" style="color:' + doItem.color + ';">' + doItem.icon + '</span>' +
                '</div>' +
                '<div class="vz-dash-card-name">' + doItem.name + '</div>' +
                '<div class="vz-dash-card-usek">' + (doItem.usek || '') + '</div>' +
            '</div>' +
            '<div class="vz-dash-card-mid">' +
                '<span class="vz-dash-card-person"><span class="material-icons-outlined">person</span> ' + (doItem.prispevatel || doItem.org) + '</span>' +
            '</div>' +
            '<div class="vz-dash-card-bottom">' +
                dotsHtml +
                '<div style="display:flex;align-items:center;gap:4px;">' +
                    '<span class="vz-dash-badge ' + info.badgeCls + '">' + info.badge + '</span>' +
                    linkHtml +
                '</div>' +
            '</div>' +
            (info.note ? '<div style="font-size:10px;color:#5f6368;margin-top:4px;padding-top:4px;border-top:1px solid #f0f0f0;">' + info.note + '</div>' : '') +
        '</div>';
    }

    function generateDashboardHTML() {
        _loadPhase();
        var phase = _broadcastPhase;
        var phaseIdx = ['ready','sent','kontrola','vyjadreni','done'].indexOf(phase);
        var effectiveDOS = _getEffectiveDOS();

        // Compute stats
        var total = effectiveDOS.length;
        var cDotcen = 0, cNedotcen = 0, cCeka = 0, cHotovo = 0;
        effectiveDOS.forEach(function (d) {
            if (d.kontrola === 'dotcen') { cDotcen++; if (d.vyjadreni === 'hotovo') cHotovo++; }
            else if (d.kontrola === 'nedotcen') cNedotcen++;
            else cCeka++;
        });

        var html = '<div class="vz-dash">';

        // Header with stats
        html += '<div class="vz-dash-header">';
        html += '<div class="vz-dash-title"><span class="material-icons-outlined">dashboard</span> Přehled interních DO</div>';
        html += '<div class="vz-dash-stats">';
        html += '<span class="vz-dash-stat total">' + total + ' DO celkem</span>';
        if (phaseIdx >= 2) {
            html += '<span class="vz-dash-stat dotcen">' + cDotcen + ' dotčeno</span>';
            html += '<span class="vz-dash-stat nedotcen">' + cNedotcen + ' nedotčeno</span>';
            if (cCeka > 0) html += '<span class="vz-dash-stat ceka">' + cCeka + ' čeká</span>';
        }
        if (phaseIdx >= 3 && cHotovo > 0) {
            html += '<span class="vz-dash-stat hotovo">' + cHotovo + '/' + cDotcen + ' kompletní</span>';
        }
        html += '</div></div>';

        // Mini phase bar
        var phaseLabels = [
            { icon: 'edit_note',  label: 'Příprava' },
            { icon: 'send',       label: 'Rozesláno' },
            { icon: 'gpp_maybe',  label: 'Dotčenost' },
            { icon: 'fact_check', label: 'Podklady' },
            { icon: 'verified',   label: 'Hotovo' }
        ];
        html += '<div class="vz-dash-phase">';
        phaseLabels.forEach(function (p, i) {
            var cls = i < phaseIdx ? ' done' : i === phaseIdx ? ' active' : '';
            html += '<div class="vz-dash-phase-step' + cls + '"><span class="material-icons-outlined">' + p.icon + '</span>' + p.label + '</div>';
        });
        html += '</div>';

        // DO cards
        html += '<div class="vz-dash-list">';
        effectiveDOS.forEach(function (doItem) {
            html += generateDashboardCard(doItem, phase);
        });
        html += '</div>';

        html += '</div>';
        return html;
    }

    var _dashboardContainerId = null;

    function renderDashboard(containerId) {
        injectDashboardCSS();
        _dashboardContainerId = containerId;
        var el = document.getElementById(containerId);
        if (el) el.innerHTML = generateDashboardHTML();
    }

    function refreshDashboard() {
        if (_dashboardContainerId) renderDashboard(_dashboardContainerId);
    }

    // ======================================================================
    // INIT
    // ======================================================================

    /**
     * Inicializace sdíleného VZ obsahu.
     * @param {string} containerId - ID kontejneru, do kterého se vloží identifikace VZ
     */
    window.VZShared = {
        init: function (containerId) {
            injectCSS();
            _loadPhase(); // načíst fázi z ISSRState
            var container = document.getElementById(containerId);
            if (!container) { console.error('VZShared: container #' + containerId + ' not found'); return; }
            container.innerHTML = generateContent();
            updateVZIdentSummary();
        },
        /** Vykreslí dashboard přehledu DO do daného kontejneru */
        renderDashboard: function (containerId) {
            renderDashboard(containerId);
        },
        /** Obnoví broadcast content i dashboard (volat po změně stavu z jiné stránky) */
        refresh: function () {
            _loadPhase();
            var panel = document.getElementById('vzSubModeRozeslat');
            if (panel) panel.innerHTML = generateBroadcastContent();
            refreshDashboard();
        }
    };

})();
