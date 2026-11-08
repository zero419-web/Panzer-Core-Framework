/**
 * ⚙️🪖🛡️ PanzerSDK - v2.1.1
 * 
 *
 * * 👤 Autore: Valentino Aglianó
 * Perito Informatico / Idoneo ASMEL 2025
 *
 * * 📜 License: EUPL-1.2
 */
export class PanzerSDK {
    constructor(options = {}) {
        this.lastUiUpdate = 0;
        
        this.swPath = options.swPath || './ServiceWorker.js';
        this.scope = options.scope || '/';
        this.coreAssets = options.coreAssets || [
            './',
            './index.html',
            './Res-PA-manifest.json',
            './PWA.webmanifest',
            './ServiceWorker.js',
            './js/SDK.js',
            './js/app.js'
        ];

        // ⏱️ Timeout del Watchdog configurabile (minimo 7000ms)
        this.checkTimeout = Math.max(options.checkTimeout || 7000, 7000);

        // 🛑 Configurazione dinamica personalizzabile per l'overlay Anti-Incognito
        this.incognitoBlocker = {
            Icons: options.incognitoBlocker?.Icons || options.incognitoBlocker?.CardIcon || '🕵️⚠️',
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

        // ⚙️ Hook di callback UI e Telemetria.
        this.onProgress = options.onProgress || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onError = options.onError || (() => {});
        this.onSyncStart = options.onSyncStart || (() => {});
        this.onSyncRetry = options.onSyncRetry || (() => {});
        this.onPurgeComplete = options.onPurgeComplete || (() => {});
        this.onLogMessage = options.onLogMessage || (() => {});

        this._registerSW();
        this._setupMessageBridge();
        this.initPwaEnvironmentCheck(this.checkTimeout);
    }

    /**
     * 🔍 Cicla le cache del browser per trovare una versione attiva di PA_PANZER_ENGINE
     */
    async _detectActiveCacheVersion(namecache, fallbackVersion) {
        if (!('caches' in window)) return (namecache + fallbackVersion);
        try {
            const keys = await caches.keys();
            const targetKey = keys.find(k => k.startsWith('PA_PANZER_ENGINE_v'));
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

    /**
     * 📡 Registrazione del Service Worker.
     */
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

    /**
     * 🔀 BRIDGE IPC
     * ( Inter-Process Communication ):
     * Ascolta i messaggi e la telemetria trasmessi dal ServiceWorker.js
     */
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

                    // Aggiorna se siamo al 100% o se sono passati almeno 25ms dall'ultimo update
                        if (percent === 100 || (now - this.lastUiUpdate >= 25)) {
                            this.lastUiUpdate = now;
                            this.onProgress(data.details);
                        }
                    }
                    break;

                case 'SYNC_END':
                    this.onLogMessage('success', '✅ Sincronizzazione e cifratura Bunker completate dal Service Worker!');
                    this.onComplete(data.details || {});
                    this.lastUiUpdate = 0;
                    break;

                case 'SYNC_RETRY':
                    this.onSyncRetry(data);
                    this.onLogMessage('warn', '⚠️ SW: Rete assente o instabile. In attesa di riconnessione...');
                    this.lastUiUpdate = 0;
                    break;

                case 'CORE_UPDATE_RELOAD':
                    this.onLogMessage('warn', '🔄 SW: Aggiornamento critico Core rilevato. Ricaricamento in corso...');
                    if (data.msg === 'DESTROY_ALL_CACHE') {
                        this.onError(new Error("Vault compromesso - Tabula rasa eseguita"));
                        
                    }
                    setTimeout(function() {
                        window.location.reload();
                    }, 5000); // 5s
                    break;

                default:
                    break;
            }
        });
    }

    /**
     * 🚀 INIZIALIZZAZIONE & SYNC:
     * Invia il comando INIT_DB al 
     * ServiceWorker.js, delegando il 
     * DNA Check e la cifratura AES-GCM.
     */
    async initDB(version, manifestData, overrideCoreAssets = null) {
        this.onLogMessage('sync', `🚀 SDK: Invio comando INIT_DB al Service Worker (Versione: ${version})...`);

        if (!('serviceWorker' in navigator)) {
            this.onLogMessage('error', '❌ Cache/Service Worker API non supportata nel browser.');
            this.onError(new Error('ServiceWorker unsupported'));
            return;
        }

        try {
            await navigator.serviceWorker.ready;
            
            if (!navigator.serviceWorker.controller) {
                this.onLogMessage('warn', '⚠️ Nessun controller attivo trovato. Ricarico la pagina per stabilire il bridge...');
                window.location.reload();
                return;
            }

            // Invio del pacchetto di configurazione al Service Worker via postMessage[span_11](start_span)[span_11](end_span)[span_12](start_span)[span_12](end_span)
            navigator.serviceWorker.controller.postMessage({
                type: 'INIT_DB',
                version: version,
                data: manifestData,
                overrideCoreAssets: overrideCoreAssets || this.coreAssets
            });

        } catch (err) {
            this.onLogMessage('error', `❌ Errore di comunicazione IPC con il Service Worker: ${err.message}`);
            this.onError(err);
        }
    }

    /**
     * 🚨 Purga diretta di tutte le istanze Cache Storage dal Client.
     */
    async purgeVault() {
        if (!('caches' in window)) return;
        try {
            this.onLogMessage('warn', '🚨🗑️ Avvio purga diretta di tutti i bunker Cache Storage... 🗄️');
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
            this.onLogMessage('success', '🗑 Purga totale della stiva 🗄️ completata con successo. ✅');
            this.onPurgeComplete();
        } catch (err) {
            this.onLogMessage('error', `❌🗑️ Errore durante la purga: ${err.message}`);
        }
    }

    /**
     * 🕵️‍♂️ WATCHDOG AMBIENTALE: Rilevamento Incognito su Chromium.
     */
    async initPwaEnvironmentCheck(timeoutMs) {
        if (!('serviceWorker' in navigator)) return;

        const os = this._getMobileOS();
        if (os === 'iOS') return;

        let profile;
        try {
            profile = await this._getFullBrowserProfile();
        } catch (e) {
            profile = { brands: [] };
        }

        const isChromium = profile.brands?.some(item =>
            item.brand.toLowerCase().includes('chrome') ||
            item.brand.toLowerCase().includes('chromium')
        ) || false;

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
            if (isChromium && !PWAisInstall) {
                if (!window.matchMedia('(display-mode: standalone)').matches) {
                    this.onLogMessage('warn', "PWA: 🕵️ Rilevata modalità Incognito / Sandbox su Chromium.");
                    setTimeout(() => {
                        this._showIncognitoBlocker();
                    }, 3000);
                }
            } else {
                this.onLogMessage('info', "PWA: Utente No Incognito Mode ! ✅");
            }
        } else {
            this.onLogMessage('info', "PWA: Utente No Incognito Mode ! ✅");
        }
    }

    /**
      * 🛑 INTERFACCIA VISIVA DI 
      * BLOCCO ANTI-INCOGNITO
     */
    _showIncognitoBlocker() {
        const cfg = this.incognitoBlocker;
        if (document.getElementById(cfg.ID)) return;

        document.body.style.overflow = 'hidden';
        if (document.documentElement) {
            document.documentElement.style.overflow = 'hidden';
        }

        const blocker = document.createElement('div');
        blocker.id = cfg.ID || 'panzer-incognito-blocker';
        blocker.style.cssText = `
            position: fixed !important;
            inset: 0 !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: ${cfg.overlayBg} !important;
            z-index: 2147483647 !important;
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
            box-sizing: border-box !important;
            text-align: center !important;
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
            box-sizing: border-box !important;
        `;
        button.onclick = () => {
            document.body.style.overflow = '';
            if (document.documentElement) {
                document.documentElement.style.overflow = '';
            }
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

    /**
      * 🧬 UTILITY PROFILO: 
      * Recupero dettagliato dei 
      * Client Hints del browser
     */
    async _getFullBrowserProfile() {
        let profile = { userAgent: navigator.userAgent, isHighEntropyDataAvailable: false, details: {} };
        if (navigator.userAgentData) {
            try {
                profile.details = await navigator.userAgentData.getHighEntropyValues([
                    "architecture", "model", "platform", "platformVersion", "fullVersionList", "bitness"
                ]);
                profile.isHighEntropyDataAvailable = true;
                profile.brands = navigator.userAgentData.brands;
                profile.mobile = navigator.userAgentData.mobile;
            } catch (error) {
                this.onLogMessage('error', `Errore nel recupero dei Client Hints: ${error.message}`);
            }
        }
        return profile;
    }

    /**
     * 📱 UTILITY OS: 
     * Riconoscimento rapido 
     * della piattaforma mobile o desktop.
     */
    _getMobileOS() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'iOS';
        if (/android/i.test(ua)) return 'Android';
        return 'Desktop';
    }
}
