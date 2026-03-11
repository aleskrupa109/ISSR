/**
 * doc-modals.js
 * Sdílený skript pro modální okna s náhledy dokumentů
 */

(function() {
    // Konfigurace modálů
    const modalConfig = {
        zadostModal: {
            title: 'Žádost',
            type: 'pdf',
            file: 'zadost.pdf'
        },
        prilohyModal: {
            title: 'Přílohy',
            type: 'list',
            files: [
                { name: 'Příloha 1 - Situační výkres', file: 'priloha1.pdf' },
                { name: 'Příloha 2 - Technická zpráva', file: 'priloha2.pdf' },
                { name: 'Příloha 3 - Souhlasy vlastníků', file: 'priloha3.pdf' },
                { name: 'Příloha 4 - Stanoviska DO', file: 'priloha4.pdf' },
                { name: 'Příloha 5 - Fotodokumentace', file: 'priloha5.pdf' }
            ]
        },
        eedModal: {
            title: 'Elektronická dokumentace',
            type: 'pdf',
            file: 'dokumentace.pdf'
        },
        dokladyModal: {
            title: 'Dokladová část',
            type: 'pdf',
            file: 'doklady.pdf'
        },
        bimModal: {
            title: 'BIM model',
            type: 'image',
            file: '../images/BIM.png',
            useAbsolutePath: true
        }
    };

    let basePath = '';
    let currentModal = null;

    // Inicializace
    window.initDocModals = function(options) {
        basePath = options.basePath || '';
        createModalContainer();
    };

    // Vytvoření kontejneru pro modály
    function createModalContainer() {
        if (document.getElementById('docModalContainer')) return;

        const container = document.createElement('div');
        container.id = 'docModalContainer';
        container.innerHTML = `
            <div class="doc-modal-overlay" id="docModalOverlay" onclick="closeDocModal()">
                <div class="doc-modal-dialog" onclick="event.stopPropagation()">
                    <div class="doc-modal-header">
                        <h3 class="doc-modal-title" id="docModalTitle">Dokument</h3>
                        <button class="doc-modal-close" onclick="closeDocModal()">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    </div>
                    <div class="doc-modal-body" id="docModalBody">
                        <!-- Obsah se vloží dynamicky -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // Přidání stylů
        const styles = document.createElement('style');
        styles.textContent = `
            .doc-modal-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                z-index: 2000;
                align-items: center;
                justify-content: center;
            }
            .doc-modal-overlay.open {
                display: flex;
            }
            .doc-modal-dialog {
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
                max-width: 90vw;
                max-height: 90vh;
                width: 900px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .doc-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                border-bottom: 1px solid #e0e0e0;
                background: #f8f9fa;
            }
            .doc-modal-title {
                font-size: 18px;
                font-weight: 500;
                color: #202124;
                margin: 0;
            }
            .doc-modal-close {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                border: none;
                background: transparent;
                border-radius: 50%;
                cursor: pointer;
                color: #5f6368;
                transition: background 0.15s;
            }
            .doc-modal-close:hover {
                background: #e8eaed;
            }
            .doc-modal-body {
                flex: 1;
                overflow: auto;
                padding: 0;
                min-height: 400px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
            }
            .doc-modal-body img {
                max-width: 100%;
                max-height: 70vh;
                object-fit: contain;
            }
            .doc-modal-body iframe {
                width: 100%;
                height: 70vh;
                border: none;
            }
            .doc-modal-list {
                width: 100%;
                padding: 16px 24px;
                background: #fff;
            }
            .doc-modal-list-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.15s;
                text-decoration: none;
                color: #202124;
            }
            .doc-modal-list-item:hover {
                background: #f8f9fa;
                border-color: #1a73e8;
            }
            .doc-modal-list-item:last-child {
                margin-bottom: 0;
            }
            .doc-modal-list-item .material-icons-outlined {
                color: #5f6368;
                font-size: 24px;
            }
            .doc-modal-list-item:hover .material-icons-outlined {
                color: #1a73e8;
            }
            .doc-modal-placeholder {
                text-align: center;
                color: #5f6368;
                padding: 40px;
            }
            .doc-modal-placeholder .material-icons-outlined {
                font-size: 64px;
                color: #dadce0;
                margin-bottom: 16px;
            }
        `;
        document.head.appendChild(styles);

        // Klávesa Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && currentModal) {
                closeDocModal();
            }
        });
    }

    // Otevření modálu
    window.openDocModal = function(modalId) {
        const config = modalConfig[modalId];
        if (!config) {
            console.warn('Modal config not found:', modalId);
            return;
        }

        currentModal = modalId;
        const overlay = document.getElementById('docModalOverlay');
        const title = document.getElementById('docModalTitle');
        const body = document.getElementById('docModalBody');

        title.textContent = config.title;

        // Určení cesty k souboru
        const filePath = config.useAbsolutePath ? config.file : `${basePath}${config.file}`;

        // Generování obsahu podle typu
        if (config.type === 'image') {
            body.innerHTML = `<img src="${filePath}" alt="${config.title}" onerror="this.parentElement.innerHTML='<div class=\\'doc-modal-placeholder\\'><span class=\\'material-icons-outlined\\'>image</span><p>Obrázek nelze načíst</p></div>'">`;
        } else if (config.type === 'pdf') {
            body.innerHTML = `<iframe src="${filePath}" title="${config.title}"></iframe>`;
        } else if (config.type === 'list') {
            let listHtml = '<div class="doc-modal-list">';
            config.files.forEach((item, index) => {
                listHtml += `
                    <a href="${basePath}${item.file}" target="_blank" class="doc-modal-list-item">
                        <span class="material-icons-outlined">description</span>
                        <span>${item.name}</span>
                    </a>
                `;
            });
            listHtml += '</div>';
            body.innerHTML = listHtml;
        } else {
            body.innerHTML = `<div class="doc-modal-placeholder"><span class="material-icons-outlined">folder_open</span><p>Obsah není k dispozici</p></div>`;
        }

        overlay.classList.add('open');
    };

    // Zavření modálu
    window.closeDocModal = function() {
        const overlay = document.getElementById('docModalOverlay');
        if (overlay) {
            overlay.classList.remove('open');
        }
        currentModal = null;
    };
})();
