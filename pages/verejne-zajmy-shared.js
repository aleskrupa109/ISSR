/**
 * verejne-zajmy-shared.js
 * Sdílený modul pro obsah Veřejné zájmy — Identifikace dotčených VZ.
 * Používá se v povoleni-2.html (kontrola VZ) i koordinator-1.html (rozhraní koordinátora).
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

    function generateItem(item) {
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

    function generateContent() {
        var html = '';
        // Info banner
        html += '<div style="padding:10px 12px;background:#e8f0fe;border:1px solid #c2dbf4;border-radius:8px;margin-bottom:16px;display:flex;align-items:flex-start;gap:8px;">' +
            '<span class="material-icons-outlined" style="font-size:16px;color:#1a73e8;margin-top:1px;">info</span>' +
            '<div style="font-size:11px;color:#3c4043;line-height:1.5;">' +
                'Systém předvyplnil veřejné zájmy na základě lokality a druhu záměru. U každého zvolte způsob posouzení. Další zájmy můžete přidat z katalogu.' +
            '</div></div>';
        // Items list
        html += '<div id="vzIdentifikaceList">';
        VZ_ITEMS.forEach(function (item) {
            html += generateItem(item);
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
        return html;
    }

    // ======================================================================
    // INTERACTIVE FUNCTIONS (exposed globally for onclick handlers)
    // ======================================================================

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
        list.insertAdjacentHTML('beforeend', generateItem(item));
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
        }
    };

})();
