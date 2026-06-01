/**
 * verejne-zajmy-shared.js
 * Sdílený modul pro obsah Veřejné zájmy (Fáze A: Identifikace + Fáze B: Vypořádání).
 * Používá se v povoleni-2.html (kontrola VZ) i koordinator-1.html (rozhraní koordinátora).
 *
 * Použití:
 *   <script src="verejne-zajmy-shared.js"></script>
 *   ...
 *   VZShared.init('containerId', { phaseTabA: '...', phaseTabB: '...', panelTitle: '...', panelDesc: '...' });
 */
(function () {
    'use strict';

    // ======================================================================
    // DATA
    // ======================================================================

    /** Předvyplněné VZ položky (na základě lokality a druhu záměru) */
    var VZ_ITEMS = [
        {
            id: 'opk',
            name: 'Ochrana přírody a krajiny',
            icon: 'eco',
            color: '#2e7d32',
            desc: 'Kácení 2 dřevin na pozemku parc. č. 981/31 — § 8 zák. č. 114/1992 Sb.',
            history: 'Dříve: koordinované ZS MěÚ Kostelec n. O., úsek OPK',
            defaultMethod: 'interni'
        },
        {
            id: 'les',
            name: 'Ochrana lesa',
            icon: 'park',
            color: '#558b2f',
            desc: 'Ochranné pásmo lesa parc. č. 981/31 — § 14 odst. 2 zák. č. 289/1995 Sb.',
            history: 'Dříve: koordinované ZS MěÚ Kostelec n. O., úsek SSL + ZS MěÚ Rychnov n. K. (JES)',
            defaultMethod: 'externi'
        },
        {
            id: 'voda',
            name: 'Ochrana vod',
            icon: 'water_drop',
            color: '#0277bd',
            desc: 'Záplavové území Divoká Orlice, podmínky Povodí Labe — § 17 zák. č. 254/2001 Sb.',
            history: 'Dříve: koordinované ZS MěÚ Kostelec n. O., úsek vodoprávní + souhlasné ZS MěÚ Rychnov (JES)',
            defaultMethod: 'externi'
        },
        {
            id: 'pamatky',
            name: 'Památková péče',
            icon: 'account_balance',
            color: '#6d4c41',
            desc: 'Ochranné pásmo zámku Doudleby n. O., archeologické nálezy — § 14 zák. č. 20/1987 Sb.',
            history: 'Dříve: koordinované ZS MěÚ Kostelec n. O., úsek PP + sdělení MěÚ Rychnov (parcely mimo KP)',
            defaultMethod: 'interni'
        },
        {
            id: 'odpady',
            name: 'Odpadové hospodářství',
            icon: 'delete_outline',
            color: '#ef6c00',
            desc: 'Nakládání s odpady ze stavby — zák. č. 541/2020 Sb.',
            history: 'Dříve: součást JES MěÚ Rychnov n. K.',
            defaultMethod: 'interni'
        },
        {
            id: 'obrana',
            name: 'Obrana státu',
            icon: 'security',
            color: '#37474f',
            desc: 'Území vymezené MO — § 175 zák. č. 283/2021 Sb. (ZS zachováno, MO zůstává samostatný DOSS)',
            history: 'Dříve: souhlasné ZS Ministerstva obrany č.j. MO 103826/2024-1282',
            defaultMethod: 'zs-prilozeno'
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

    /** Demo data pro Fázi B — Vypořádání */
    var VZ_PHASE_B_SECTIONS = [
        {
            key: 'interni',
            title: 'Interní posouzení (přispěvatel)',
            icon: 'person_add',
            iconColor: '#1a73e8',
            iconBg: '#e8f0fe',
            items: [
                {
                    name: 'Ochrana přírody a krajiny', icon: 'eco', color: '#2e7d32',
                    assigneeLabel: 'Přispěvatel',
                    assignee: 'Ing. Jana Nováková (ÚP Kostelec n. O., ref. OPK)',
                    status: 'done', statusIcon: 'check_circle', statusLabel: 'Posouzeno',
                    statusBg: '#e8f5e9', statusColor: '#2e7d32',
                    borderColor: '#c8e6c9', bgColor: '#f9fdf9',
                    detail: '<strong>Interní posudek ze dne 10. 2. 2026</strong> — Kácení 2 ks dřevin povoleno s podmínkou náhradní výsadby 4 ks. Záměr je v souladu s § 8 ZOPK.',
                    detailBg: '#e8f5e9', detailColor: '#2e7d32'
                },
                {
                    name: 'Památková péče', icon: 'account_balance', color: '#6d4c41',
                    assigneeLabel: 'Přispěvatel',
                    assignee: 'Mgr. Petr Dvořák (ÚP Kostelec n. O., ref. PP)',
                    status: 'pending', statusIcon: 'edit_note', statusLabel: 'Přiděleno',
                    statusBg: '#e3f2fd', statusColor: '#1565c0',
                    borderColor: '#bbdefb', bgColor: '#f5f9ff',
                    detail: 'Přiděleno 5. 2. 2026 — čeká na interní posouzení (ochranné pásmo zámku Doudleby, archeologické nálezy)',
                    detailBg: '#e3f2fd', detailColor: '#1565c0',
                    detailBorder: '#bbdefb'
                },
                {
                    name: 'Odpadové hospodářství', icon: 'delete_outline', color: '#ef6c00',
                    assigneeLabel: 'Přispěvatel',
                    assignee: 'Ing. Tomáš Veselý (ÚP Rychnov n. K., ref. ŽP)',
                    status: 'done', statusIcon: 'check_circle', statusLabel: 'Posouzeno',
                    statusBg: '#e8f5e9', statusColor: '#2e7d32',
                    borderColor: '#c8e6c9', bgColor: '#f9fdf9',
                    detail: '<strong>Interní posudek ze dne 8. 2. 2026</strong> — Nakládání s odpady v souladu s plánem. Podmínka: stavební odpad předat oprávněné osobě.',
                    detailBg: '#e8f5e9', detailColor: '#2e7d32'
                }
            ]
        },
        {
            key: 'externi',
            title: 'Vyžádaná vyjádření (externí DOSS)',
            icon: 'outgoing_mail',
            iconColor: '#e65100',
            iconBg: '#fff3e0',
            items: [
                {
                    name: 'Ochrana lesa', icon: 'park', color: '#558b2f',
                    assigneeLabel: null,
                    assignee: 'Orgán státní správy lesů ORP Rychnov n. K.',
                    status: 'done', statusIcon: 'check_circle', statusLabel: 'Vyjádření doručeno',
                    statusBg: '#e8f5e9', statusColor: '#2e7d32',
                    borderColor: '#c8e6c9', bgColor: '#f9fdf9',
                    detail: '<strong>Vyjádření č. SSL-RK/2026/034</strong> ze dne 18. 1. 2026 — souhlas v ochranném pásmu lesa s podmínkou kompenzační výsadby 0,12 ha',
                    detailBg: '#e8f5e9', detailColor: '#2e7d32',
                    checkboxId: 'vzVypCheckLes',
                    checkboxLabel: 'Podmínky splněny',
                    checkboxChecked: true,
                    ownAssessmentLabel: 'Vlastní posouzení zpracovatele:'
                },
                {
                    name: 'Ochrana vod', icon: 'water_drop', color: '#0277bd',
                    assigneeLabel: null,
                    assignee: 'Vodoprávní úřad ORP Kostelec n. O. / Povodí Labe, s.p.',
                    status: 'waiting', statusIcon: 'schedule', statusLabel: 'Čeká na vyjádření',
                    statusBg: '#fff3e0', statusColor: '#e65100',
                    borderColor: '#ffe0b2', bgColor: '#fffaf5',
                    detail: 'Požadavek na vyjádření odeslán 3. 2. 2026 — lhůta do 5. 3. 2026 (zbývá 5 dnů)',
                    detailBg: '#fff8e1', detailColor: '#795548'
                }
            ]
        },
        {
            key: 'zs-prilozeno',
            title: 'ZS přiloženo k žádosti (DOSS zachován)',
            icon: 'attach_file',
            iconColor: '#2e7d32',
            iconBg: '#e8f5e9',
            subtitle: 'Žadatel přiložil ZS k žádosti — zpracovatel ověří platnost a úplnost.',
            items: [
                {
                    name: 'Obrana státu', icon: 'security', color: '#37474f',
                    assigneeLabel: null,
                    assignee: 'Ministerstvo obrany ČR',
                    status: 'done', statusIcon: 'check_circle', statusLabel: 'ZS ověřeno',
                    statusBg: '#e8f5e9', statusColor: '#2e7d32',
                    borderColor: '#c8e6c9', bgColor: '#f9fdf9',
                    detail: '<strong>Souhlasné ZS č.j. MO 103826/2024-1282</strong> — záměr v území vymezeném MO, bez rozporu se zájmy obrany státu.',
                    detailBg: '#e8f5e9', detailColor: '#2e7d32',
                    checkboxId: 'vzVypCheckObrana',
                    checkboxLabel: 'ZS je platné a úplné',
                    checkboxChecked: true,
                    ownAssessmentLabel: 'Ověření zpracovatele:'
                }
            ]
        }
    ];

    // ======================================================================
    // CSS INJECTION
    // ======================================================================

    var _cssInjected = false;

    function injectCSS() {
        if (_cssInjected) return;
        _cssInjected = true;
        var style = document.createElement('style');
        style.textContent =
            '.vz-method-grid { display:flex; flex-direction:column; gap:6px; }\n' +
            '.vz-method-row { display:flex; gap:6px; }\n' +
            '.vz-method-option { transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; padding:5px 10px; border:1px solid #dadce0; border-radius:6px; font-size:11px; cursor:pointer; background:#fff; color:#5f6368; justify-content:center; white-space:nowrap; }\n' +
            '.vz-method-row-ext .vz-method-option { flex:1; }\n' +
            '.vz-method-option.selected { border-color:#1a73e8 !important; background:#e8f0fe !important; color:#1a73e8 !important; font-weight:500; }\n' +
            '.vz-method-option:hover:not(.selected) { border-color:#9aa0a6 !important; background:#f8f9fa !important; }\n' +
            '.vz-ident-item { transition:all 0.2s; }\n' +
            '.vz-remove-btn:hover { color:#d32f2f !important; }\n';
        document.head.appendChild(style);
    }

    // ======================================================================
    // HTML GENERATORS
    // ======================================================================

    function generateMethodGrid(id, selectedMethod) {
        var methods = [
            { key: 'interni', icon: 'person_add', label: 'Interní přispěvatel', row: 1 },
            { key: 'externi', icon: 'outgoing_mail', label: 'Vyjádření', row: 2 },
            { key: 'zs-vyzadat', icon: 'send', label: 'Vyžádat ZS', row: 2 },
            { key: 'zs-prilozeno', icon: 'attach_file', label: 'ZS přiloženo', row: 2 }
        ];
        var row1 = '', row2 = '';
        methods.forEach(function (m) {
            var sel = m.key === selectedMethod ? ' selected' : '';
            var html = '<label class="vz-method-option' + sel + '" onclick="setVZMethod(this,\'' + id + '\',\'' + m.key + '\')">' +
                '<span class="material-icons-outlined" style="font-size:14px;">' + m.icon + '</span> ' + m.label +
                '</label>';
            if (m.row === 1) row1 += html;
            else row2 += html;
        });
        return '<div class="vz-method-grid">' +
            '<div class="vz-method-row">' + row1 + '</div>' +
            '<div class="vz-method-row vz-method-row-ext">' + row2 + '</div>' +
            '</div>';
    }

    function generatePhaseAItem(item) {
        return '<div class="vz-ident-item" data-vz-id="' + item.id + '" data-vz-method="' + item.defaultMethod + '" style="border:1px solid #e0e0e0;border-radius:8px;padding:12px;margin-bottom:8px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">' +
                '<div style="flex:1;">' +
                    '<div style="font-size:13px;font-weight:600;color:#202124;">' +
                        '<span class="material-icons-outlined" style="font-size:15px;vertical-align:middle;color:' + item.color + ';margin-right:4px;">' + item.icon + '</span> ' +
                        item.name +
                    '</div>' +
                    '<div style="font-size:11px;color:#5f6368;margin-top:3px;">' + item.desc + '</div>' +
                    (item.history ? '<div style="font-size:10px;color:#9aa0a6;margin-top:2px;">' + item.history + '</div>' : '') +
                '</div>' +
                '<button class="vz-remove-btn" onclick="removeVZItem(this)" title="Odebrat" style="background:none;border:none;cursor:pointer;padding:4px;color:#9aa0a6;">' +
                    '<span class="material-icons-outlined" style="font-size:16px;">close</span>' +
                '</button>' +
            '</div>' +
            generateMethodGrid(item.id, item.defaultMethod) +
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

    function generatePhaseA() {
        var html = '<div id="vzPhaseA">';
        // Info banner
        html += '<div style="padding:10px 12px;background:#e8f0fe;border:1px solid #c2dbf4;border-radius:8px;margin-bottom:16px;display:flex;align-items:flex-start;gap:8px;">' +
            '<span class="material-icons-outlined" style="font-size:16px;color:#1a73e8;margin-top:1px;">info</span>' +
            '<div style="font-size:11px;color:#3c4043;line-height:1.5;">' +
                'Systém předvyplnil veřejné zájmy na základě lokality a druhu záměru. U každého zvolte způsob posouzení. Další zájmy můžete přidat z katalogu.' +
            '</div></div>';
        // Items list
        html += '<div id="vzIdentifikaceList">';
        VZ_ITEMS.forEach(function (item) {
            html += generatePhaseAItem(item);
        });
        html += '</div>';
        // Add from catalog button
        html += '<div style="margin-top:12px;">' +
            '<button class="btn btn-secondary" onclick="openVZCatalog()" id="vzAddBtn" style="width:100%;justify-content:center;gap:6px;border-style:dashed;">' +
                '<span class="material-icons-outlined" style="font-size:16px;">add_circle_outline</span> Přidat další veřejný zájem z katalogu' +
            '</button></div>';
        // Catalog dropdown
        html += generateCatalog();
        // Summary
        html += '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;margin-top:16px;">' +
            '<div style="font-size:11px;color:#3c4043;line-height:1.6;" id="vzIdentSummary">' +
                '<strong>Identifikováno 6 veřejných zájmů:</strong> 3× interní přispěvatel · 2× vyžádat vyjádření · 0× vyžádat ZS · 1× ZS přiloženo' +
            '</div></div>';
        html += '</div>';
        return html;
    }

    function generatePhaseBItem(item) {
        var html = '<div class="vz-vyp-item" style="border:1px solid ' + item.borderColor + ';border-radius:8px;padding:12px;margin-bottom:8px;background:' + item.bgColor + ';">';
        html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
        html += '<div>';
        html += '<div style="font-size:13px;font-weight:600;color:#202124;">' +
            '<span class="material-icons-outlined" style="font-size:15px;vertical-align:middle;color:' + item.color + ';margin-right:4px;">' + item.icon + '</span> ' +
            item.name + '</div>';
        html += '<div style="font-size:11px;color:#5f6368;margin-top:2px;">';
        if (item.assigneeLabel) html += item.assigneeLabel + ': ';
        html += '<strong>' + item.assignee + '</strong></div>';
        html += '</div>';
        html += '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:' + item.statusBg + ';color:' + item.statusColor + ';">' +
            '<span class="material-icons-outlined" style="font-size:14px;">' + item.statusIcon + '</span> ' + item.statusLabel + '</span>';
        html += '</div>';
        // Detail
        var detailBorder = item.detailBorder ? 'border:1px solid ' + item.detailBorder + ';' : '';
        html += '<div style="margin-top:8px;padding:8px;background:' + item.detailBg + ';' + detailBorder + 'border-radius:4px;font-size:11px;color:' + item.detailColor + ';">' + item.detail + '</div>';
        // Checkbox
        if (item.checkboxId) {
            html += '<div style="margin-top:8px;display:flex;align-items:center;gap:8px;">';
            html += '<span style="font-size:11px;font-weight:500;color:#5f6368;">' + item.ownAssessmentLabel + '</span>';
            html += '<label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;">';
            html += '<input type="checkbox" id="' + item.checkboxId + '"' + (item.checkboxChecked ? ' checked' : '') + ' onchange="updateVZVyporadani()"> ' + item.checkboxLabel;
            html += '</label></div>';
        }
        html += '</div>';
        return html;
    }

    function generatePhaseB() {
        var html = '<div id="vzPhaseB" style="display:none;">';
        VZ_PHASE_B_SECTIONS.forEach(function (section) {
            html += '<div class="control-section" style="margin-bottom:20px;">';
            // Section header
            html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">';
            html += '<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:' + section.iconBg + ';"><span class="material-icons-outlined" style="font-size:14px;color:' + section.iconColor + ';">' + section.icon + '</span></span>';
            html += '<div class="control-section-title" style="margin:0;">' + section.title + '</div>';
            html += '<span style="font-size:10px;color:#5f6368;background:#f1f3f4;padding:2px 8px;border-radius:10px;">' + section.items.length + ' oblast' + (section.items.length === 1 ? '' : section.items.length < 5 ? 'i' : 'í') + '</span>';
            html += '</div>';
            // Subtitle
            if (section.subtitle) {
                html += '<p style="font-size:11px;color:#5f6368;margin:-6px 0 12px 30px;">' + section.subtitle + '</p>';
            }
            // Items
            section.items.forEach(function (item) {
                html += generatePhaseBItem(item);
            });
            html += '</div>';
        });
        // Summary
        html += '<div style="padding:12px;background:#f0f7ff;border:1px solid #c2dbf4;border-radius:8px;margin-top:8px;">';
        html += '<div style="font-size:12px;color:#1a73e8;font-weight:600;margin-bottom:4px;">';
        html += '<span class="material-icons-outlined" style="font-size:14px;vertical-align:middle;">summarize</span> Souhrn vypořádání</div>';
        html += '<div style="font-size:11px;color:#3c4043;line-height:1.6;" id="vzVyporadaniSummary">';
        html += 'Interní: 2/3 posouzeno · Vyjádření: 1/2 doručeno · ZS přiloženo: 1/1 ověřeno · <strong style="color:#e65100;">Celkem: 4/6 vypořádáno</strong>';
        html += '</div></div>';
        html += '</div>';
        return html;
    }

    // ======================================================================
    // INTERACTIVE FUNCTIONS (exposed globally for onclick handlers)
    // ======================================================================

    var _vzCurrentPhase = 'A';
    var _vzOptions = {};

    window.switchVZPhase = function (phase) {
        _vzCurrentPhase = phase;
        var panelA = document.getElementById('vzPhaseA');
        var panelB = document.getElementById('vzPhaseB');
        if (panelA) panelA.style.display = phase === 'A' ? '' : 'none';
        if (panelB) panelB.style.display = phase === 'B' ? '' : 'none';

        // Update external phase tab buttons if configured
        if (_vzOptions.phaseTabA) {
            var tabA = document.getElementById(_vzOptions.phaseTabA);
            if (tabA) { tabA.classList.toggle('active', phase === 'A'); }
        }
        if (_vzOptions.phaseTabB) {
            var tabB = document.getElementById(_vzOptions.phaseTabB);
            if (tabB) { tabB.classList.toggle('active', phase === 'B'); }
        }
        // Update external panel title/desc if configured
        if (_vzOptions.panelTitle) {
            var title = document.getElementById(_vzOptions.panelTitle);
            if (title) {
                title.textContent = phase === 'A'
                    ? 'Identifikace dotčených veřejných zájmů'
                    : 'Vypořádání veřejných zájmů';
            }
        }
        if (_vzOptions.panelDesc) {
            var desc = document.getElementById(_vzOptions.panelDesc);
            if (desc) {
                desc.textContent = phase === 'A'
                    ? 'Určete, které veřejné zájmy jsou záměrem dotčeny a jakým způsobem budou posouzeny.'
                    : 'Sledujte stav posouzení u jednotlivých veřejných zájmů.';
            }
        }
    };

    window.setVZMethod = function (labelEl, vzId, method) {
        var item = labelEl.closest('.vz-ident-item');
        if (!item) return;
        item.setAttribute('data-vz-method', method);
        item.querySelectorAll('.vz-method-option').forEach(function (opt) {
            opt.classList.remove('selected');
        });
        labelEl.classList.add('selected');
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
        var item = { id: id, name: name, icon: icon, color: color, desc: desc, history: '', defaultMethod: 'interni' };
        list.insertAdjacentHTML('beforeend', generatePhaseAItem(item));
        // Hide catalog item
        var catItem = document.querySelector('.vz-catalog-item[onclick*="\'' + id + '\'"]');
        if (catItem) catItem.style.display = 'none';
        updateVZIdentSummary();
    };

    function updateVZIdentSummary() {
        var items = document.querySelectorAll('.vz-ident-item');
        var counts = { interni: 0, externi: 0, 'zs-vyzadat': 0, 'zs-prilozeno': 0 };
        items.forEach(function (item) {
            var m = item.getAttribute('data-vz-method');
            if (counts[m] !== undefined) counts[m]++;
        });
        var total = items.length;
        var el = document.getElementById('vzIdentSummary');
        if (el) {
            el.innerHTML = '<strong>Identifikováno ' + total + ' veřejných zájmů:</strong> ' +
                counts.interni + '× interní přispěvatel · ' +
                counts.externi + '× vyžádat vyjádření · ' +
                counts['zs-vyzadat'] + '× vyžádat ZS · ' +
                counts['zs-prilozeno'] + '× ZS přiloženo';
        }
    }
    window.updateVZIdentSummary = updateVZIdentSummary;

    window.updateVZVyporadani = function () {
        // Demo only — in real app this would track actual statuses
    };

    // ======================================================================
    // INIT
    // ======================================================================

    /**
     * Inicializace sdíleného VZ obsahu.
     * @param {string} containerId - ID kontejneru, do kterého se vloží Phase A + Phase B
     * @param {object} [options] - Volitelné napojení na vnější prvky stránky:
     *   phaseTabA, phaseTabB  — ID tlačítek záložek fází (pro toggle active třídy)
     *   panelTitle, panelDesc — ID prvků nadpisu a popisu panelu
     */
    window.VZShared = {
        init: function (containerId, options) {
            _vzOptions = options || {};
            injectCSS();
            var container = document.getElementById(containerId);
            if (!container) { console.error('VZShared: container #' + containerId + ' not found'); return; }
            container.innerHTML = generatePhaseA() + generatePhaseB();
            _vzCurrentPhase = 'A';
        },
        /** Vrátí aktuální fázi ('A' | 'B') */
        getPhase: function () { return _vzCurrentPhase; },
        /** Přepne fázi programově */
        switchPhase: function (phase) { window.switchVZPhase(phase); },
        /** Aktualizuje options (např. po přestavbě stránky) */
        setOptions: function (opts) { _vzOptions = opts || {}; }
    };

})();
