/**
 * ⚙️🪖🛡️ PanzerSDK - v2.3.0
 * 
 * * 👤 Autore: Valentino Aglianó
 * Perito Informatico / Idoneo ASMEL 2025
 * 
 * * 📜 License: EUPL-1.2
 */
export class PanzerSDK {
    constructor(options = {}) {
        this._sessionSynced = false;
        this.lastUiUpdate = 0;
        
        this.swPath = options.swPath || './ServiceWorker.js';
        this.scope = options.scope || '/';
        this.cacheNamePrefix = options.cacheNamePrefix || 'PA_PANZER_ENGINE_v';

        this.coreAssets = options.coreAssets || [
            './',
            './index.html',
            './Res-PA-manifest.json',
            './PWA.webmanifest',
            './ServiceWorker.js',
            './js/SDK.js',
            './js/app.js'
        ];

        this.checkTimeout = Math.max(options.checkTimeout || 7000, 7000);

        // 🛑 Configurazione blocker Anti-Incognito
        this.incognitoBlocker = {
            Icons: options.incognitoBlocker?.Icons || '🕵️⚠️',
            ID: options.incognitoBlocker?.blockerID || 'panzer-incognito-blocker',
            title: options.incognitoBlocker?.title || "Modalità Incognito Rilevata",
            message: options.incognitoBlocker?.message || "Il motore di sicurezza e la stiva resiliente <strong>PANZER SDK</strong> non possono operare in ambienti di navigazione in incognito o sandbox restrittive su Chromium a causa delle limitazioni di persistenza dei dati.<br><br>Per utilizzare correttamente l'applicazione e garantire la continuità operativa, <strong>apri questa pagina in una finestra di navigazione normale</strong>.",
            buttonText: options.incognitoBlocker?.buttonText || "Ho capito, ricarica...",
            buttonAction: options.incognitoBlocker?.buttonAction || (() => window.location.reload()),
            overlayBg: options.incognitoBlocker?.overlayBg || "rgba(15, 23, 42, 0.95)",
            cardBg: options.incognitoBlocker?.cardBg || "#1e293b",
            borderColor: options.incognitoBlocker?.borderColor || "#334155",
            titleColor: options.incognitoBlocker?.titleColor || "#f87171",
            textColor: options.incognitoBlocker?.textColor || "#94a3b8",
            buttonBg: options.incognitoBlocker?.buttonBg || "#3b82f6",
            buttonTextCol: options.incognitoBlocker?.buttonTextCol || "#ffffff"
        };

        // 🛑 Configurazione blocker Watchdog Cache Wipe.
        this.cacheWipeBlocker = {
            Icons: options.cacheWipeBlocker?.Icons || '🚨🗄️',
            ID: options.cacheWipeBlocker?.blockerID || 'panzer-cache-wipe-blocker',
            title: options.cacheWipeBlocker?.title || "Stiva Locale Cancellata o Compromessa",
            message: options.cacheWipeBlocker?.message || "Il watchdog di sicurezza <strong>PANZER SDK</strong> ha rilevato che la cache protetta o la stiva è stata eliminata o svuotata inaspettatamente.<br><br>Per ripristinare l'integrità dei dati della Pubblica Amministrazione, <strong>è necessario ricaricare e risincronizzare la stiva</strong>.",
            buttonText: options.cacheWipeBlocker?.buttonText || "🔄 Ripristina e Ricarica Stiva",
            buttonAction: options.cacheWipeBlocker?.buttonAction || (() => {
                localStorage.removeItem('panzer_vault_synced');
                window.location.reload();
            }),
            overlayBg: options.cacheWipeBlocker?.overlayBg || "rgba(15, 23, 42, 0.98)",
            cardBg: options.cacheWipeBlocker?.cardBg || "#1e293b",
            borderColor: options.cacheWipeBlocker?.borderColor || "#334155",
            titleColor: options.cacheWipeBlocker?.titleColor || "#f87171",
            textColor: options.cacheWipeBlocker?.textColor || "#94a3b8",
            buttonBg: options.cacheWipeBlocker?.buttonBg || "#2563eb",
            buttonTextCol: options.cacheWipeBlocker?.buttonTextCol || "#ffffff"
        };

        // ⚙️ Hook di callback UI e Telemetria
        this.onProgress = options.onProgress || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onError = options.onError || (() => {});
        this.onSyncStart = options.onSyncStart || (() => {});
        this.onSyncRetry = options.onSyncRetry || (() => {});
        this.onPurgeComplete = options.onPurgeComplete || (() => {});
        this.onLogMessage = options.onLogMessage || (() => {});
        this.onOnline = options.onOnline || (() => {});
        this.onOffline = options.onOffline || (() => {});

        this._registerSW();
        this._setupMessageBridge();
        this._setupNetworkListeners();
        this.initPwaEnvironmentCheck(this.checkTimeout);
        this._initCacheWatchdog();
    }

