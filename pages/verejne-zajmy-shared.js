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

    /** Integrované DO pro režim „rozeslat" (demo stav) */
    var VZ_BROADCAST_DOS = [
        { name: 'Ochrana přírody a krajiny', org: 'ÚP Kostelec nad Orlicí', icon: 'eco', color: '#2e7d32',
          status: 'dotcen', note: 'Kácení 2 dřevin — vyjádření zpracováno interně' },
        { name: 'Ochrana lesa', org: 'ÚP Kostelec nad Orlicí', icon: 'park', color: '#558b2f',
          status: 'ceka', note: '' },
        { name: 'Ochrana vod', org: 'ÚP Kostelec nad Orlicí', icon: 'water_drop', color: '#0277bd',
          status: 'dotcen', note: 'Záplavové území — vyžádáno vyjádření Povodí Labe' },
        { name: 'Památková péče', org: 'ÚP Kostelec nad Orlicí', icon: 'account_balance', color: '#6d4c41',
          status: 'nedotcen', note: 'Záměr mimo ochranné pásmo' },
        { name: 'Odpadové hospodářství', org: 'ÚP Kostelec nad Orlicí', icon: 'delete_outline', color: '#ef6c00',
          status: 'ceka', note: '' },
        { name: 'Požární ochrana', org: 'HZS Královéhradeckého kraje', icon: 'local_fire_department', color: '#d32f2f',
          status: 'nedotcen', note: 'Bez požadavků na stavbu' },
        { name: 'Ochrana veřejného zdraví', org: 'KHS Královéhradeckého kraje', icon: 'health_and_safety', color: '#00838f',
          status: 'ceka', note: '' },
        { name: 'Obrana státu', org: 'Ministerstvo obrany', icon: 'security', color: '#37474f',
          status: 'dotcen', note: 'ZS přiloženo stavebníkem k žádosti' }
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
            '.vz-do-status.s-ceka { background:#fef7e0; color:#e37400; }\n';
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
            '<button class="vz-submode-btn active" id="vzSubBtnRucni" onclick="switchVZSubMode(\'rucni\')">' +
                '<span class="material-icons-outlined">edit_note</span> Ruční identifikace' +
            '</button>' +
            '<button class="vz-submode-btn" id="vzSubBtnRozeslat" onclick="switchVZSubMode(\'rozeslat\')">' +
                '<span class="material-icons-outlined">campaign</span> Rozeslat integrovaným DO' +
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

    function generateBroadcastDOItem(doItem) {
        var statusCls, statusIcon, statusLabel;
        if (doItem.status === 'dotcen') {
            statusCls = 's-dotcen'; statusIcon = 'check_circle'; statusLabel = 'Dotčen';
        } else if (doItem.status === 'nedotcen') {
            statusCls = 's-nedotcen'; statusIcon = 'remove_circle_outline'; statusLabel = 'Nedotčen';
        } else {
            statusCls = 's-ceka'; statusIcon = 'schedule'; statusLabel = 'Čeká';
        }

        return '<div class="vz-do-item">' +
            '<span class="material-icons-outlined" style="font-size:18px;color:' + doItem.color + ';margin-top:1px;">' + doItem.icon + '</span>' +
            '<div style="flex:1;min-width:0;">' +
                '<div style="font-weight:600;color:#202124;font-size:12px;">' + doItem.name + '</div>' +
                '<div style="font-size:10px;color:#9aa0a6;margin-top:1px;">' + doItem.org + '</div>' +
                (doItem.note ? '<div style="font-size:10px;color:#5f6368;margin-top:3px;">' + doItem.note + '</div>' : '') +
            '</div>' +
            '<span class="vz-do-status ' + statusCls + '">' +
                '<span class="material-icons-outlined" style="font-size:12px;">' + statusIcon + '</span> ' + statusLabel +
            '</span>' +
        '</div>';
    }

    function generateBroadcastContent() {
        var html = '';
        // Info banner
        html += '<div style="padding:10px 12px;background:#e8f0fe;border:1px solid #c2dbf4;border-radius:8px;margin-bottom:16px;display:flex;align-items:flex-start;gap:8px;">' +
            '<span class="material-icons-outlined" style="font-size:16px;color:#1a73e8;margin-top:1px;">campaign</span>' +
            '<div style="font-size:11px;color:#3c4043;line-height:1.5;">' +
                'Systém rozešle podklady záměru všem integrovaným dotčeným orgánům v působnosti. ' +
                'Každý DO sám posoudí, zda je záměrem dotčen, a zvolí formu vyjádření (interní posouzení nebo externí stanovisko).' +
            '</div></div>';
        // DO list
        html += '<div style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin-bottom:16px;">' +
            '<div style="padding:8px 12px;background:#fafafa;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="font-size:11px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.3px;">Integrované DO v působnosti</div>' +
                '<div style="font-size:10px;color:#9aa0a6;">' + VZ_BROADCAST_DOS.length + ' orgánů</div>' +
            '</div>';
        VZ_BROADCAST_DOS.forEach(function (doItem) {
            html += generateBroadcastDOItem(doItem);
        });
        html += '</div>';
        // Summary
        var cDotcen = 0, cNedotcen = 0, cCeka = 0;
        VZ_BROADCAST_DOS.forEach(function (d) {
            if (d.status === 'dotcen') cDotcen++;
            else if (d.status === 'nedotcen') cNedotcen++;
            else cCeka++;
        });
        html += '<div style="padding:10px 12px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;">' +
            '<div style="font-size:11px;color:#3c4043;line-height:1.6;">' +
                '<strong>Osloveno ' + VZ_BROADCAST_DOS.length + ' DO</strong> · ' +
                '<span style="color:#1e8e3e;font-weight:500;">' + cDotcen + ' dotčen</span> · ' +
                '<span style="color:#9aa0a6;">' + cNedotcen + ' nedotčen</span>' +
                (cCeka > 0 ? ' · <span style="color:#e37400;font-weight:500;">' + cCeka + ' čeká na odpověď</span>' : '') +
            '</div></div>';
        return html;
    }

    // ======================================================================
    // HTML GENERATORS — CELKOVÝ OBSAH
    // ======================================================================

    function generateContent() {
        var html = '';
        // Submode selector
        html += generateSubModeSelector();
        // Ruční identifikace (default visible)
        html += '<div id="vzSubModeRucni">';
        html += generateRucniContent();
        html += '</div>';
        // Rozeslat DO (initially hidden)
        html += '<div id="vzSubModeRozeslat" style="display:none;">';
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
