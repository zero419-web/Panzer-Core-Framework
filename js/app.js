/**
 * ⚙️⚡ App Controller 
 * Dashboard PA & Gestione UI
 * v2.3.6.8
 *
 * * 👤 Autore: Valentino Aglianó
 * Perito Informatico / Idoneo ASMEL 2025
 *
 * * 📜 License: EUPL-1.2
 */
import { PanzerSDK } from './SDK.js';

document.addEventListener('DOMContentLoaded', async () => {
    'use strict';
        // ⚙️📄 Funzione per definire i Core Assets (Sigillata con Object.freeze)
    const getDefinedCoreAssets = () => Object.freeze([
        './',
        './index.html',
        './js/pdf_min.js',
        './js/pdf_worker_min.js',
        './js/app.js',
        './js/SDK.js',
        './ServiceWorker.js',
        './PA_PWA.webmanifest',
        './icon.png',
        './Res-PA-manifest.json'
    ]);
    
    // 🔎🏷️🗄️ Prefisso identificativo della cache scannerizzato dall'SDK (Immutabile)
    const getDefined_CacheNamePrefix = 'PA_PANZER_ENGINE_v';

    // 📜🛒 Il file del manifesto delle risorse della 🏛️ PA.
    const getDefined_Manifest_Assets = './Res-PA-manifest.json';
    
    // 🎯 Percorsi per lo scope e il Service-Worker
    const getDefined_scope = '/Panzer-Core-Framework/';
    const getDefined_swPath = './ServiceWorker.js';

    // ❄️ Sigilliamo l'intero perimetro di configurazione globale del client
    Object.freeze(getDefinedCoreAssets());

    // 🎯 DOM UI Elements
    const statusBadge = document.getElementById('PA-status-badge');
    const btnSync = document.getElementById('PA-btn-sync');
    const btnPurge = document.getElementById('PA-btn-purge');
    const btnClearLog = document.getElementById('PA-btn-clear-log');
    const btnRefreshStorage = document.getElementById('PA-btn-refresh-storage');

    const progressBar = document.getElementById('PA-progress-bar');
    const progressText = document.getElementById('PA-progress-text');

    const metricCompleted = document.getElementById('metric-completed');
    const metricTotal = document.getElementById('metric-total');
    const metricFailed = document.getElementById('metric-failed');
    const metricRetries = document.getElementById('metric-retries');

    const terminalOutput = document.getElementById('PA-terminal-output');
    const storageTbody = document.getElementById('PA-storage-tbody');
    const storageSearch = document.getElementById('PA-storage-search');
    const toggleCoreAssets = document.getElementById('PA-toggle-core-assets');

    // 🔒 Modal Sandbox CSP & Zoom
    const sandboxModal = document.getElementById('PA-sandbox-modal');
    const sandboxFrame = document.getElementById('PA-sandbox-frame');
    const sandboxTitle = document.getElementById('PA-sandbox-title');
    const btnCloseSandbox = document.getElementById('PA-btn-close-sandbox');
    const btnZoomIn = document.getElementById('PA-btn-zoom-in');
    const btnZoomOut = document.getElementById('PA-btn-zoom-out');

    let manifestCache = null;
    let activeObjectUrl = null;
    let activeRawBuffer = null;
    let currentZoom = 1.0;
    let totalCombinedCount = 0;

    const logToTerminal = (level, text) => {
        const timeString = new Date().toLocaleTimeString('it-IT', { hour12: false });
        const line = document.createElement('div');
        const classMap = {
            info: 'log-info',
            success: 'log-success',
            warn: 'log-warn',
            error: 'log-error',
            sync: 'log-sync',
            vault: 'log-vault'
        };
        line.className = `terminal-line ${classMap[level] || 'log-info'}`;
        line.textContent = `[${timeString}] ${text}`;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const setStatusBadge = (stateText, badgeClass) => {
        statusBadge.textContent = stateText;
        statusBadge.className = `badge-status ${badgeClass}`;
    };

    // 🔍❄️ Helper per MIME Type
    const CoreUtils = Object.freeze({
        detectMimeType(url, headerType) {
            if (headerType && headerType !== 'application/octet-stream' && headerType !== 'text/plain') {
                return headerType;
            }
            const ext = (url || '').split('.').pop().toLowerCase();
            const mimeMap = Object.freeze({
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'webp': 'image/webp',
                'gif': 'image/gif',
                'svg': 'image/svg+xml',
                'pdf': 'application/pdf'
            });
            return mimeMap[ext] || headerType || 'application/octet-stream';
        }
    });

    // 🔭 Zoom dinamico universale
    const applyZoom = () => {
        try {
            const iframeDoc = sandboxFrame.contentDocument || sandboxFrame.contentWindow.document;
            const targetImg = iframeDoc.getElementById('target-img');
            if (targetImg) {
                targetImg.style.transform = `scale(${currentZoom})`;
                logToTerminal('vault', `🔍🖼️ Zoom immagine: ${Math.round(currentZoom * 100)}%`);
                return;
            }

            const canvases = iframeDoc.querySelectorAll('canvas');
            if (canvases.length > 0) {
                canvases.forEach(canvas => {
                    const baseW = parseFloat(canvas.dataset.baseWidth);
                    const baseH = parseFloat(canvas.dataset.baseHeight);
                    if (baseW && baseH) {
                        canvas.style.width = (baseW * currentZoom) + 'px';
                        canvas.style.height = (baseH * currentZoom) + 'px';
                    }
                });
                logToTerminal('vault', `🔍📄 Zoom PDF: ${Math.round(currentZoom * 100)}%`);
            }
        } catch (e) {
            console.warn("❌🔎 Zoom non applicabile.", e);
        }
    };

    btnZoomIn.addEventListener('click', () => {
        currentZoom = Math.min(currentZoom + 0.25, 3.0);
        applyZoom();
    });

    btnZoomOut.addEventListener('click', () => {
        currentZoom = Math.max(currentZoom - 0.25, 0.25);
        applyZoom();
    });

    // 🔒 Visore Sandbox Protetto.
    let activeViewerBlobUrl = null;
    let activeLibBlobUrl = null;
    let activeMainScriptBlobUrl = null;
    const openInSandbox = async (url, fileName) => {
        try {
            const isMobile = window.innerWidth <= 768;
            currentZoom = isMobile ? 0.5 : 1.0;

            logToTerminal('vault', `🫙🔒 Apertura visore protetto per: ${fileName || url} ( Zoom: ${Math.round(currentZoom * 100)}% )`);
            
            // 🌐🏁 Fetch parallelo.
            const [response, pdfLibRes] = await Promise.all([
                fetch(url),
                fetch('js/pdf_min.js')
            ]);

            if (!response || !response.ok) throw new Error(`HTTP ${response?.status || 'Risorsa irreperibile'}`);
            if (!pdfLibRes || !pdfLibRes.ok) throw new Error(`Impossibile prelevare la libreria pdf_min.js`);

            const pdfLibText = await pdfLibRes.text();
            activeRawBuffer = await response.arrayBuffer();
            const rawMime = response.headers.get('Content-Type') || 'application/octet-stream';
            const mimeType = CoreUtils.detectMimeType(url, rawMime);

            if (btnZoomIn && btnZoomOut) {
                btnZoomIn.disabled = false;
                btnZoomOut.disabled = false;
                btnZoomIn.style.opacity = '1';
                btnZoomIn.style.cursor = 'pointer';
                btnZoomOut.style.opacity = '1';
                btnZoomOut.style.cursor = 'pointer';
            }

            // 🧹 Pulizia vecchi URL in memoria
            if (activeObjectUrl) { URL.revokeObjectURL(activeObjectUrl); activeObjectUrl = null; }
            if (activeViewerBlobUrl) { URL.revokeObjectURL(activeViewerBlobUrl); activeViewerBlobUrl = null; }
            if (activeLibBlobUrl) { URL.revokeObjectURL(activeLibBlobUrl); activeLibBlobUrl = null; }
            if (activeMainScriptBlobUrl) { URL.revokeObjectURL(activeMainScriptBlobUrl); activeMainScriptBlobUrl = null; }

            // 🛡️ Conversione Base64 a blocchi
            const bytes = new Uint8Array(activeRawBuffer);
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.subarray(i, i + chunkSize);
                binary += String.fromCharCode.apply(null, chunk);
            }
            const base64Data = btoa(binary);

            // 🛡️ Blob Libreria PDF_min.js
            const pdfLibBlob = new Blob([pdfLibText], { type: 'application/javascript' });
            activeLibBlobUrl = URL.createObjectURL(pdfLibBlob);

            let viewerHtml = '';

            if (mimeType.startsWith('image/')) {
                const dataUrl = `data:${mimeType};base64,${base64Data}`;
                viewerHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            * { margin:0; padding:0; box-sizing:border-box; user-select:none; -webkit-user-select:none; }
                            body, html { width:100%; height:100%; background:#000; overflow:auto; display:flex; justify-content:center; align-items:center; }
                            .container { width:100%; height:100%; display:flex; justify-content:center; align-items:center; padding:20px; }
                            img { max-width: 100%; height: auto; object-fit: contain; pointer-events: none; -webkit-user-drag: none; transform: scale(${currentZoom}); transition: transform 0.15s ease; }
                        </style>
                    </head>
                    <body oncontextmenu="return false;" ondragstart="return false;" onselectstart="return false;">
                        <div class="container">
                            <img id="target-img" src="${dataUrl}" alt="Immagine protetta" />
                        </div>
                    </body>
                    </html>
                `;
            } else if (mimeType.includes('pdf')) {
                const mainScriptText = `
                    const statusLog = document.getElementById('status-log');
                    function logStep(msg) {
                        const timeStr = new Date().toLocaleTimeString();
                        const line = document.createElement('div');
                        line.textContent = '[' + timeStr + '] ' + msg;
                        if (statusLog) {
                            statusLog.appendChild(line);
                            statusLog.scrollTop = statusLog.scrollHeight;
                        }
                    }

                    async function renderSecurePDF() {
                        try {
                            logStep("Controllo disponibilità oggetto pdfjsLib...");
                            if (typeof pdfjsLib === 'undefined') {
                                throw new Error("pdfjsLib non definito (Script Blob non eseguito).");
                            }
                            logStep("Libreria PDF.js caricata con successo.");

                            logStep("Inizio decodifica stringa Base64 in Array binario...");
                            const base64Str = "${base64Data}";
                            const binaryString = atob(base64Str);
                            const len = binaryString.length;
                            const rawData = new Uint8Array(len);
                            for (let i = 0; i < len; i++) {
                                rawData[i] = binaryString.charCodeAt(i);
                            }
                            logStep("Decodifica completata. Byte totali: " + rawData.length);

                            logStep("Avvio parser documento PDF (pdfjsLib.getDocument)...");
                            const loadingTask = pdfjsLib.getDocument({
                                data: rawData,
                                disableWorker: true,
                                isEvalSupported: false
                            });

                            const pdfDoc = await loadingTask.promise;
                            logStep("PDF analizzato! Pagine totali: " + pdfDoc.numPages);

                            const loadingEl = document.getElementById('loading');
                            if (loadingEl) loadingEl.style.display = 'none';

                            const container = document.getElementById('pdf-wrapper');
                            const initialZoom = ${currentZoom};

                            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                                logStep("Rendering pagina " + pageNum + " di " + pdfDoc.numPages + "...");
                                const page = await pdfDoc.getPage(pageNum);
                                const viewport = page.getViewport({ scale: 1.5 });
                                
                                const canvas = document.createElement('canvas');
                                const context = canvas.getContext('2d');
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;

                                canvas.dataset.baseWidth = viewport.width;
                                canvas.dataset.baseHeight = viewport.height;
                                canvas.style.width = (viewport.width * initialZoom) + 'px';
                                canvas.style.height = (viewport.height * initialZoom) + 'px';

                                container.appendChild(canvas);

                                await page.render({
                                    canvasContext: context,
                                    viewport: viewport
                                }).promise;
                                logStep("Pagina " + pageNum + " renderizzata con successo.");
                            }
                            logStep("✅ Rendering completato!");
                        } catch (err) {
                            console.error(err);
                            logStep("❌ ERRORE: " + err.message);
                            const loadingEl = document.getElementById('loading');
                            if (loadingEl) {
                                loadingEl.innerHTML = '<div style="color:#f87171; font-weight:bold;">❌ Errore critico nel rendering PDF:</div><div style="color:#cbd5e1; font-size:12px; margin-top:8px;">' + err.message + '</div>';
                            }
                        }
                    }

                    window.addEventListener('DOMContentLoaded', renderSecurePDF);
                `;

                const mainScriptBlob = new Blob([mainScriptText], { type: 'application/javascript' });
                activeMainScriptBlobUrl = URL.createObjectURL(mainScriptBlob);

                viewerHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            * { margin:0; padding:0; box-sizing:border-box; user-select:none; -webkit-user-select:none; }
                            body, html { width:100%; height:100%; background:#0f172a; overflow:auto; -webkit-overflow-scrolling:touch; }
                            #pdf-wrapper { display:flex; flex-direction:column; align-items:center; padding:20px 10px; min-width:100%; width:max-content; margin:0 auto; gap:15px; }
                            canvas { max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.6); background:#fff; border-radius:6px; pointer-events:none; display:block; }
                            .loading { color:#f8fafc; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; gap:12px; padding: 20px; text-align: center; }
                            .log-box { width: 100%; max-width: 450px; height: 180px; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 10px; font-family: monospace; font-size: 11px; color: #38bdf8; text-align: left; overflow-y: auto; }
                        </style>
                        <!-- Script caricati esclusivamente tramite Blob URL esterni (Conforme CSP) -->
                        <script src="${activeLibBlobUrl}"></script>
                        <script src="${activeMainScriptBlobUrl}"></script>
                    </head>
                    <body oncontextmenu="return false;" ondragstart="return false;" onselectstart="return false;">
                        <div id="loading" class="loading">
                            <div style="font-size: 16px; font-weight: bold;">⏳📄 PDF Loading...</div>
                            <div id="status-log" class="log-box">[0.0s] Visore avviato, esecuzione script blob in corso...</div>
                        </div>
                        <div id="pdf-wrapper"></div>
                    </body>
                    </html>
                `;
            } else {
                const dataUrl = `data:${mimeType};base64,${base64Data}`;
                viewerHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"></head>
                    <body style="margin:0; background:#111; display:flex; justify-content:center; align-items:center; height:100vh;">
                        <object data="${dataUrl}" type="${mimeType}" width="100%" height="100%"></object>
                    </body>
                    </html>
                `;
            }

            // 🫙 Incapsulamento.
            const viewerBlob = new Blob([viewerHtml], { type: 'text/html' });
            activeViewerBlobUrl = URL.createObjectURL(viewerBlob);

            sandboxFrame.setAttribute('sandbox', 'allow-scripts');
            sandboxFrame.src = activeViewerBlobUrl;

            sandboxTitle.textContent = `🔎🔒 ${fileName || url}`;
            sandboxModal.classList.add('active');

            logToTerminal('success', `🛡📦️ Documento Cifrato inviato al visore.`);
        } catch (err) {
            logToTerminal('error', `❌ 👁️‍🗨️Errore apertura visore: ${err.message}`);
        }
    };

    const closeSandbox = () => {
        sandboxModal.classList.remove('active');
        sandboxFrame.src = 'about:blank';

        if (activeViewerBlobUrl) { URL.revokeObjectURL(activeViewerBlobUrl); activeViewerBlobUrl = null; }
        if (activeLibBlobUrl) { URL.revokeObjectURL(activeLibBlobUrl); activeLibBlobUrl = null; }
        if (activeMainScriptBlobUrl) { URL.revokeObjectURL(activeMainScriptBlobUrl); activeMainScriptBlobUrl = null; }

        if (activeRawBuffer) {
            try {
                const secureView = new Uint8Array(activeRawBuffer);
                secureView.fill(0);
                logToTerminal('vault', '🧹📄 Risorsa Distrutta dalla RAM !');
            } catch (_) {}
            activeRawBuffer = null;
        }
        if (activeObjectUrl) {
            URL.revokeObjectURL(activeObjectUrl);
            activeObjectUrl = null;
        }
        logToTerminal('info', '🔎🔒 Visore chiuso !');
    };

    btnCloseSandbox.addEventListener('click', closeSandbox);

    // 🚀 Inizializzazione SDK con configurazione personalizzata dei blocker e trigger pulito su onOnline
    const sdk = new PanzerSDK(Object.freeze({
        swPath: getDefined_swPath,
        scope: getDefined_scope,
        coreAssets: getDefinedCoreAssets(),
        cacheNamePrefix: getDefined_CacheNamePrefix,
        checkTimeout: 6660,
    // 🛑 Config personalizzata dei popup.
        incognitoBlocker: {
            Icons: `⚠️ ❌🕵️`,
            blockerID: 'PA_popup_Incognite',
            title: "Modalità Protetta Richiesta",
            message: "Il sistema di sicurezza <strong>🪖 PANZER SDK</strong> richiede una sessione di navigazione standard per garantire la persistenza dei documenti della Pubblica Amministrazione.<br><br>Ti invitiamo ad aprire l'applicazione in una <strong>finestra di navigazione normale</strong>.",
            buttonText: "🔄 Ricarica in modalità normale",
            buttonAction: () => {
                localStorage.removeItem('pwa_check_point');
                window.location.reload();
            },
            overlayBg: "rgba(15, 23, 42, 0.98)",
            cardBg: "#1e293b",
            borderColor: "#475569",
            titleColor: "#f87171",
            textColor: "#cbd5e1",
            buttonBg: "#2563eb",
            buttonTextCol: "#ffffff"
        },
        cacheWipeBlocker: {
            Icons: `🚨 ❌🗄️`,
            blockerID: 'PA_popup_CacheWipe',
            title: "Stiva Locale Compromessa o Svuotata",
            message: "Il 🐺 watchdog di sicurezza <strong>🪖 PANZER SDK</strong> ha rilevato la rimozione imprevista della ⚠️❌🗄️ cache protetta.<br><br>È necessario ricaricare e risincronizzare la stiva della Pubblica Amministrazione.",
            buttonText: "🔄🗄️ Risincronizza e Ripristina Stiva",
            buttonAction: () => {
                localStorage.removeItem('panzer_vault_synced');
                window.location.reload();
            },
            overlayBg: "rgba(15, 23, 42, 0.98)",
            cardBg: "#1e293b",
            borderColor: "#475569",
            titleColor: "#f87171",
            textColor: "#cbd5e1",
            buttonBg: "#2563eb",
            buttonTextCol: "#ffffff"
        },
        purgeSuccessBlocker: {
            Icons: '✅🗑️',
            blockerID: 'PA_popup_PurgeSuccess',
            title: "Purga Volontaria Completata",
            message: "Hai pulito manualmente la stiva 🗑️🗄️ e la cache protetta.<br><br>Il sistema è pronto: <strong>ricarica la pagina</strong> per rigenerare il 🪖 Service-Worker e ripartire con un'installazione pulita.",
            buttonText: "🔄 Ricarica e Riavvia Stiva",
            buttonAction: () => {
                window.location.reload();
            },
            overlayBg: "rgba(15, 23, 42, 0.98)",
            cardBg: "#1e293b",
            borderColor: "#475569",
            titleColor: "#38bdf8",
            textColor: "#cbd5e1",
            buttonBg: "#2563eb",
            buttonTextCol: "#ffffff"
        },
        onLogMessage: (level, msg) => logToTerminal(level, msg),
        
        // 🌐 Evento di Ritorno On-line:
        onOnline: () => {
            setStatusBadge('🌐 Rete Online - Sincronizzazione...', 'badge-sync');
            logToTerminal('sync', '🛡️ SDK: 🌐 Connessione on-line ripristinata. ✅🔄 Avvio automatico sincronizzazione stiva...');
            btnSync.click();
        },

        // 📴 Evento Off-line
        onOffline: () => {
            setStatusBadge('📴 Off-line - Modalità Cache 🗄️', 'badge-warn');
            logToTerminal('warn', '🛡️ SDK: 📴 Dispositivo offline. Operatività garantita in modalità 🗄️ Cache protetta.');
        },

        onSyncStart: () => {
            setStatusBadge('📡📥⚡ Sincronizzazione...', 'badge-sync');
            const includeCore = toggleCoreAssets ? toggleCoreAssets.checked : true;
            const coreCount = includeCore ? getDefinedCoreAssets().length : 0;
            const totalFiles = includeCore ? totalCombinedCount : (manifestCache?.assets?.length || 0);
            
            metricTotal.textContent = totalFiles;
            metricCompleted.textContent = '0';
            progressBar.value = 0;
            progressText.textContent = `0% ( 0 / ${totalFiles} )`;
        },
        onProgress: (details) => {
            if (details) {
                const includeCore = toggleCoreAssets ? toggleCoreAssets.checked : true;
                const coreCount = includeCore ? getDefinedCoreAssets().length : 0;
                const grandTotal = includeCore ? (totalCombinedCount > 0 ? totalCombinedCount : (coreCount + (details.total || 0))) : (manifestCache?.assets?.length || details.total || 0);
                const completedTotal = (includeCore ? coreCount : 0) + (details.current || 0);
                const pct = grandTotal > 0 ? Math.min(100, Math.round((completedTotal / grandTotal) * 100)) : (details.percent ? Math.round(details.percent) : 0);

                progressBar.value = pct;
                progressText.textContent = `${pct}% ( ${completedTotal} / ${grandTotal} )`;

                metricCompleted.textContent = completedTotal;
                metricTotal.textContent = grandTotal;
                metricFailed.textContent = details.request_failed || 0;
                metricRetries.textContent = details.retries || 0;
            }
        },
        onSyncRetry: (details) => {
            setStatusBadge('📡📥🔄 Retry Rete...', 'badge-warn');
            if (details) {
                if (details.retries !== undefined) metricRetries.textContent = details.retries;
                if (details.request_failed !== undefined) metricFailed.textContent = details.request_failed;
            }
        },
        onComplete: (data) => {
            localStorage.setItem('panzer_vault_synced', 'true');

            progressBar.value = 100;
            progressText.textContent = '100% ( Completato )';
            setStatusBadge('🛡️🗄️ Stiva Pronta', 'badge-ready');
            const includeCore = toggleCoreAssets ? toggleCoreAssets.checked : true;
            const grandTotal = includeCore ? totalCombinedCount : (manifestCache?.assets?.length || 0);
            metricCompleted.textContent = grandTotal;
            metricTotal.textContent = grandTotal;
            if (data) {
                metricFailed.textContent = data.request_failed || 0;
                metricRetries.textContent = data.retries || 0;
            }
            renderStorageTable();
        },
        onPurgeComplete: () => {
            progressBar.value = 0;
            progressText.textContent = '0% ( 0 / 0 )';
            metricCompleted.textContent = '0';
            metricFailed.textContent = '0';
            metricRetries.textContent = '0';
            setStatusBadge('🗑️⚡ Purgato', 'badge-init');
            renderStorageTable();
        },
        onError: (err) => {
            setStatusBadge('🚨📡📥 Errore Sync', 'badge-error');
        }
    }));

    // 📊🔎🗄️ Rendering Tabella Ispezione Stiva.
    const renderStorageTable = async () => {
        const showCore = toggleCoreAssets ? toggleCoreAssets.checked : true;

        const coreAssetObjects = showCore ? getDefinedCoreAssets().map(url => {
            let mime = 'text/plain';
            if (url.endsWith('.js')) mime = 'application/javascript';
            else if (url.endsWith('.html') || url === '/') mime = 'text/html';
            else if (url.endsWith('.json') || url.endsWith('.webmanifest')) mime = 'application/json';
            else if (url.endsWith('.png')) mime = 'image/png';
            else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) mime = 'image/jpeg';

            return {
                url: url,
                type: mime,
                category: 'System Core',
                size: 0
            };
        }) : [];

        const manifestAssets = (manifestCache && manifestCache.assets) ? manifestCache.assets : [];

        const assetMap = new Map();
        [...coreAssetObjects, ...manifestAssets].forEach(item => {
            if (!assetMap.has(item.url)) {
                assetMap.set(item.url, item);
            }
        });

        const allAssets = Array.from(assetMap.values());

    // 🛡️ Hardening: Catturiamo il valore grezzo e ripuliamolo dai caratteri di controllo o potenziali injection
    const rawQuery = storageSearch.value || '';
    const filterQuery = rawQuery.toLowerCase().replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

    const filteredAssets = allAssets.filter(asset => {
        const url = (asset.url || '').toLowerCase();
        const type = (asset.type || '').toLowerCase();
        const category = (asset.category || '').toLowerCase();
        return url.includes(filterQuery) || type.includes(filterQuery) || category.includes(filterQuery);
    });
    

    // 🗑️ Svuotamento contenitore precedente.
        storageTbody.innerHTML = '';

        if (filteredAssets.length === 0) {
            storageTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nessuna risorsa trovata per il filtro applicato.</td></tr>`;
            return;
        }

        const assetsWithCacheState = await Promise.all(
            filteredAssets.map(async (asset) => {
                let isCached = false;
                if ('caches' in window) {
                    try {
                        isCached = !!(await caches.match(asset.url));
                    } catch (e) {
                        isCached = false;
                    }
                }
                return { asset, isCached };
            })
        );

    // 🏗️ Creazione contenitore virtuale.
const fragment = document.createDocumentFragment();

for (const { asset, isCached } of assetsWithCacheState) {
    const tr = document.createElement('tr');
    const sizeFormatted = asset.size ? (asset.size / 1024).toFixed(1) + ' KB' : 'N/A ( Core ⚙️📄 )';
    
    const cacheBadge = isCached
        ? `<span style="color: var(--accent-green); font-weight: bold;">🟢🗄️ Cifrato</span>`
        : `<span style="color: var(--text-muted);">🔴🗄️ Non Presente</span>`;

    const tdInfo = document.createElement('td');
    const strongUrl = document.createElement('strong');
    strongUrl.textContent = asset.url || '';
    const br = document.createElement('br');
    const smallCat = document.createElement('small');
    smallCat.style.color = 'var(--text-muted)';
    smallCat.textContent = `Cat: ${asset.category || 'N/A'}`;
    tdInfo.appendChild(strongUrl);
    tdInfo.appendChild(br);
    tdInfo.appendChild(smallCat);

    const tdType = document.createElement('td');
    const codeType = document.createElement('code');
    codeType.textContent = asset.type || 'unknown';
    tdType.appendChild(codeType);

    const tdSize = document.createElement('td');
    tdSize.textContent = sizeFormatted;

    const tdCache = document.createElement('td');
    tdCache.innerHTML = cacheBadge; // I badge di stato interni rimangono sicuri

    const tdAction = document.createElement('td');
    const actionDiv = document.createElement('div');
    actionDiv.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap;';

    const btnSandbox = document.createElement('button');
    btnSandbox.className = 'btn btn-sm btn-sandbox-trigger';
    btnSandbox.setAttribute('data-url', asset.url || '');
    btnSandbox.style.cssText = 'border-color: var(--accent-purple); color: var(--accent-purple); cursor: pointer;';
    btnSandbox.textContent = '🔒👁 Visore ❌💾';
    
    actionDiv.appendChild(btnSandbox);
    tdAction.appendChild(actionDiv);

    // Assemblaggio della riga
    tr.appendChild(tdInfo);
    tr.appendChild(tdType);
    tr.appendChild(tdSize);
    tr.appendChild(tdCache);
    tr.appendChild(tdAction);

// 🪝 Aggancio listener sul tr Nel DOM.
    const attachedBtn = tr.querySelector('.btn-sandbox-trigger');
    if (attachedBtn) {
        attachedBtn.addEventListener('click', (e) => {
            const targetUrl = e.currentTarget.getAttribute('data-url');
            openInSandbox(targetUrl, targetUrl.split('/').pop());
        });
    }
    fragment.appendChild(tr);
}

        // 🚀 Singola operazione atomica sul DOM.
        storageTbody.appendChild(fragment);

        logToTerminal('vault', `🔎🗄️ Ispezione stiva aggiornata: ${filteredAssets.length} risorse visualizzate via DocumentFragment.`);
    };

    // 📥📜🛒 Caricamento del Manifesto
    try {
        logToTerminal('info', `📥📜🛒 Recupero file [ ${getDefined_Manifest_Assets} ] ...`);
        const res = await fetch(getDefined_Manifest_Assets);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // ❄️ Congelamento Manifest assets.
        const deepFreeze = (obj) => {
            Object.getOwnPropertyNames(obj).forEach(name => {
                const prop = obj[name];
                if (prop && typeof prop === 'object') deepFreeze(prop);
            });
            return Object.freeze(obj);
        };
        manifestCache = deepFreeze(await res.json());

        logToTerminal('success', `✅📜🛒 Manifesto caricato: ${manifestCache.ente} (v${manifestCache.version})`);
        
        totalCombinedCount = new Set([...getDefinedCoreAssets(), ...manifestCache.assets.map(a => a.url)]).size;
        const includeCore = toggleCoreAssets ? toggleCoreAssets.checked : true;
        const grandTotal = includeCore ? totalCombinedCount : (manifestCache?.assets?.length || 0);
        metricTotal.textContent = grandTotal;
        setStatusBadge('⚡🪫 Inattivo', 'badge-init');
        renderStorageTable();

    } catch (err) {
        logToTerminal('error', `❌ Errore caricamento, 📜🛒 ${getDefined_Manifest_Assets} : ${err.message}`);
        setStatusBadge('🚨📜🛒 Errore Manifesto', 'badge-error');
    }

    // 🎮 Event Handlers
    btnSync.addEventListener('click', () => {
      setTimeout(() => {
        if (!manifestCache) {
            logToTerminal('error', '❌📜🛒 Manifesto assets non disponibile !');
            return;
        }

        logToTerminal('sync', '🚀 Avvio sincronizzazione ( ⚙️📄 Core-File + Manifesto Assets 📜🛒 ) ...');
        sdk.initDB(manifestCache?.version, manifestCache, getDefinedCoreAssets());
      }, 666);
    });

    btnPurge.addEventListener('click', () => {
        if (confirm('🚨🗑🗄 Confermi la purga totale della stiva e della cache locale?️')) {
            sdk.purgeVault();
        }
    });

    btnClearLog.addEventListener('click', () => {
        terminalOutput.innerHTML = '';
        logToTerminal('info', '🧹 Console pulita.');
    });

    btnRefreshStorage.addEventListener('click', () => {
        renderStorageTable();
    });

    storageSearch.addEventListener('input', () => {
        renderStorageTable();
    });

    if (toggleCoreAssets) {
        toggleCoreAssets.addEventListener('change', () => {
            renderStorageTable();
            if (manifestCache) {
                const includeCore = toggleCoreAssets.checked;
                const grandTotal = includeCore ? totalCombinedCount : (manifestCache.assets ? manifestCache.assets.length : 0);
                metricTotal.textContent = grandTotal;
                if (parseInt(metricCompleted.textContent) > grandTotal) {
                    metricCompleted.textContent = grandTotal;
                }
            }
        });
    }
});