    _isChromiumEngine() {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
        const isMacSafari = /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
        const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS/.test(ua);

        if (isIOS || isMacSafari || isSafari) return false;

        const hasUserAgentData = !!navigator.userAgentData;
        const isChromiumUA = /Chrome|Chromium|Edg|OPR|CriOS/.test(ua);

        return hasUserAgentData || isChromiumUA;
    }

    _setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.onLogMessage('success', '🌐 SDK: Connessione di rete ripristinata ( ON-LINE ! ).');
            this.onOnline();
        });

        window.addEventListener('offline', () => {
            this.onLogMessage('warn', '📴 SDK: Connessione di rete assente ( OFF-LINE ! ). Operatività in modalità Cache. 🗄️');
            this.onOffline();
        });

        if (!navigator.onLine) {
            this.onOffline();
        }
    }

    _initCacheWatchdog() {
        setInterval(async () => {
            if (!('caches' in window)) return;
            
            const isSyncedLocalStorage = localStorage.getItem('panzer_vault_synced');
            if (!this._sessionSynced && !isSyncedLocalStorage) return;

            try {
                const keys = await caches.keys();
                const hasPanzerCaches = keys.some(k => k.startsWith(this.cacheNamePrefix) || k.startsWith('PA_PANZER'));
                
                if (keys.length === 0 || !hasPanzerCaches) {
                    this.onLogMessage('error', '🚨🐺 SDK: Rilevata cancellazione inaspettata della stiva 🗄️ Cache Storage !');
                    this._showCacheWipeBlocker();
                }
            } catch (e) {
                this.onLogMessage('warn', `⚠️🐺 SDK: Errore lettura cache: ${e.message}`);
            }
        }, 5000);
    }


    _showCacheWipeBlocker() {
        const cfg = this.cacheWipeBlocker;
        if (document.getElementById(cfg.ID)) return;

        document.body.style.overflow = 'hidden';
        if (document.documentElement) document.documentElement.style.overflow = 'hidden';

        const blocker = document.createElement('div');
        blocker.id = cfg.ID;
        blocker.style.cssText = `
            position: fixed !important;
            inset: 0 !important;
            z-index: 2147483647 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: ${cfg.overlayBg} !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 16px !important;
            box-sizing: border-box !important;
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            width: 100% !important;
            max-width: 480px !important;
            background: ${cfg.cardBg} !important;
            border: 1px solid ${cfg.borderColor} !important;
            border-radius: 12px !important;
            padding: 24px !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9) !important;
            text-align: center !important;
            box-sizing: border-box !important;
        `;

        card.innerHTML = `
            <div style="font-size: 42px; margin-bottom: 12px;">${cfg.Icons}</div>
            <h2 style="color: ${cfg.titleColor}; margin-bottom: 12px; font-size: 20px;">${cfg.title}</h2>
            <p style="color: ${cfg.textColor}; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                ${cfg.message}
            </p>
        `;

        const button = document.createElement('button');
        button.textContent = cfg.buttonText;
        button.style.cssText = `
            width: 100% !important;
            background: ${cfg.buttonBg} !important;
            color: ${cfg.buttonTextCol} !important;
            border: none !important;
            padding: 12px 20px !important;
            border-radius: 6px !important;
            font-weight: 600 !important;
            font-size: 15px !important;
            cursor: pointer !important;
        `;
        button.onclick = () => {
            if (typeof cfg.buttonAction === 'function') {
                cfg.buttonAction();
            } else {
                window.location.reload();
            }
        };

        card.appendChild(button);
        blocker.appendChild(card);
        (document.documentElement || document.body).appendChild(blocker);
    }

    async _detectActiveCacheVersion(namecache, fallbackVersion) {
        if (!('caches' in window)) return (namecache + fallbackVersion);
        try {
            const keys = await caches.keys();
            const targetKey = keys.find(k => k.startsWith(this.cacheNamePrefix));
            if (targetKey) {
                const match = targetKey.match(/v(.+)$/);
                if (match && match[1]) {
                    this.onLogMessage('info', `🔍🗄️ SDK: Trovata stiva attiva nel browser -> [ ${targetKey} ]`);
                    return (namecache + match[1]);
                }
            }
        } catch (e) {
            this.onLogMessage('warn', `⚠️🔎🗄️ SDK: Errore durante la scansione delle cache: ${e.message}`);
        }
        return (namecache + fallbackVersion);
    }

    async _registerSW() {
        if ('serviceWorker' in navigator) {
            try {
                const swUrl = new URL(this.swPath, window.location.origin + this.scope).href;
                await navigator.serviceWorker.register(swUrl, { scope: this.scope });
                this.onLogMessage('success', '✅ SW ⚙️🪖 Core_Panzer registrato con successo.');
            } catch (err) {
                this.onLogMessage('warn', `⚠️ Registrazione SW non completata: ${err.message}`);
            }
        } else {
            this.onLogMessage('error', '❌ SW non supportato da questo browser. 🌐🚫');
        }
    }

    _setupMessageBridge() {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || typeof data !== 'object') return;

            switch (data.type) {
                case 'SYNC_START':
                    this.onSyncStart({ total: data.total || 0 });
                    this.onLogMessage('sync', '🚀 SW: Sincronizzazione e cifratura Bunker avviate...');
                    break;

                case 'SYNC_PROGRESS':
                    if (data.details) {
                        const percent = data.details.percent || 0;
                        const now = performance.now();
                        if (percent === 100 || (now - this.lastUiUpdate >= 25)) {
                            this.lastUiUpdate = now;
                            this.onProgress(data.details);
                        }
                    }
                    break;

                case 'SYNC_END':
                    this._sessionSynced = true;
                    this.onLogMessage('success', '✅🗄️ Sincronizzazione e cifratura Bunker completate dal 🪖 Service-Worker !');
                    this.onComplete(data.details || {});
                    this.lastUiUpdate = 0;
                    break;

                case 'SYNC_RETRY':
                    this.onSyncRetry(data);
                    this.onLogMessage('warn', '⚠️🌐 SW: Rete assente o instabile. In attesa di riconnessione... 🔄');
                    this.lastUiUpdate = 0;
                    break;

                case 'CORE_UPDATE_RELOAD':
                    this.onLogMessage('warn', '🔄 SW: Aggiornamento critico ⚙️CORE rilevato. Ricaricamento in corso... 🔄');
                    if (data.msg === 'DESTROY_ALL_CACHE') {
                        this.onError(new Error("Vault compromesso - Tabula rasa eseguita"));
                    }
                    setTimeout(function() {
                        window.location.reload();
                    }, 5000);
                    break;

                default:
                    break;
            }
        });
    }

    async initDB(version, manifestData, overrideCoreAssets = null) {
        this.onLogMessage('sync', `🚀 SDK: Invio comando INIT_DB al 🪖 Service-Worker ( Versione: ${version} )...`);

        if (!('serviceWorker' in navigator)) {
            this.onLogMessage('error', '❌ 🪖 Cache/Service-Worker API non supportata nel browser.');
            this.onError(new Error('ServiceWorker unsupported'));
            return;
        }

        try {
            await navigator.serviceWorker.ready;
            
            if (!navigator.serviceWorker.controller) {
                this.onLogMessage('warn', '⚠️🎮  Nessun controller attivo trovato. 🔄 Ricarico la pagina per stabilire il bridge...');
                window.location.reload();
                return;
            }

            navigator.serviceWorker.controller.postMessage({
                type: 'INIT_DB',
                version: version,
                data: manifestData,
                overrideCoreAssets: overrideCoreAssets || this.coreAssets
            });

        } catch (err) {
            this.onLogMessage('error', `❌ 📨 Errore di comunicazione IPC con il 🪖 Service-Worker: ${err.message}`);
            this.onError(err);
        }
    }

    async purgeVault() {
        if (!('caches' in window)) return;
        try {
            this.onLogMessage('warn', '🚨🗑️ SDK: Avvio purga diretta di tutti i bunker Cache Storage... 🗄️');
            
            // 🔄 Reset flag di sincronizzazione
            this._sessionSynced = false;
            localStorage.removeItem('panzer_vault_synced');
            
            // 🗑️ Eliminazione di tutte le cache dal client.
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
            
            this.onLogMessage('success', '✅🗑️ SDK: Purga totale della stiva 🗄️ completata con successo.');
            this.onPurgeComplete();
        } catch (err) {
            this.onLogMessage('error', `❌🗑️ SDK: Errore durante la purga: ${err.message}`);
        }
    }

    async initPwaEnvironmentCheck(timeoutMs) {
        if (!('serviceWorker' in navigator)) return;

        if (!this._isChromiumEngine()) {
            this.onLogMessage('info', "🛡️ SDK: ⚙️🌐 Motore non-Chromium rilevato ( 🕵️ controllo Incognito bypassato ). ✅");
            return;
        }

        const pwaEventRace = new Promise((resolve) => {
            const timer = setTimeout(() => {
                window.removeEventListener('beforeinstallprompt', eventHandler);
                resolve(false);
            }, timeoutMs);

            const eventHandler = (e) => {
                clearTimeout(timer);
                window.removeEventListener('beforeinstallprompt', eventHandler);
                e.preventDefault();
                window.deferredPrompt = e;
                resolve(true);
            };
            window.addEventListener('beforeinstallprompt', eventHandler);
        });

        const savedPoint = localStorage.getItem('pwa_check_point');
        const now = Date.now();

        if (savedPoint !== null) {
            const diffMinutes = (now - parseInt(savedPoint)) / (1000 * 60);
            if (diffMinutes > 60) return;
        } else {
            try {
                localStorage.setItem('pwa_check_point', now);
            } catch (e) {}
        }

        let installEventTriggered = await pwaEventRace;
        const PWAisInstall = localStorage.getItem('pwa_app_Isinstall');

        if (!installEventTriggered) {
            if (!PWAisInstall) {
                if (!window.matchMedia('(display-mode: standalone)').matches) {
                    this.onLogMessage('warn', "🛡️ SDK: ✅🕵️ Rilevata modalità Incognito / Sandbox su Chromium.");
                    setTimeout(() => {
                        this._showIncognitoBlocker();
                    }, 3000);
                }
            } else {
                this.onLogMessage('info', "🛡️ SDK: Utente No Incognito Mode ! 🕵️✅");
            }
        } else {
            this.onLogMessage('info', "🛡️ SDK: Utente No Incognito Mode ! 🕵️✅");
        }
    }

    _showIncognitoBlocker() {
        const cfg = this.incognitoBlocker;
        if (document.getElementById(cfg.ID)) return;

        document.body.style.overflow = 'hidden';
        if (document.documentElement) document.documentElement.style.overflow = 'hidden';

        const blocker = document.createElement('div');
        blocker.id = cfg.ID;
        blocker.style.cssText = `
            position: fixed !important;
            inset: 0 !important;
            z-index: 2147483647 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: ${cfg.overlayBg} !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 16px !important;
            box-sizing: border-box !important;
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            width: 100% !important;
            max-width: 480px !important;
            background: ${cfg.cardBg} !important;
            border: 1px solid ${cfg.borderColor} !important;
            border-radius: 12px !important;
            padding: 24px !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9) !important;
            text-align: center !important;
            box-sizing: border-box !important;
        `;

        card.innerHTML = `
            <div style="font-size: 42px; margin-bottom: 12px;">${cfg.Icons}</div>
            <h2 style="color: ${cfg.titleColor}; margin-bottom: 12px; font-size: 20px;">${cfg.title}</h2>
            <p style="color: ${cfg.textColor}; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                ${cfg.message}
            </p>
        `;

        const button = document.createElement('button');
        button.textContent = cfg.buttonText;
        button.style.cssText = `
            width: 100% !important;
            background: ${cfg.buttonBg} !important;
            color: ${cfg.buttonTextCol} !important;
            border: none !important;
            padding: 12px 20px !important;
            border-radius: 6px !important;
            font-weight: 600 !important;
            font-size: 15px !important;
            cursor: pointer !important;
        `;
        button.onclick = () => {
            document.body.style.overflow = '';
            if (document.documentElement) document.documentElement.style.overflow = '';
            if (typeof cfg.buttonAction === 'function') {
                cfg.buttonAction();
            } else {
                window.location.reload();
            }
        };

        card.appendChild(button);
        blocker.appendChild(card);
        (document.documentElement || document.body).appendChild(blocker);
    }
}