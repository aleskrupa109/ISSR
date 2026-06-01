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
            id: 'obrana',
            name: 'Obrana státu',
            icon: 'security',
            color: '#37474f',
            desc: 'Území vymezené MO — § 175 zák. č. 283/2021 Sb. (ZS zachováno, MO zůstává samostatný DOSS)',
            defaultMethods: ['prilozeno']
        }
    ];

    /** Katalog dalších VZ (přidání uživatelem) */
    var VZ_CATALOG = [
        { id: 'pozarni', name: 'Požární ochrana', desc: 'HZS kraje — § 31 zák. č. 133/1985 Sb.', icon: 'local_fire_department', color: '#d32f2f' },
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
          kontrola: 'dotcen', kontrolaNote: 'Dotčen — kácení 2 dřevin', kontrolaForma: 'interni',
          vyjadreni: 'hotovo', vyjadreniNote: 'Interní posouzení — bez námitek, podmínky stanoveny',
          page: 'ochrana-prirody-1.html' },
        { name: 'Ochrana lesa', org: 'ÚP Kostelec nad Orlicí', icon: 'park', color: '#558b2f',
          kontrola: 'dotcen', kontrolaNote: 'Dotčen — ochranné pásmo lesa', kontrolaForma: 'externi',
          vyjadreni: 'hotovo', vyjadreniNote: 'Vyžádáno ext. vyjádření → doručeno, bez námitek',
          page: 'ochrana-lesa-1.html' },
        { name: 'Ochrana vod', org: 'ÚP Kostelec nad Orlicí', icon: 'water_drop', color: '#0277bd',
          kontrola: 'dotcen', kontrolaNote: 'Dotčen — záplavové území Q100', kontrolaForma: 'externi',
          vyjadreni: 'ceka', vyjadreniNote: '' },
        { name: 'Památková péče', org: 'ÚP Kostelec nad Orlicí', icon: 'account_balance', color: '#6d4c41',
          kontrola: 'nedotcen', kontrolaNote: 'Záměr mimo ochranné pásmo',
          vyjadreni: null, vyjadreniNote: '' },
        { name: 'Odpadové hospodářství', org: 'ÚP Kostelec nad Orlicí', icon: 'delete_outline', color: '#ef6c00',
          kontrola: 'ceka', kontrolaNote: '',
          vyjadreni: null, vyjadreniNote: '' },
        { name: 'Požární ochrana', org: 'HZS Královéhradeckého kraje', icon: 'local_fire_department', color: '#d32f2f',
          kontrola: 'nedotcen', kontrolaNote: 'Bez požadavků na stavbu',
          vyjadreni: null, vyjadreniNote: '' },
        { name: 'Ochrana veřejného zdraví', org: 'KHS Královéhradeckého kraje', icon: 'health_and_safety', color: '#00838f',
          kontrola: 'dotcen', kontrolaNote: 'Dotčen — hluk ze stavby', kontrolaForma: 'interni',
          vyjadreni: 'ceka', vyjadreniNote: '' },
        { name: 'Obrana státu', org: 'Ministerstvo obrany', icon: 'security', color: '#37474f',
          kontrola: 'dotcen', kontrolaNote: 'ZS přiloženo stavebníkem', kontrolaForma: 'prilozeno',
          vyjadreni: 'hotovo', vyjadreniNote: 'ZS přiloženo k žádosti — bez dalších požadavků' }
    ];

    /** Aktuální fáze workflow rozeslání */
    var _broadcastPhase = 'ready'; // ready → sent → kontrola → vyjadreni → done

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
            { id: 'kontrola',  icon: 'fact_check',    label: 'Kontrola podkladů' },
            { id: 'vyjadreni', icon: 'rate_review',   label: 'Vyjádření DO' },
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
            statusHtml = '<span class="vz-do-status s-kontrola"><span class="material-icons-outlined" style="font-size:12px;">schedule</span> Čeká na kontrolu</span>';
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
                statusHtml = '<span class="vz-do-status s-hotovo"><span class="material-icons-outlined" style="font-size:12px;">check_circle</span> Vyjádření doručeno</span>';
            } else {
                statusHtml = '<span class="vz-do-status s-ceka"><span class="material-icons-outlined" style="font-size:12px;">schedule</span> Zpracovává vyjádření</span>';
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
                text: 'Podklady byly rozeslány. Čeká se na kontrolu podkladů dotčenými orgány.' },
            kontrola: { icon: 'fact_check', bg: '#fef7e0', border: '#fdd835', color: '#e37400', textColor: '#3c4043',
                text: 'Běží lhůta pro kontrolu podkladů. DO posuzují dotčenost a úplnost podkladů. Po uplynutí lhůty může referent vydat vyrozumění o zahájení řízení.' },
            vyjadreni: { icon: 'rate_review', bg: '#e8f0fe', border: '#c2dbf4', color: '#1a73e8', textColor: '#3c4043',
                text: 'Běží lhůta pro vyjádření. Dotčené DO zpracovávají svá vyjádření. Koordinátor sleduje plnění a může urgovat.' },
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
                '<strong>Lhůta pro kontrolu podkladů:</strong> zbývá 12 dní (do 28. 6. 2026)' +
                '<span style="margin-left:auto;font-weight:600;">⏱ 12 d</span></div>';
        } else if (phase === 'vyjadreni') {
            return '<div class="vz-deadline-bar"><span class="material-icons-outlined">timer</span>' +
                '<strong>Lhůta pro vyjádření:</strong> zbývá 24 dní (do 10. 7. 2026)' +
                '<span style="margin-left:auto;font-weight:600;">⏱ 24 d</span></div>';
        }
        return '';
    }

    /** Summary bar — počty podle fáze */
    function generateBroadcastSummary(phase) {
        if (phase === 'ready') {
            return '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;">' +
                '<div style="font-size:11px;color:#3c4043;line-height:1.6;">' +
                    '<strong>' + VZ_BROADCAST_DOS.length + ' integrovaných DO</strong> v působnosti — připraveno k rozeslání' +
                '</div></div>';
        }
        if (phase === 'sent') {
            return '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;">' +
                '<div style="font-size:11px;color:#3c4043;line-height:1.6;">' +
                    '<strong>Rozesláno ' + VZ_BROADCAST_DOS.length + ' DO</strong> · ' +
                    '<span style="color:#1a73e8;font-weight:500;">' + VZ_BROADCAST_DOS.length + ' čeká na kontrolu</span>' +
                '</div></div>';
        }
        var cDotcen = 0, cNedotcen = 0, cCeka = 0;
        VZ_BROADCAST_DOS.forEach(function (d) {
            if (d.kontrola === 'dotcen') cDotcen++;
            else if (d.kontrola === 'nedotcen') cNedotcen++;
            else cCeka++;
        });
        if (phase === 'kontrola') {
            return '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;">' +
                '<div style="font-size:11px;color:#3c4043;line-height:1.6;">' +
                    '<strong>Kontrola podkladů ' + VZ_BROADCAST_DOS.length + ' DO</strong> · ' +
                    '<span style="color:#1e8e3e;font-weight:500;">' + cDotcen + ' dotčen</span> · ' +
                    '<span style="color:#9aa0a6;">' + cNedotcen + ' nedotčen</span>' +
                    (cCeka > 0 ? ' · <span style="color:#e37400;font-weight:500;">' + cCeka + ' čeká</span>' : '') +
                '</div></div>';
        }
        // vyjadreni / done
        var cHotovo = 0, cZpracovava = 0;
        VZ_BROADCAST_DOS.forEach(function (d) {
            if (d.kontrola !== 'dotcen') return;
            if (d.vyjadreni === 'hotovo') cHotovo++;
            else cZpracovava++;
        });
        return '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;">' +
            '<div style="font-size:11px;color:#3c4043;line-height:1.6;">' +
                '<strong>Vyjádření: ' + cDotcen + ' dotčených DO</strong> · ' +
                '<span style="color:#1e8e3e;font-weight:500;">' + cHotovo + ' doručeno</span>' +
                (cZpracovava > 0 ? ' · <span style="color:#e37400;font-weight:500;">' + cZpracovava + ' zpracovává</span>' : '') +
                ' · <span style="color:#9aa0a6;">' + cNedotcen + ' nedotčen</span>' +
            '</div></div>';
    }

    /** Akční tlačítko pro přechod do další fáze */
    function generatePhaseAction(phase) {
        var actions = {
            ready:     { icon: 'send',        label: 'Rozeslat podklady všem DO',         next: 'sent' },
            sent:      { icon: 'fast_forward', label: 'Simulovat: DO provedou kontrolu',   next: 'kontrola' },
            kontrola:  { icon: 'fast_forward', label: 'Simulovat: DO zpracují vyjádření',  next: 'vyjadreni' },
            vyjadreni: { icon: 'fast_forward', label: 'Simulovat: vyjádření doručena',     next: 'done' }
        };
        if (!actions[phase]) return '';
        var a = actions[phase];
        return '<div style="text-align:' + (phase === 'ready' ? 'center' : 'right') + ';margin-top:12px;">' +
            '<button class="vz-phase-action" onclick="advanceBroadcastPhase(\'' + a.next + '\')">' +
                '<span class="material-icons-outlined">' + a.icon + '</span> ' + a.label +
            '</button></div>';
    }

    function generateBroadcastContent() {
        var phase = _broadcastPhase;
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
                '<div style="font-size:10px;color:#9aa0a6;">' + VZ_BROADCAST_DOS.length + ' orgánů</div>' +
            '</div>';
        VZ_BROADCAST_DOS.forEach(function (doItem) {
            html += generateBroadcastDOItem(doItem, phase);
        });
        html += '</div>';
        // Summary
        html += generateBroadcastSummary(phase);
        // Action button
        html += generatePhaseAction(phase);
        return html;
    }

    // ======================================================================
    // HTML GENERATORS — CELKOVÝ OBSAH
    // ======================================================================

    function generateContent() {
        var html = '';
        // Submode selector
        html += generateSubModeSelector();
        // Rozeslat DO (default visible)
        html += '<div id="vzSubModeRozeslat">';
        html += generateBroadcastContent();
        html += '</div>';
        // Ruční identifikace (initially hidden)
        html += '<div id="vzSubModeRucni" style="display:none;">';
        html += generateRucniContent();
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
        var panel = document.getElementById('vzSubModeRozeslat');
        if (panel) {
            panel.innerHTML = generateBroadcastContent();
        }
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
    // INIT
    // ======================================================================

    /**
     * Inicializace sdíleného VZ obsahu.
     * @param {string} containerId - ID kontejneru, do kterého se vloží identifikace VZ
     */
    window.VZShared = {
        init: function (containerId) {
            injectCSS();
            var container = document.getElementById(containerId);
            if (!container) { console.error('VZShared: container #' + containerId + ' not found'); return; }
            container.innerHTML = generateContent();
            updateVZIdentSummary();
        }
    };

})();
