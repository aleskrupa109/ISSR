/**
 * doc-modals.js — Sdílené modální náhledy dokumentů (Žádost, Přílohy, Dokumentace, Dokladová část, BIM)
 * Použití: <script src="doc-modals.js"></script>
 *          <script>initDocModals({ basePath: '../docs/' });</script>
 * 
 * API:
 *   initDocModals(config)          — vloží CSS + HTML modálů do stránky
 *   openDocModal(modalId)          — otevře modální okno
 *   openDocFile(modalId, filename) — otevře modál a rovnou zobrazí konkrétní soubor
 *   closeDocModal(modalId)         — zavře modální okno
 */

(function() {
    'use strict';

    var _basePath = '../docs/';
    var _currentPrilohaUrl = '';
    var _currentDokladUrl = '';
    var _currentEdUrl = '';

    // ── CSS ──────────────────────────────────────────────────────────────
    var CSS = `
/* doc-modals.js — shared modal styles */
.dm-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 10000;
    display: none; align-items: center; justify-content: center;
}
.dm-overlay.open { display: flex; }
.dm-modal {
    background: #fff; border-radius: 12px; width: 94vw; max-width: 1200px;
    max-height: 90vh; display: flex; flex-direction: column;
    box-shadow: 0 24px 80px rgba(0,0,0,0.25);
}
.dm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid #e0e0e0; flex-shrink: 0;
}
.dm-header-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 16px; font-weight: 600; color: #202124;
}
.dm-header-title .material-icons-outlined { font-size: 22px; color: #5f6368; }
.dm-header-right { display: flex; align-items: center; gap: 12px; }
.dm-header-meta { font-size: 11px; color: #5f6368; }
.dm-close {
    background: none; border: none; cursor: pointer; padding: 4px;
    border-radius: 50%; color: #5f6368; display: flex; align-items: center;
}
.dm-close:hover { background: #f1f3f4; }
.dm-body { flex: 1; overflow: hidden; display: flex; }
.dm-body-scroll { padding: 16px 20px; overflow-y: auto; flex: 1; }
.dm-body-split { display: flex; height: 65vh; padding: 0; }
.dm-list-panel {
    width: 280px; min-width: 280px; border-right: 1px solid #e0e0e0;
    overflow-y: auto; padding: 12px;
}
.dm-preview-panel {
    flex: 1; display: flex; flex-direction: column; background: #f5f5f5;
}
.dm-preview-area {
    flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto;
}
.dm-preview-placeholder {
    text-align: center; color: #9aa0a6;
}
.dm-preview-placeholder .material-icons-outlined { font-size: 48px; }
.dm-preview-placeholder div { margin-top: 8px; font-size: 13px; }
.dm-footer {
    display: flex; align-items: center; justify-content: flex-end; gap: 8px;
    padding: 12px 20px; border-top: 1px solid #e0e0e0; flex-shrink: 0;
}
.dm-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border: 1px solid #dadce0; border-radius: 6px;
    background: #fff; color: #202124; font-size: 13px; cursor: pointer;
    text-decoration: none;
}
.dm-btn:hover { background: #f8f9fa; }
.dm-btn .material-icons-outlined { font-size: 16px; }

/* List items */
.dm-file-item {
    display: flex; align-items: center; gap: 8px; padding: 6px 8px;
    border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer;
    margin-bottom: 4px; font-size: 12px;
}
.dm-file-item:hover { background: #f8f9fa; }
.dm-file-item.active { background: #e8f0fe; border-color: #004289; }
.dm-file-item .material-icons-outlined { font-size: 16px; color: #ea4335; flex-shrink: 0; }
.dm-file-info { flex: 1; min-width: 0; }
.dm-file-name { font-size: 12px; font-weight: 500; color: #202124; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dm-file-meta { font-size: 11px; color: #5f6368; }

/* Category groups (doklady) */
.dm-category { margin-bottom: 8px; }
.dm-cat-header {
    display: flex; align-items: center; gap: 6px; padding: 6px 4px;
    font-size: 12px; font-weight: 600; color: #004289; cursor: pointer;
    border-bottom: 1px solid #e8f0fe;
}
.dm-cat-header .material-icons-outlined { font-size: 16px; }
.dm-cat-count {
    font-size: 10px; background: #e8f0fe; color: #004289;
    padding: 1px 6px; border-radius: 8px; margin-left: auto; font-weight: 500;
}
.dm-cat-list { display: flex; flex-direction: column; gap: 2px; padding: 4px 0; }

/* Tree (dokumentace) */
.dm-tree .dm-folder { margin-bottom: 2px; }
.dm-tree .dm-folder-header {
    display: flex; align-items: center; gap: 6px; padding: 4px 6px;
    font-size: 12px; cursor: pointer; border-radius: 4px;
}
.dm-tree .dm-folder-header:hover { background: #f1f3f4; }
.dm-tree .dm-folder-header .material-icons-outlined { font-size: 18px; color: #f9ab00; }
.dm-tree .dm-folder-count { font-size: 11px; color: #5f6368; margin-left: auto; }
.dm-tree .dm-folder-content { display: none; padding-left: 20px; }
.dm-tree .dm-folder.open > .dm-folder-content { display: block; }
.dm-tree .dm-tree-file {
    display: flex; align-items: center; gap: 6px; padding: 3px 6px;
    font-size: 12px; cursor: pointer; border-radius: 4px;
}
.dm-tree .dm-tree-file:hover { background: #e8f0fe; color: #004289; }
.dm-tree .dm-tree-file.active { background: #e8f0fe; color: #004289; font-weight: 600; }
.dm-tree .dm-tree-file .material-icons-outlined { font-size: 16px; color: #ea4335; }
.dm-tree .dm-tree-grey { color: #9aa0a6; cursor: default; }
.dm-tree .dm-tree-grey:hover { background: none; color: #9aa0a6; }
.dm-tree .dm-tree-more { padding: 2px 6px; font-size: 11px; color: #5f6368; font-style: italic; }

/* Žádost readonly */
.dm-zadost-section { margin-bottom: 20px; }
.dm-zadost-section:last-child { margin-bottom: 0; }
.dm-zadost-header {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600; color: #004289;
    padding-bottom: 8px; border-bottom: 1px solid #e8f0fe; margin-bottom: 8px;
}
.dm-zadost-header .material-icons-outlined { font-size: 18px; }
.dm-zadost-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
.dm-zadost-item { padding: 4px 0; }
.dm-zadost-item.full-width { grid-column: 1 / -1; }
.dm-zadost-label { font-size: 11px; color: #5f6368; margin-bottom: 1px; }
.dm-zadost-val { font-size: 13px; color: #202124; font-weight: 500; }
.dm-zadost-table { overflow-x: auto; }
.dm-zadost-table table { width: 100%; border-collapse: collapse; font-size: 12px; }
.dm-zadost-table th { text-align: left; padding: 6px 8px; background: #f8f9fa; border-bottom: 2px solid #e0e0e0; font-weight: 600; color: #5f6368; font-size: 11px; }
.dm-zadost-table td { padding: 6px 8px; border-bottom: 1px solid #f1f3f4; }
`;

    // ── HTML GENERATORS ─────────────────────────────────────────────────

    function modalZadost() {
        return `
    <div class="dm-overlay" id="dm-zadostModal" onclick="closeDocModal('dm-zadostModal',event)">
        <div class="dm-modal" style="max-width:900px" onclick="event.stopPropagation()">
            <div class="dm-header">
                <div class="dm-header-title"><span class="material-icons-outlined">description</span>Žádost o povolení stavby</div>
                <button class="dm-close" onclick="closeDocModal('dm-zadostModal')"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="dm-body"><div class="dm-body-scroll">
                <div class="dm-zadost-section">
                    <div class="dm-zadost-header"><span class="material-icons-outlined">info</span>Údaje o podání</div>
                    <div class="dm-zadost-grid">
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Číslo jednací</div><div class="dm-zadost-val">DESÚ/Z-2026/1596</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Datum podání</div><div class="dm-zadost-val">6. 1. 2026, 09:16</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Typ podání</div><div class="dm-zadost-val">Žádost o povolení stavby</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Správní orgán</div><div class="dm-zadost-val">Dopravní a energetický stavební úřad</div></div>
                    </div>
                </div>
                <div class="dm-zadost-section">
                    <div class="dm-zadost-header"><span class="material-icons-outlined">business</span>Žadatel — Právnická osoba</div>
                    <div class="dm-zadost-grid">
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Název / obchodní firma</div><div class="dm-zadost-val">Správa železnic, státní organizace</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">IČO</div><div class="dm-zadost-val">70994234</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Sídlo</div><div class="dm-zadost-val">Dlážděná 1003/7, 110 00 Praha 1</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Datová schránka</div><div class="dm-zadost-val">uccchjm</div></div>
                    </div>
                </div>
                <div class="dm-zadost-section">
                    <div class="dm-zadost-header"><span class="material-icons-outlined">people</span>Zástupce na základě plné moci</div>
                    <div class="dm-zadost-grid">
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Název / obchodní firma</div><div class="dm-zadost-val">Signal Projekt s.r.o.</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">IČO</div><div class="dm-zadost-val">25525441</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Sídlo</div><div class="dm-zadost-val">Pod Bohdalcem I 3254/3, 101 00 Praha 10</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Plná moc</div><div class="dm-zadost-val">PM-036-2024 (SŽ → Signal Projekt)</div></div>
                        <div class="dm-zadost-item full-width"><div class="dm-zadost-label">Jednající osoba</div><div class="dm-zadost-val">Mikulová (PM-037-2024, Signal Projekt → Mikulová)</div></div>
                    </div>
                </div>
                <div class="dm-zadost-section">
                    <div class="dm-zadost-header"><span class="material-icons-outlined">domain</span>Identifikace záměru</div>
                    <div class="dm-zadost-grid">
                        <div class="dm-zadost-item full-width"><div class="dm-zadost-label">Název záměru</div><div class="dm-zadost-val">Oprava zabezpečovacího zařízení v žst. Doudleby nad Orlicí</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Druh stavby</div><div class="dm-zadost-val">Stavba dráhy</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Účel stavby</div><div class="dm-zadost-val">Stavba dráhy — zabezpečovací zařízení</div></div>
                        <div class="dm-zadost-item full-width"><div class="dm-zadost-label">Místo stavby</div><div class="dm-zadost-val">Doudleby n.O., Vamberk, Záměl, Potštejn, Kostelec n.O.</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Kraj</div><div class="dm-zadost-val">Královéhradecký</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Okres</div><div class="dm-zadost-val">Rychnov nad Kněžnou</div></div>
                    </div>
                </div>
                <div class="dm-zadost-section">
                    <div class="dm-zadost-header"><span class="material-icons-outlined">grid_on</span>Pozemky záměru</div>
                    <div class="dm-zadost-table"><table>
                        <thead><tr><th>Parcela</th><th>Katastrální území</th><th>Výměra</th><th>Druh pozemku</th></tr></thead>
                        <tbody>
                            <tr><td><strong>st. 321</strong></td><td>Doudleby n.O. [631761]</td><td>—</td><td>Zastavěná plocha</td></tr>
                            <tr><td><strong>1549</strong></td><td>Doudleby n.O. [631761]</td><td>—</td><td>Ostatní plocha — dráha</td></tr>
                            <tr><td><strong>1550/1</strong></td><td>Záměl [790591]</td><td>—</td><td>Ostatní plocha — dráha</td></tr>
                            <tr><td colspan="4" style="text-align:center;color:#5f6368;font-style:italic">… a dalších 35 pozemků ve 4 k.ú.</td></tr>
                        </tbody>
                    </table></div>
                </div>
                <div class="dm-zadost-section">
                    <div class="dm-zadost-header"><span class="material-icons-outlined">architecture</span>Charakteristika záměru</div>
                    <div class="dm-zadost-grid">
                        <div class="dm-zadost-item full-width"><div class="dm-zadost-label">Popis záměru</div><div class="dm-zadost-val">Oprava stávajícího zabezpečovacího zařízení v žst. Doudleby nad Orlicí včetně kabelových rozvodů, silnoproudé technologie, informačního systému a stavebních úprav výpravní budovy</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Zastavěná plocha</div><div class="dm-zadost-val">—</div></div>
                        <div class="dm-zadost-item"><div class="dm-zadost-label">Obestavěný prostor</div><div class="dm-zadost-val">—</div></div>
                    </div>
                </div>
            </div></div>
            <div class="dm-footer">
                <a href="${_basePath}zadost/build-application-04_20260106091657308.pdf" target="_blank" class="dm-btn"><span class="material-icons-outlined">picture_as_pdf</span>Zobrazit originál PDF</a>
                <button class="dm-btn" onclick="closeDocModal('dm-zadostModal')">Zavřít</button>
            </div>
        </div>
    </div>`;
    }

    function fileItem(file, name, meta, onclick) {
        return '<div class="dm-file-item" data-file="' + file + '" onclick="' + onclick + '(this)">' +
            '<span class="material-icons-outlined">picture_as_pdf</span>' +
            '<div class="dm-file-info"><div class="dm-file-name">' + name + '</div>' +
            (meta ? '<div class="dm-file-meta">' + meta + '</div>' : '') +
            '</div></div>';
    }

    function modalPrilohy() {
        var items = [
            ['PM-036-2024-SZ - Signal projekt.pdf', 'PM-036-2024-SŽ - Signal projekt.pdf', 'Plná moc — SŽ → Signal Projekt s.r.o.'],
            ['PM-037-2024-Mikulova.pdf', 'PM-037-2024-Mikulová.pdf', 'Plná moc — Signal Projekt → Mikulová'],
            ['Povereni reditele Kosinova 9910 ec 3430.pdf', 'Pověření ředitele Kosinová 9910 eč 3430.pdf', 'Pověření k jednání za SŽ, s.o.'],
            ['Sousedni pozemky do 2m od planovane stavby.pdf', 'Sousední pozemky do 2m od plánované stavby.pdf', 'Výpis vlastníků pozemků'],
            ['podle casti F k bodu B.pdf', 'podle části F k bodu B.pdf', 'Příloha dle vyhl. č. 149/2024 Sb.']
        ];
        var list = items.map(function(i) { return fileItem(i[0], i[1], i[2], '_dmShowPriloha'); }).join('');

        return `
    <div class="dm-overlay" id="dm-prilohyModal" onclick="closeDocModal('dm-prilohyModal',event)">
        <div class="dm-modal" onclick="event.stopPropagation()">
            <div class="dm-header">
                <div class="dm-header-title"><span class="material-icons-outlined">attach_file</span>Přílohy žádosti (5)</div>
                <button class="dm-close" onclick="closeDocModal('dm-prilohyModal')"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="dm-body dm-body-split">
                <div class="dm-list-panel" id="dm-prilohyList">${list}</div>
                <div class="dm-preview-panel">
                    <div class="dm-preview-area" id="dm-prilohyPreview">
                        <div class="dm-preview-placeholder"><span class="material-icons-outlined">preview</span><div>Klikněte na soubor pro zobrazení náhledu</div></div>
                    </div>
                </div>
            </div>
            <div class="dm-footer">
                <button class="dm-btn" id="dm-prilohyOpenBtn" style="display:none" onclick="window.open(_dmCurrentPriloha,'_blank')"><span class="material-icons-outlined">open_in_new</span>Otevřít v novém okně</button>
                <button class="dm-btn" onclick="closeDocModal('dm-prilohyModal')">Zavřít</button>
            </div>
        </div>
    </div>`;
    }

    function modalDokumentace() {
        return `
    <div class="dm-overlay" id="dm-eedModal" onclick="closeDocModal('dm-eedModal',event)">
        <div class="dm-modal" onclick="event.stopPropagation()">
            <div class="dm-header">
                <div class="dm-header-title"><span class="material-icons-outlined">folder</span>Elektronická dokumentace</div>
                <div class="dm-header-right">
                    <span class="dm-header-meta">SR00X01HLDRP • BPP balíček • 247 souborů</span>
                    <button class="dm-close" onclick="closeDocModal('dm-eedModal')"><span class="material-icons-outlined">close</span></button>
                </div>
            </div>
            <div class="dm-body dm-body-split">
                <div class="dm-list-panel">
                    <div class="dm-tree">
                        <div class="dm-folder open">
                            <div class="dm-folder-header" onclick="this.parentElement.classList.toggle('open')">
                                <span class="material-icons-outlined">folder_open</span><strong>A</strong> Průvodní list
                                <span class="dm-folder-count">1</span>
                            </div>
                            <div class="dm-folder-content">
                                <div class="dm-tree-file" data-file="A - akt..pdf" onclick="_dmShowEd(this)"><span class="material-icons-outlined">picture_as_pdf</span> A - akt..pdf</div>
                            </div>
                        </div>
                        <div class="dm-folder open">
                            <div class="dm-folder-header" onclick="this.parentElement.classList.toggle('open')">
                                <span class="material-icons-outlined">folder_open</span><strong>B</strong> Souhrnná tech. zpráva
                                <span class="dm-folder-count">1</span>
                            </div>
                            <div class="dm-folder-content">
                                <div class="dm-tree-file" data-file="B - akt..pdf" onclick="_dmShowEd(this)"><span class="material-icons-outlined">picture_as_pdf</span> B - akt..pdf</div>
                            </div>
                        </div>
                        <div class="dm-folder open">
                            <div class="dm-folder-header" onclick="this.parentElement.classList.toggle('open')">
                                <span class="material-icons-outlined">folder_open</span><strong>C</strong> Situační výkresy
                                <span class="dm-folder-count">3</span>
                            </div>
                            <div class="dm-folder-content">
                                <div class="dm-tree-file" data-file="C.1-001.pdf" onclick="_dmShowEd(this)"><span class="material-icons-outlined">picture_as_pdf</span> C.1-001.pdf</div>
                                <div class="dm-tree-file" data-file="C.2-001 - akt..pdf" onclick="_dmShowEd(this)"><span class="material-icons-outlined">picture_as_pdf</span> C.2-001 - akt..pdf</div>
                                <div class="dm-tree-file" data-file="C.3-001- akt..pdf" onclick="_dmShowEd(this)"><span class="material-icons-outlined">picture_as_pdf</span> C.3-001- akt..pdf</div>
                            </div>
                        </div>
                        <div class="dm-folder">
                            <div class="dm-folder-header" onclick="this.parentElement.classList.toggle('open')">
                                <span class="material-icons-outlined">folder</span><strong>D</strong> Dokumentace objektů
                                <span class="dm-folder-count">213</span>
                            </div>
                            <div class="dm-folder-content">
                                <div style="font-size:11px;font-weight:600;color:#004289;padding:6px 8px 2px">SO</div>
                                <div class="dm-tree-file dm-tree-grey"><span class="material-icons-outlined" style="color:#f9ab00">folder</span> SO 12-12-01 Úprava nástupiště</div>
                                <div class="dm-tree-file dm-tree-grey"><span class="material-icons-outlined" style="color:#f9ab00">folder</span> SO 12-71-02 Kabelovod</div>
                                <div class="dm-tree-more">… a dalších 10 SO</div>
                                <div style="font-size:11px;font-weight:600;color:#004289;padding:6px 8px 2px">PS</div>
                                <div class="dm-tree-file dm-tree-grey"><span class="material-icons-outlined" style="color:#f9ab00">folder</span> PS 11-01-21 Žel. zab. zařízení</div>
                                <div class="dm-tree-file dm-tree-grey"><span class="material-icons-outlined" style="color:#f9ab00">folder</span> PS 12-01-11 Silnoproud</div>
                                <div class="dm-tree-more">… a dalších 12 PS</div>
                                <div style="padding:4px 8px;font-size:10px;color:#9aa0a6;font-style:italic">Část D — soubory nejsou v demo datasetu</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dm-preview-panel">
                    <div class="dm-preview-area" id="dm-edPreview">
                        <div class="dm-preview-placeholder"><span class="material-icons-outlined">preview</span><div>Klikněte na soubor pro zobrazení náhledu</div></div>
                    </div>
                </div>
            </div>
            <div class="dm-footer">
                <button class="dm-btn" id="dm-edOpenBtn" style="display:none" onclick="window.open(_dmCurrentEd,'_blank')"><span class="material-icons-outlined">open_in_new</span>Otevřít v novém okně</button>
                <button class="dm-btn" onclick="closeDocModal('dm-eedModal')">Zavřít</button>
            </div>
        </div>
    </div>`;
    }

    function dokladItem(file, name) {
        return '<div class="dm-file-item" data-file="' + file + '" onclick="_dmShowDoklad(this)">' +
            '<span class="material-icons-outlined">picture_as_pdf</span>' +
            '<div class="dm-file-info"><div class="dm-file-name">' + name + '</div></div></div>';
    }

    function modalDoklady() {
        return `
    <div class="dm-overlay" id="dm-dokladyModal" onclick="closeDocModal('dm-dokladyModal',event)">
        <div class="dm-modal" onclick="event.stopPropagation()">
            <div class="dm-header">
                <div class="dm-header-title"><span class="material-icons-outlined">fact_check</span>Dokladová část (63 dokumentů)</div>
                <button class="dm-close" onclick="closeDocModal('dm-dokladyModal')"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="dm-body dm-body-split">
                <div class="dm-list-panel" id="dm-dokladyList" style="padding:12px 16px">

                    <div class="dm-category">
                        <div class="dm-cat-header" onclick="var l=this.nextElementSibling;l.style.display=l.style.display==='none'?'flex':'none'">
                            <span class="material-icons-outlined">gavel</span>1. Závazná stanoviska a rozhodnutí<span class="dm-cat-count">8</span>
                        </div>
                        <div class="dm-cat-list">
                            ${dokladItem('1.1._MeU Kostelec nO-koord.zav.stan..pdf','1.1. MěÚ Kostelec nO — koord. záv. stan.')}
                            ${dokladItem('1.2._MeU Rychnov nK-zav.stan.JES.pdf','1.2. MěÚ Rychnov nK — záv. stan. JES')}
                            ${dokladItem('1.3._Mestys Doudleby nO-exist+souhlas.pdf','1.3. Městys Doudleby nO — exist. + souhlas')}
                            ${dokladItem('1.4._Obec Zamel-exist+souhlas.pdf','1.4. Obec Záměl — exist. + souhlas')}
                            ${dokladItem('1.5._Obec Potstejn-vyj.-souhlas.pdf','1.5. Obec Potštejn — vyj. souhlas')}
                            ${dokladItem('1.6._Mesto Vamberk_Souhlas se stavbou.pdf','1.6. Město Vamberk — souhlas se stavbou')}
                            ${dokladItem('1.7._PCR-vyj.k PD.pdf','1.7. PČR — vyj. k PD')}
                            ${dokladItem('1.8._DU-Rozhodnuti-zmena zab..pdf','1.8. DÚ — Rozhodnutí změna zab.')}
                        </div>
                    </div>

                    <div class="dm-category">
                        <div class="dm-cat-header" onclick="var l=this.nextElementSibling;l.style.display=l.style.display==='none'?'flex':'none'">
                            <span class="material-icons-outlined">eco</span>3. Posouzení NATURA 2000<span class="dm-cat-count">2</span>
                        </div>
                        <div class="dm-cat-list">
                            ${dokladItem('3.1._KUKHK-NATURA 100.pdf','3.1. KÚKHK — NATURA 100')}
                            ${dokladItem('3.2._KUKHK-NATURA 114.pdf','3.2. KÚKHK — NATURA 114')}
                        </div>
                    </div>

                    <div class="dm-category">
                        <div class="dm-cat-header" onclick="var l=this.nextElementSibling;l.style.display=l.style.display==='none'?'flex':'none'">
                            <span class="material-icons-outlined">electrical_services</span>4.2. Vyjádření vlastníků VTI / VDI<span class="dm-cat-count">33</span>
                        </div>
                        <div class="dm-cat-list">
                            ${dokladItem('4.2.1._CETIN-vyj.exist..pdf','4.2.1. CETIN — vyj. exist.')}
                            ${dokladItem('4.2.3._CEZ DSO-vyj.exist..pdf','4.2.3. ČEZ DSO — vyj. exist.')}
                            ${dokladItem('4.2.4._CEZ DSO-vyj. k PD.pdf','4.2.4. ČEZ DSO — vyj. k PD')}
                            ${dokladItem('4.2.5._CEZ Telco-vyj.exist..pdf','4.2.5. ČEZ Telco — vyj. exist.')}
                            ${dokladItem('4.2.6._CEZ ICT-vyj.exist..pdf','4.2.6. ČEZ ICT — vyj. exist.')}
                            ${dokladItem('4.2.7._Telco Infrastr.-vyj.exist..pdf','4.2.7. Telco Infrastr. — vyj. exist.')}
                            ${dokladItem('4.2.8._GasNet-vyj.exist..pdf','4.2.8. GasNet — vyj. exist.')}
                            ${dokladItem('4.2.9._GasNet-vyj. k PD.pdf','4.2.9. GasNet — vyj. k PD')}
                            ${dokladItem('4.2.10._T-Mobile-vyj.exist..pdf','4.2.10. T-Mobile — vyj. exist.')}
                            ${dokladItem('4.2.11._Vodafone-vyj.exist..pdf','4.2.11. Vodafone — vyj. exist.')}
                            ${dokladItem('4.2.12._CEZ Energo-vyj.exist..pdf','4.2.12. ČEZ Energo — vyj. exist.')}
                            ${dokladItem('4.2.13._ESAB-vyj.exist..pdf','4.2.13. ESAB — vyj. exist.')}
                            ${dokladItem('4.2.14._CEPS-vyj.exist..pdf','4.2.14. ČEPS — vyj. exist.')}
                            ${dokladItem('4.2.15._CEPS-vyj.vlastnika TI.pdf','4.2.15. ČEPS — vyj. vlastníka TI')}
                            ${dokladItem('4.2.16._CEPS-souhlas v OP.pdf','4.2.16. ČEPS — souhlas v OP')}
                            ${dokladItem('4.2.17._PTES-vyj.exist..pdf','4.2.17. PTES — vyj. exist.')}
                            ${dokladItem('4.2.19._Aqua Servis-vyj. k PD.pdf','4.2.19. Aqua Servis — vyj. k PD')}
                            ${dokladItem('4.2.20._PODA-vyj.exist..pdf','4.2.20. PODA — vyj. exist.')}
                            <div style="padding:4px 8px;font-size:11px;color:#5f6368;font-style:italic">… a dalších 15 vyjádření</div>
                        </div>
                    </div>

                    <div class="dm-category">
                        <div class="dm-cat-header" onclick="var l=this.nextElementSibling;l.style.display=l.style.display==='none'?'flex':'none'">
                            <span class="material-icons-outlined">handshake</span>6. Souhlasy, SBVB, další<span class="dm-cat-count">18</span>
                        </div>
                        <div class="dm-cat-list">
                            ${dokladItem('6.2._CD RSM-vyjadreni k PD.pdf','6.2. ČD RSM — vyjádření k PD')}
                            ${dokladItem('6.3._CD_Podepsana SBVB.pdf','6.3. ČD — Podepsaná SBVB')}
                            ${dokladItem('6.4._Mestys Doudleby n.O.-souhlas vl..pdf','6.4. Městys Doudleby n.O. — souhlas vl.')}
                            ${dokladItem('6.5._Mestys Doudleby n.O.-SBVB.pdf','6.5. Městys Doudleby n.O. — SBVB')}
                            ${dokladItem('6.8._SSKHK-stanovisko k PD.pdf','6.8. SSKHK — stanovisko k PD')}
                            ${dokladItem('6.9._Povodi Labe-stan.spravce povodi.pdf','6.9. Povodí Labe — stan. správce povodí')}
                            ${dokladItem('6.10._Povodi Labe-SoVB.pdf','6.10. Povodí Labe — SoVB')}
                            ${dokladItem('6.18._SZ-zaznam z MS.pdf','6.18. SŽ — záznam z místního šetření')}
                            ${dokladItem('6.20._Biologicky a dendrologicky pruzkum.pdf','6.20. Biologický a dendrologický průzkum')}
                            <div style="padding:4px 8px;font-size:11px;color:#5f6368;font-style:italic">… a dalších 9 dokladů</div>
                        </div>
                    </div>

                    <div class="dm-category">
                        <div class="dm-cat-header" onclick="var l=this.nextElementSibling;l.style.display=l.style.display==='none'?'flex':'none'">
                            <span class="material-icons-outlined">more_horiz</span>9. Ostatní<span class="dm-cat-count">2</span>
                        </div>
                        <div class="dm-cat-list">
                            ${dokladItem('9.1._VUZ.pdf','9.1. VÚŽ')}
                            ${dokladItem('Doklady seznam-DESU-227.pdf','Doklady seznam DESÚ-227')}
                        </div>
                    </div>

                </div>
                <div class="dm-preview-panel">
                    <div class="dm-preview-area" id="dm-dokladyPreview">
                        <div class="dm-preview-placeholder"><span class="material-icons-outlined">preview</span><div>Klikněte na doklad pro zobrazení náhledu</div></div>
                    </div>
                </div>
            </div>
            <div class="dm-footer">
                <button class="dm-btn" id="dm-dokladyOpenBtn" style="display:none" onclick="window.open(_dmCurrentDoklad,'_blank')"><span class="material-icons-outlined">open_in_new</span>Otevřít v novém okně</button>
                <button class="dm-btn" onclick="closeDocModal('dm-dokladyModal')">Zavřít</button>
            </div>
        </div>
    </div>`;
    }

    function modalBim() {
        return `
    <div class="dm-overlay" id="dm-bimModal" onclick="closeDocModal('dm-bimModal',event)">
        <div class="dm-modal" onclick="event.stopPropagation()">
            <div class="dm-header">
                <div class="dm-header-title"><span class="material-icons-outlined">view_in_ar</span>BIM model</div>
                <button class="dm-close" onclick="closeDocModal('dm-bimModal')"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="dm-body"><div class="dm-body-scroll" style="text-align:center;padding:60px 24px">
                <span class="material-icons-outlined" style="font-size:64px;color:#9aa0a6">view_in_ar</span>
                <div style="margin-top:16px;font-size:14px;font-weight:600;color:#202124">Oprava zabezpečovacího zařízení v žst. Doudleby n. Orlicí</div>
                <div style="margin-top:8px;font-size:12px;color:#5f6368">IFC model · Verze 3.0 · Nahrán 10. 1. 2026</div>
                <div style="margin-top:24px;padding:32px;background:#f8f9fa;border-radius:8px;color:#9aa0a6">
                    <span class="material-icons-outlined" style="font-size:48px">construction</span>
                    <div style="margin-top:8px;font-size:13px">3D prohlížeč bude k dispozici v další verzi</div>
                </div>
            </div></div>
            <div class="dm-footer">
                <button class="dm-btn" onclick="closeDocModal('dm-bimModal')">Zavřít</button>
            </div>
        </div>
    </div>`;
    }

    // ── PDF VIEWER ──────────────────────────────────────────────────────

    function buildPdf(path, displayName) {
        return '<object data="' + path + '#navpanes=0&scrollbar=1" type="application/pdf" style="width:100%;height:100%">' +
            '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#9aa0a6">' +
            '<span class="material-icons-outlined" style="font-size:48px;color:#ea4335">picture_as_pdf</span>' +
            '<div style="margin-top:12px;font-size:14px;font-weight:500;color:#202124">' + displayName + '</div>' +
            '<div style="margin-top:8px;font-size:12px;color:#5f6368">' +
            '<a href="' + path + '" target="_blank" style="color:#004289">Otevřít PDF ↗</a>' +
            '</div></div></object>';
    }

    function showInPreview(areaId, btnId, path, displayName) {
        var area = document.getElementById(areaId);
        area.style.alignItems = 'stretch';
        area.style.justifyContent = 'flex-start';
        area.innerHTML = buildPdf(path, displayName);
        var btn = document.getElementById(btnId);
        if (btn) btn.style.display = 'inline-flex';
    }

    function clearActive(container, selector) {
        var els = document.querySelectorAll(container + ' ' + selector);
        for (var i = 0; i < els.length; i++) {
            els[i].classList.remove('active');
        }
    }

    // ── VIEWER FUNCTIONS (exposed globally) ─────────────────────────────

    window._dmCurrentPriloha = '';
    window._dmCurrentDoklad = '';
    window._dmCurrentEd = '';

    window._dmShowPriloha = function(item) {
        var file = item.getAttribute('data-file');
        var name = item.querySelector('.dm-file-name').textContent;
        var path = _basePath + 'prilohy/' + file;
        _dmCurrentPriloha = path;
        clearActive('#dm-prilohyList', '.dm-file-item');
        item.classList.add('active');
        showInPreview('dm-prilohyPreview', 'dm-prilohyOpenBtn', path, name);
    };

    window._dmShowDoklad = function(item) {
        var file = item.getAttribute('data-file');
        var name = item.querySelector('.dm-file-name').textContent;
        var path = _basePath + 'dokladova-cast/' + file;
        _dmCurrentDoklad = path;
        clearActive('#dm-dokladyList', '.dm-file-item');
        item.classList.add('active');
        showInPreview('dm-dokladyPreview', 'dm-dokladyOpenBtn', path, name);
    };

    window._dmShowEd = function(item) {
        var file = item.getAttribute('data-file');
        var path = _basePath + 'dokumentace/' + file;
        _dmCurrentEd = path;
        clearActive('#dm-eedModal', '.dm-tree-file');
        item.classList.add('active');
        showInPreview('dm-edPreview', 'dm-edOpenBtn', path, file);
    };

    // ── PUBLIC API ──────────────────────────────────────────────────────

    /**
     * Inicializace — vloží CSS a HTML modálů do stránky.
     * @param {Object} config - { basePath: '../docs/' }
     */
    window.initDocModals = function(config) {
        config = config || {};
        _basePath = config.basePath || '../docs/';
        if (_basePath.slice(-1) !== '/') _basePath += '/';

        // Inject CSS
        var style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);

        // Inject modals
        var container = document.createElement('div');
        container.id = 'dm-modals-container';
        container.innerHTML = modalZadost() + modalPrilohy() + modalDokumentace() + modalDoklady() + modalBim();
        document.body.appendChild(container);
    };

    /**
     * Otevře modální okno.
     * Mapování aliasů: zadostModal→dm-zadostModal, prilohyModal→dm-prilohyModal atd.
     */
    window.openDocModal = function(id) {
        var mapped = _mapId(id);
        var el = document.getElementById(mapped);
        if (el) el.classList.add('open');
    };

    /**
     * Zavře modální okno.
     */
    window.closeDocModal = function(id, event) {
        if (event && event.target !== event.currentTarget) return;
        var mapped = _mapId(id);
        var el = document.getElementById(mapped);
        if (el) el.classList.remove('open');
    };

    /**
     * Otevře modální okno a rovnou zobrazí konkrétní soubor.
     * Např. openDocFile('doklady', '1.7._PCR-vyj.k PD.pdf')
     *       openDocFile('prilohy', 'PM-036-2024-SZ - Signal projekt.pdf')
     *       openDocFile('eed', 'A - akt..pdf')
     */
    window.openDocFile = function(type, filename) {
        var modalId, listSel, clickFn;
        switch(type) {
            case 'prilohy':
                modalId = 'dm-prilohyModal'; listSel = '#dm-prilohyList .dm-file-item'; break;
            case 'doklady': case 'dokladova-cast':
                modalId = 'dm-dokladyModal'; listSel = '#dm-dokladyList .dm-file-item'; break;
            case 'eed': case 'dokumentace':
                modalId = 'dm-eedModal'; listSel = '#dm-eedModal .dm-tree-file'; break;
            default: return;
        }
        // Open modal
        var el = document.getElementById(modalId);
        if (el) el.classList.add('open');
        // Find and click the file
        if (filename) {
            var items = document.querySelectorAll(listSel);
            for (var i = 0; i < items.length; i++) {
                if (items[i].getAttribute('data-file') === filename) {
                    items[i].click();
                    items[i].scrollIntoView({ block: 'nearest' });
                    break;
                }
            }
        }
    };

    // ID alias mapping — accepts both old IDs and new dm- prefixed IDs
    function _mapId(id) {
        var map = {
            'zadostModal': 'dm-zadostModal',
            'prilohyModal': 'dm-prilohyModal',
            'eedModal': 'dm-eedModal',
            'dokladyModal': 'dm-dokladyModal',
            'bimModal': 'dm-bimModal'
        };
        return map[id] || id;
    }

    // ESC key closes topmost modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var overlays = document.querySelectorAll('.dm-overlay.open');
            if (overlays.length) overlays[overlays.length - 1].classList.remove('open');
        }
    });

})();
