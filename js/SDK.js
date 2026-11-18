/**
 * ⚙️🪖🛡️ PanzerSDK - v2.3.7.0
 * 
 * * 👤 Autore: Valentino Aglianó
 * Perito Informatico / Idoneo ASMEL 2025
 * 
 * * 📜 License: EUPL-1.2
 */

/**
 * 🧱 @typedef {Object} BlockerConfig
 * @property {string} [Icons] - 🎨 Icona emoji del modale
 * @property {string} [blockerID] - 🆔 Identificativo DOM del blocker
 * @property {string} [title] - 🏷️ Titolo descrittivo dell'avviso
 * @property {string} [message] - 📄 Messaggio informativo dettagliato
 * @property {string} [buttonText] - 🔘 Testo del pulsante di azione
 * @property {Function} [buttonAction] - ⚡ Callback associata al click del pulsante
 * @property {string} [overlayBg] - 🌑 Colore di sfondo dell'overlay
 * @property {string} [cardBg] - 📦 Colore di sfondo della card modale
 * @property {string} [borderColor] - 🔲 Colore del bordo della card
 * @property {string} [titleColor] - 🎨 Colore del testo del titolo
 * @property {string} [textColor] - ✍️ Colore del testo descrittivo
 * @property {string} [buttonBg] - 🎨 Colore di sfondo del pulsante
 * @property {string} [buttonTextCol] - 🔤 Colore del testo del pulsante
 */

/**
 * ⚙️ @typedef {Object} PanzerSDKOptions
 * @property {string} [swPath] - 🪖 Percorso del Service Worker
 * @property {string} [scope] - 🌐 Scope di registrazione PWA
 * @property {string} [cacheNamePrefix] - 📌 Prefisso parametrico della stiva
 * @property {string[]} [coreAssets] - 📦 Asset critici di base
 * @property {number} [checkTimeout] - ⏱️ Timeout per i controlli ambientali
 * @property {boolean} [autoInit=true] - ⚡ Avvio automatico al❜istanziazione
 * @property {BlockerConfig} [incognitoBlocker] - 🕵️ Configurazione avviso incognito
 * @property {BlockerConfig} [cacheWipeBlocker] - 🚨 Configurazione avviso wipe cache
 * @property {BlockerConfig} [purgeSuccessBlocker] - ✅ Configurazione avviso purga volontaria
 * @property {Function} [onProgress] - 📊 Callback di progresso sincronizzazione
 * @property {Function} [onComplete] - 🎉 Callback di completamento sincronizzazione
 * @property {Function} [onError] - ❌ Callback di gestione errori
 * @property {Function} [onSyncStart] - 🚀 Callback avvio sincronizzazione
 * @property {Function} [onSyncRetry] - 🔄 Callback tentativi di risincronizzazione
 * @property {Function} [onPurgeComplete] - 🗑️ Callback completamento purga
 * @property {Function} [onLogMessage] - 🪵 Callback di telemetria e log
 * @property {Function} [onOnline] - 🌐 Callback ripristino rete
 * @property {Function} [onOffline] - 📴 Callback assenza rete
 * @property {Function} [onPromptPin] - 🔏 Callback richiesta PIN per sblocco o setup
 */
 
/**
 * 🪖 PANZER SDK - SECURE VAULT & SESSION MANAGER (v1.1.0)
 * Gestisce la sicurezza di livello government-grade della stiva:
 * - Timer di inattività (10 minuti) con auto-lock della RAM.
 * - Key Wrapping tramite IPC e bonifica attiva della memoria.
 * - Bridge di comunicazione asincrono con il Service Worker.
 */
export class PanzerVaultManager {
    /**
     * 🏗️ Inizializza il gestore della sessione e dei timer di sicurezza del Vault.
     * @param {Function} [onLockCallback] - 🔒 Callback eseguita quando il caveau viene bloccato (es. svuotamento RAM/sandbox).
     * @param {Function} [onPromptPinCallback] - 🔏 Callback eseguita per richiedere l'apertura del modale PIN (es. scadenza inattività).
     */
    constructor(onLockCallback, onPromptPinCallback) {
        /** @private @type {number|null} */
        this.inactivityTimer = null;
        
        /** @private @type {number} Limite di inattività fissato a 10 minuti (600.000 ms) */
        this.INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
        
        /** @private @type {Function|undefined} */
        this.onLockCallback = onLockCallback;
        
        /** @private @type {Function|undefined} */
        this.onPromptPinCallback = onPromptPinCallback;
        
        /** @private @type {boolean} Flag di sicurezza per mettere in pausa il watchdog durante il cambio PIN */
        this._isChangingPin = false;
        
        this._initListeners();
    }

    /**
     * ⚙️ Inizializza i listener globali per il rilevamento dell'attività utente e del Service Worker.
     * @private
     */
    _initListeners() {
        ['mousemove', 'keydown', 'touchstart', 'click', 'scroll'].forEach(evt => {
            window.addEventListener(evt, () => this.resetInactivityTimer(), { passive: true });
        });
        this.resetInactivityTimer();

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (!event.data) return;
                const data = event.data;
                if (data.type === 'VAULT_LOCKED') {
                    if (this.onLockCallback) this.onLockCallback();
                }
            });
        }
    }

    /**
     * ⏱️ Azzera e riavvia il timer di inattività di 10 minuti.
     */
    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            this.lockSession();
            if (this.onPromptPinCallback) {
                this.onPromptPinCallback('unlock', '🔒 Sessione scaduta per inattività (10 min). Inserisci il PIN:');
            }
        }, this.INACTIVITY_LIMIT_MS);
    }

    /**
     * 🔒 Invia il comando di blocco al Service Worker per rimuovere la Master Key dalla RAM.
     */
    lockSession() {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'LOCK_VAULT' });
        }
    }

    /**
     * 🔎 Verifica lo stato di configurazione e sblocco del caveau presso il Service Worker.
     * Attende attivamente che il controller sia attivo (fondamentale al 1° avvio).
     * @param {Function} callback - 📞 Callback di risposta che riceve lo stato ({ configured: boolean, unlocked: boolean }).
     */
    async checkStatus(callback) {
        if (!('serviceWorker' in navigator)) return;

        await navigator.serviceWorker.ready;

        if (!navigator.serviceWorker.controller) {
            await new Promise((resolve) => {
                const onCtrlChange = () => {
                    navigator.serviceWorker.removeEventListener('controllerchange', onCtrlChange);
                    resolve();
                };
                navigator.serviceWorker.addEventListener('controllerchange', onCtrlChange);
                setTimeout(resolve, 1500); // Fallback di sicurezza
            });
        }

        if (!navigator.serviceWorker.controller) {
            callback({ configured: false, unlocked: false });
            return;
        }

        let resolved = false;
        const timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                navigator.serviceWorker.removeEventListener('message', listener);
                callback({ configured: false, unlocked: false });
            }
        }, 2000);

        const listener = (e) => {
            if (e.data && e.data.type === 'VAULT_STATUS_RESULT') {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeoutId);
                    navigator.serviceWorker.removeEventListener('message', listener);
                    callback(e.data);
                }
            }
        };

        navigator.serviceWorker.addEventListener('message', listener);
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_VAULT_STATUS' });
    }

    /**
     * 🔏 Invia il PIN inserito dall'utente convertendolo in buffer binario protetto (zero-copy transfer).
     * Attende attivamente che il controller sia pronto prima di inviare il postMessage.
     * @param {string} pinString - 🔑 Stringa in chiaro del PIN digitato dall'operatore.
     * @param {string} [mode='setup'] - ⚙️ Modalità operativa ('setup' o 'unlock').
     * @param {Function} callback - 📞 Callback di risposta con il risultato dell'operazione.
     */
    async submitPin(pinString, mode = 'setup', callback) {
        const enc = new TextEncoder();
        const pinBuffer = enc.encode(pinString).buffer;

        if (!('serviceWorker' in navigator)) {
            callback({ success: false, error: 'Service Worker non supportato dal browser.' });
            return;
        }

        await navigator.serviceWorker.ready;

        if (!navigator.serviceWorker.controller) {
            callback({ success: false, error: 'Controller Service Worker non ancora attivo. Ricarica la pagina.' });
            return;
        }

        let resolved = false;
        const timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                navigator.serviceWorker.removeEventListener('message', listener);
                callback({ success: false, error: 'Timeout risposta dal Service-Worker.' });
            }
        }, 10000);

        const listener = (e) => {
            if (e.data && e.data.type === 'PIN_RESULT') {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeoutId);
                    navigator.serviceWorker.removeEventListener('message', listener);
                    if (e.data.success) this.resetInactivityTimer();
                    callback(e.data);
                }
            }
        };

        navigator.serviceWorker.addEventListener('message', listener);
        navigator.serviceWorker.controller.postMessage(
            { type: 'SUBMIT_PIN', pinBuffer, mode },
            [pinBuffer]
        );
    }
    
    /**
     * 🔑🔄 Esegue il cambio del PIN cifrato preservando la Master Key (zero impatto sulla stiva).
     * @param {string} oldPinStr - 🔑 Vecchio PIN in chiaro.
     * @param {string} newPinStr - 🔑 Nuovo PIN desiderato.
     * @param {Function} callback - 📞 Callback di risposta con l'esito del cambio.
     */
    changePin(oldPinStr, newPinStr, callback) {
        this._isChangingPin = true;
        
        const enc = new TextEncoder();
        const oldBuffer = enc.encode(oldPinStr).buffer;
        const newBuffer = enc.encode(newPinStr).buffer;
        
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            let resolved = false;
            const timeoutId = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    this._isChangingPin = false;
                    navigator.serviceWorker.removeEventListener('message', listener);
                    callback({ success: false, error: 'Timeout risposta cambio PIN dal Service-Worker.' });
                }
            }, 10000);
            
            const listener = (e) => {
                if (e.data && e.data.type === 'CHANGE_PIN_RESULT') {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeoutId);
                        this._isChangingPin = false;
                        navigator.serviceWorker.removeEventListener('message', listener);
                        callback(e.data);
                    }
                }
            };
            navigator.serviceWorker.addEventListener('message', listener);

            navigator.serviceWorker.controller.postMessage({ 
                type: 'CHANGE_PIN', 
                oldPinBuffer: oldBuffer, 
                newPinBuffer: newBuffer 
            });
        } else {
            this._isChangingPin = false;
            callback({ success: false, error: 'Service Worker controller non attivo.' });
        }
    }

    /**
     * 🛑 Rilascia tutte le risorse e i timer attivi del Vault Manager.
     */
    destroy() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    }
}
Object.freeze(PanzerVaultManager);

export class PanzerSDK {
    /**
     * 🏗️ Inizializza un'istanza del motore PanzerSDK.
     * @param {PanzerSDKOptions} [options={}] - ⚙️ Opzioni di configurazione del SDK.
     */
    constructor(options = {}) {
        this._sessionSynced = false;
        this._isVaultArmed = localStorage.getItem('panzer_has_ever_synced') === 'true';
        this._isSyncing = false;
        this.lastUiUpdate = 0;
        this._watchdogInterval = null;

        // 🔗 Riferimenti vincolati (bound) per una corretta rimozione in destroy()
        this._boundOnline = null;
        this._boundOffline = null;
        this._boundMessage = null;
        this._boundBeforeInstallPrompt = null;

        this.swPath = options.swPath || './ServiceWorker.js';
        this.scope = options.scope || '/';
        this.cacheNamePrefix = options.cacheNamePrefix || 'PA_PANZER_ENGINE_v';

        this.coreAssets = Object.freeze(options.coreAssets || [
            './',
            './index.html',
            './Res-PA-manifest.json',
            './PA_PWA.webmanifest',
            './ServiceWorker.js',
            './js/SDK.js',
            './js/app.js'
        ]);

        this.checkTimeout = Math.max(options.checkTimeout || 7000, 7000);
        this.autoInit = options.autoInit !== undefined ? options.autoInit : true;

        // 🛑 Configurazione blocker Anti-Incognito sigillata
        this.incognitoBlocker = Object.freeze(this._buildBlockerConfig(options.incognitoBlocker, {
            Icons: '🕵️⚠️',
            ID: 'panzer-incognito-blocker',
            title: "Modalità Incognito Rilevata",
            message: "Il motore di sicurezza e la stiva resiliente <strong>PANZER SDK</strong> non possono operare in ambienti di navigazione in incognito o sandbox restrittive su Chromium a causa delle limitazioni di persistenza dei dati.<br><br>Per utilizzare correttamente l'applicazione e garantire la continuità operativa, <strong>apri questa pagina in una finestra di navigazione normale</strong>.",
            buttonText: "Ho capito, ricarica...",
            buttonAction: () => window.location.reload(),
            overlayBg: "rgba(15, 23, 42, 0.95)",
            cardBg: "#1e293b",
            borderColor: "#334155",
            titleColor: "#f87171",
            textColor: "#94a3b8",
            buttonBg: "#3b82f6",
            buttonTextCol: "#ffffff"
        }));

        // 🛑 Config blocker Watchdog Cache Wipe sigillata
        this.cacheWipeBlocker = Object.freeze(this._buildBlockerConfig(options.cacheWipeBlocker, {
            Icons: '🚨🗄️',
            ID: 'panzer-cache-wipe-blocker',
            title: "Stiva Locale Cancellata o Compromessa",
            message: "Il watchdog di sicurezza <strong>PANZER SDK</strong> ha rilevato che la cache protetta o la stiva è stata eliminata o svuotata inaspettatamente.<br><br>Per ripristinare l'integrità dei dati della Pubblica Amministrazione, <strong>è necessario ricaricare e risincronizzare la stiva</strong>.",
            buttonText: "🔄 Ripristina e Ricarica Stiva",
            buttonAction: () => {
                sessionStorage.removeItem('panzer_active_session');
                localStorage.removeItem('panzer_has_ever_synced');
                this._isVaultArmed = false;
                window.location.reload();
            },
            overlayBg: "rgba(15, 23, 42, 0.98)",
            cardBg: "#1e293b",
            borderColor: "#334155",
            titleColor: "#f87171",
            textColor: "#94a3b8",
            buttonBg: "#2563eb",
            buttonTextCol: "#ffffff"
        }));
        
        // 🛑 Config blocker Purga Volontaria sigillata
        this.purgeSuccessBlocker = Object.freeze(this._buildBlockerConfig(options.purgeSuccessBlocker, {
            Icons: '✅🗑️',
            ID: 'panzer-purge-success-blocker',
            title: "Purga Volontaria Completata",
            message: "Hai eseguito con successo la pulizia volontaria della stiva e della cache protetta.<br><br>Il sistema è pronto per un nuovo avvio. <strong>Ricarica la pagina</strong> per rigenerare il Service Worker e ripartire da zero.",
            buttonText: "🔄 Ricarica e Riavvia Stiva",
            buttonAction: () => {
                this._isVaultArmed = false;
                window.location.reload();
            },
            overlayBg: "rgba(15, 23, 42, 0.98)",
            cardBg: "#1e293b",
            borderColor: "#334155",
            titleColor: "#38bdf8",
            textColor: "#cbd5e1",
            buttonBg: "#2563eb",
            buttonTextCol: "#ffffff"
        }));

        // ⚙️ Hook di callback UI e Telemetria
        this.onPromptPin = options.onPromptPin || (() => {});
        this.onProgress = options.onProgress || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onError = options.onError || (() => {});
        this.onSyncStart = options.onSyncStart || (() => {});
        this.onSyncRetry = options.onSyncRetry || (() => {});
        this.onPurgeComplete = options.onPurgeComplete || (() => {});
        this.onLogMessage = options.onLogMessage || (() => {});
        this.onOnline = options.onOnline || (() => {});
        this.onOffline = options.onOffline || (() => {});

        if (this.autoInit) {
            this.init();
        }
    }

    /**
     * 🚀 Inizializza i listener di rete, la registrazione del Service Worker, il bridge, il watchdog, il controllo ambiente PWA e il Vault Manager.
     */
    init() {
        this._registerSW();
        this._detectActiveCacheVersion().then(detected => {
            if (detected) this.cacheNamePrefix = detected;
        });
        this._setupMessageBridge();
        this._setupNetworkListeners();
        this.initPwaEnvironmentCheck(this.checkTimeout);
        this._initCacheWatchdog();

        // 🛡️ Inizializzazione automatica del Vault & Session Manager all'interno del SDK
        this.vaultManager = new PanzerVaultManager(
            () => {
                this.onLogMessage('warn', '🛡️ SDK: Sessione terminata e RAM bonificata.');
            },
            (mode, msg) => {
                if (typeof this.onPromptPin === 'function') {
                    this.onPromptPin(mode, msg);
                }
            }
        );
    }

    /**
     * 🛑 Rilascia tutte le risorse attive (timer, event listener, blocker UI, vault manager).
     */
    destroy() {
        if (this._watchdogInterval) {
            clearInterval(this._watchdogInterval);
            this._watchdogInterval = null;
        }

        if (this.vaultManager && typeof this.vaultManager.destroy === 'function') {
            this.vaultManager.destroy();
            this.vaultManager = null;
        }

        if (this._boundOnline) {
            window.removeEventListener('online', this._boundOnline);
            this._boundOnline = null;
        }
        if (this._boundOffline) {
            window.removeEventListener('offline', this._boundOffline);
            this._boundOffline = null;
        }

        if ('serviceWorker' in navigator && this._boundMessage) {
            navigator.serviceWorker.removeEventListener('message', this._boundMessage);
            this._boundMessage = null;
        }

        if (this._boundBeforeInstallPrompt) {
            window.removeEventListener('beforeinstallprompt', this._boundBeforeInstallPrompt);
            this._boundBeforeInstallPrompt = null;
        }

        [this.incognitoBlocker.ID, this.cacheWipeBlocker.ID, this.purgeSuccessBlocker.ID].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        document.body.style.overflow = '';
        if (document.documentElement) document.documentElement.style.overflow = '';

        this.onLogMessage('info', '🛑 SDK: Istanza distrutta e risorse rilasciate correttamente.');
    }

    /**
     * 🧱 Unifica le configurazioni personalizzate con quelle predefinite per i blocker (DRY) e le sigilla.
     * @private
     * @param {BlockerConfig} [userCfg={}] - 👤 Config utente
     * @param {BlockerConfig} defaultCfg - ⚙️ Config di default
     * @returns {Readonly<BlockerConfig>} - 📦 Configurazione unificata e immutabile
     */
    _buildBlockerConfig(userCfg = {}, defaultCfg) {
        return Object.freeze({
            Icons: userCfg.Icons || defaultCfg.Icons,
            ID: userCfg.blockerID || defaultCfg.ID,
            title: userCfg.title || defaultCfg.title,
            message: userCfg.message || defaultCfg.message,
            buttonText: userCfg.buttonText || defaultCfg.buttonText,
            buttonAction: userCfg.buttonAction || defaultCfg.buttonAction,
            overlayBg: userCfg.overlayBg || defaultCfg.overlayBg,
            cardBg: userCfg.cardBg || defaultCfg.cardBg,
            borderColor: userCfg.borderColor || defaultCfg.borderColor,
            titleColor: userCfg.titleColor || defaultCfg.titleColor,
            textColor: userCfg.textColor || defaultCfg.textColor,
            buttonBg: userCfg.buttonBg || defaultCfg.buttonBg,
            buttonTextCol: userCfg.buttonTextCol || defaultCfg.buttonTextCol
        });
    }

    /** v2.0
     * 🖼️ Motore grafico centralizzato per il rendering dei modal blocker (DOM Nativo / Zero Injections).
     * @private
     * @param {BlockerConfig} cfg - ⚙️ Configurazione del blocker da renderizzare
     */
    _renderModalBlocker(cfg) {
        const targetId = cfg.blockerID || cfg.ID;
        if (!targetId || document.getElementById(targetId)) return;

        document.body.style.overflow = 'hidden';
        if (document.documentElement) document.documentElement.style.overflow = 'hidden';

        const blocker = document.createElement('div');
        blocker.id = targetId;
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

        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = 'font-size: 42px; margin-bottom: 12px;';
        iconDiv.textContent = cfg.Icons || '';
        card.appendChild(iconDiv);

        const titleEl = document.createElement('h2');
        titleEl.style.cssText = `color: ${cfg.titleColor}; margin-bottom: 12px; font-size: 20px;`;
        titleEl.textContent = cfg.title || '';
        card.appendChild(titleEl);

        const msgEl = document.createElement('p');
        msgEl.style.cssText = `color: ${cfg.textColor}; font-size: 14px; line-height: 1.5; margin-bottom: 20px;`;
        msgEl.innerHTML = cfg.message || '';
        card.appendChild(msgEl);

        const button = document.createElement('button');
        button.textContent = cfg.buttonText || 'OK';
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
    
    /**
     * 🔎 Verifica se il browser corrente utilizza il motore Chromium/Blink.
     * @private
     * @returns {boolean} - 🟢 True se è Chromium, altrimenti false
     */
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

    /**
     * 🌐 Configura i listener di rete online/offline.
     * @private
     */
    _setupNetworkListeners() {
        this._boundOnline = () => {
            this.onOnline();
        };

        this._boundOffline = () => {
            this.onOffline();
        };

        window.addEventListener('online', this._boundOnline);
        window.addEventListener('offline', this._boundOffline);

        if (!navigator.onLine) {
            this.onOffline();
        }
    }

    /** v4.2
     * 🐺 Watchdog Wipe Cache.
     * @private
     */
    _initCacheWatchdog() {
        this._watchdogFailures = 0;

        const runWatchdogCheck = async (isImmediate = false) => {
            // 🛑 SCENARIO 1: Se siamo in fase di sync critica o cambio PIN, salta temporaneamente
            if (!('caches' in window) || this._isSyncing || this._isChangingPin) return;

            try {
                // 🛑 SCENARIO 2: Verifica se il caveau è stato configurato. Se è il primo avvio assoluto o non c'è un PIN, il Watchdog non deve disturbare
                const db = await new Promise((res) => {
                    const req = indexedDB.open("PWA_Vault", 1);
                    req.onsuccess = () => res(req.result);
                    req.onerror = () => res(null);
                });

                if (!db) return;
                
                let hasVault = false;
                await new Promise((res) => {
                    try {
                        const tx = db.transaction("keys", "readonly");
                        const store = tx.objectStore("keys");
                        const req = store.get("wrapped_master_key");
                        req.onsuccess = () => { hasVault = !!req.result; res(); };
                        req.onerror = () => res();
                    } catch (_) { res(); }
                    finally { try { db.close(); } catch(_){} }
                });

                // Se non c'è ancora un caveau salvato (utente in fase di setup iniziale), il Watchdog si astiene
                if (!hasVault) {
                    return;
                }

                // 🔍 Controllo integrità stiva Cache
                const keys = await caches.keys();
                let targetCacheName = keys.find(k => k.startsWith(this.cacheNamePrefix));
                if (!targetCacheName) {
                    targetCacheName = keys.find(k => k.startsWith('PA_PANZER_ENGINE_v'));
                }

                if (!targetCacheName) {
                    throw new Error("Stiva Cache rimossa dal browser.");
                }

                const cache = await caches.open(targetCacheName);
                const cacheKeys = await cache.keys();

                if (cacheKeys.length === 0) {
                    throw new Error("Stiva_vuota.");
                }

                // Tutto ok, azzeriamo i contatori di fallimento
                this._watchdogFailures = 0;

            } catch (e) {
                // Ignoriamo errori se l'app è in stato di transizione
                if (this._isSyncing || this._isChangingPin) return;

                this._watchdogFailures++;
                this.onLogMessage('warn', `⚠️🐺 SDK: Anomalia Cache ⚠️🗄️ Retry (${this._watchdogFailures}/3) -> [${e.message}]`);

                if (isImmediate || this._watchdogFailures >= 3) {
                    this.onLogMessage('error', `🚨🐺 SDK: Cancellazione stiva confermata -> [${e.message}]`);
                    
                    sessionStorage.removeItem('panzer_active_session');
                    this._sessionSynced = false;
                    this._isSyncing = false;
                    this._watchdogFailures = 0;
                    
                    this._showCacheWipeBlocker();
                }
            }
        };

        // Avvio intervallo a 5 secondi
        this._watchdogInterval = setInterval(() => runWatchdogCheck(false), 5000);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.onLogMessage('info', '👁️ SDK: PWA attiva. Verifica stiva...');
                runWatchdogCheck(true);
            }
        });
    }

    /**
     * 🚨 Mostra il blocker in caso di azzeramento anomalo della cache.
     * @private
     */
    _showCacheWipeBlocker() {
        this._renderModalBlocker(this.cacheWipeBlocker);
    }
    
    /**
     * ✅ Mostra il blocker di successo in seguito a purga volontaria.
     * @private
     */
    _showPurgeSuccessBlocker() {
        this._renderModalBlocker(this.purgeSuccessBlocker);
    }

    /**
     * 🔍 Rileva la versione attiva della cache nel browser.
     * @param {string} namecache - 🏷️ Nome base della cache
     * @param {string} fallbackVersion - 📦 Versione di fallback
     * @returns {Promise<string>} - 🏷️ Nome completo della cache attiva
     */
    async _detectActiveCacheVersion(namecache = this.cacheNamePrefix, fallbackVersion = '') {
        if (!('caches' in window)) return (namecache + fallbackVersion);
        try {
            const keys = await caches.keys();
            const targetKey = keys.find(k => k.startsWith(namecache));
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
     * 🪖 Registra il Service Worker.
     * @private
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
     * 📨 Configura il bridge di messaggistica IPC con il Service Worker.
     * @private
     */
    _setupMessageBridge() {
        if (!('serviceWorker' in navigator)) return;

        this._boundMessage = (event) => {
            const data = event.data;
            if (!data || typeof data !== 'object') return;

            switch (data.type) {
                case 'SYNC_START':
                    this._isSyncing = true;
                    if (this._syncTimeoutTimer) clearTimeout(this._syncTimeoutTimer);
                    this._syncTimeoutTimer = setTimeout(() => {
                        this._isSyncing = false;
                        this.onLogMessage('warn', '⚠️ SDK: Timeout di sicurezza sincronizzazione scaduto. Watchdog Wipecache riattivato.');
                    }, 180000);
                    
                    this.onSyncStart({ total: data.total || 0 });
                    this.onLogMessage('sync', '🚀 SW: Sincronizzazione e cifratura Bunker avviate...');
                    break;

                case 'SYNC_PROGRESS':
                    if (this._syncTimeoutTimer) {
                        clearTimeout(this._syncTimeoutTimer);
                        this._syncTimeoutTimer = setTimeout(() => {
                            this._isSyncing = false;
                            this.onLogMessage('warn', '⚠️ SDK: Timeout di sicurezza sincronizzazione scaduto. Watchdog Wipecache riattivato.');
                        }, 180000);
                    }

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
                    if (this._syncTimeoutTimer) clearTimeout(this._syncTimeoutTimer);
                    this._sessionSynced = true;
                    this._isVaultArmed = true;
                    sessionStorage.setItem('panzer_active_session', 'true');
                    localStorage.setItem('panzer_has_ever_synced', 'true');
                    this._isSyncing = false;
                    this.onLogMessage('success', '✅🗄️ Sincronizzazione e cifratura Bunker completate dal 🪖 Service-Worker !');
                    this.onComplete(data.details || {});
                    this.lastUiUpdate = 0;
                    break;

                case 'SYNC_RETRY':
                    if (this._syncTimeoutTimer) clearTimeout(this._syncTimeoutTimer);
                    this._isSyncing = false;
                    this.onSyncRetry(data);
                    this.onLogMessage('warn', '⚠️🌐 SW: Rete assente o instabile. In attesa di riconnessione... 🔄');
                    this.lastUiUpdate = 0;
                    break;

                    case 'CORE_UPDATE_RELOAD':
                        this.onLogMessage('warn', '🔄 SW: Aggiornamento critico ⚙️CORE rilevato. Ricaricamento in corso... 🔄');
                        if (data.msg === 'DESTROY_ALL_CACHE') {
                            // 🧹 Pulizia totale dei flag locali di sessione e installazione
                            sessionStorage.removeItem('panzer_active_session');
                            localStorage.removeItem('panzer_has_ever_synced');
                            localStorage.removeItem('panzer_vault_synced');
                            this._isVaultArmed = false;
                            this.onError(new Error("Vault compromesso - Tabula rasa eseguita"));
                        }
                        setTimeout(function() {
                            window.location.reload();
                        }, 5000);
                        break;

                default:
                    break;
            }
        };

        navigator.serviceWorker.addEventListener('message', this._boundMessage);
    }

    /**
     * 🚀 Inizializza il database e invia i dati al Service Worker via postMessage.
     * @param {string} version - 🏷️ Versione del DB
     * @param {Object} manifestData - 📋 Dati del manifest
     * @param {string[]|null} [overrideCoreAssets=null] - 📦 Asset core sovrascritti
     */
    async initDB(version, manifestData, overrideCoreAssets = null) {
        this.onLogMessage('sync', `🚀 SDK: Invio comando INIT_DB al 🪖 Service-Worker ( Versione: ${version} )...`);
        if (overrideCoreAssets && Array.isArray(overrideCoreAssets)) {
            this.coreAssets = Object.freeze(overrideCoreAssets);
        }

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

            const safePayload = Object.freeze({
                type: 'INIT_DB',
                version: String(version),
                data: manifestData,
                overrideCoreAssets: this.coreAssets
            });

            navigator.serviceWorker.controller.postMessage(safePayload);

        } catch (err) {
            this.onLogMessage('error', `❌ 📨 Errore di comunicazione IPC con il 🪖 Service-Worker: ${err.message}`);
            this.onError(err);
        }
    }

    /**
     * 🗑️ Esegue la purga volontaria della stiva.
     */
        async purgeVault() {
        if (!('caches' in window)) return;
        try {
            this.onLogMessage('warn', '🚨🗑️ SDK: Avvio purga volontaria e pulizia Cache & Caveau... 🗄️');
            
            this._sessionSynced = false;
            this._isVaultArmed = false;
            sessionStorage.removeItem('panzer_active_session');
            localStorage.removeItem('panzer_has_ever_synced');
            localStorage.removeItem('panzer_vault_synced');
            
            // 🧹 Elimina tutte le cache
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));

            // 🧹 Elimina IndexedDB della stiva
            await new Promise((res) => {
                const req = indexedDB.deleteDatabase("PWA_Vault");
                req.onsuccess = () => res();
                req.onerror = () => res();
            });

            // 🧹 Avvisa il Service Worker di azzerare la Master Key in RAM (sfrutta il comando esistente)
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'LOCK_VAULT' });
            }
        } catch (err) {
            this.onLogMessage('error', `❌🗑️ SDK: Errore durante la purga: ${err.message}`);
            return;
        }
        this.onLogMessage('success', '✅🗑️ SDK: Purga volontaria completata con successo.');
            
        this._showPurgeSuccessBlocker();
        this.onPurgeComplete();
    }

    /**
     * 🕵️ Esegue il controllo ambientale per rilevare eventuali restrizioni o modalità incognito su Chromium.
     * @param {number} timeoutMs - ⏱️ Timeout espresso in millisecondi
     */
    async initPwaEnvironmentCheck(timeoutMs) {
        if (!('serviceWorker' in navigator)) return;

        if (!this._isChromiumEngine()) {
            this.onLogMessage('info', "🛡️ SDK: ⚙️🌐 Motore non-Chromium rilevato ( 🕵️ controllo Incognito bypassato ). ✅");
            return;
        }

        const pwaEventRace = new Promise((resolve) => {
            const timer = setTimeout(() => {
                if (this._boundBeforeInstallPrompt) {
                    window.removeEventListener('beforeinstallprompt', this._boundBeforeInstallPrompt);
                }
                resolve(false);
            }, timeoutMs);

            this._boundBeforeInstallPrompt = (e) => {
                clearTimeout(timer);
                window.removeEventListener('beforeinstallprompt', this._boundBeforeInstallPrompt);
                e.preventDefault();
                window.deferredPrompt = e;
                resolve(true);
            };
            window.addEventListener('beforeinstallprompt', this._boundBeforeInstallPrompt);
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

    /**
     * 🕵️⚠️ Mostra il blocker in caso di rilevamento della modalità incognito.
     * @private
     */
    _showIncognitoBlocker() {
        this._renderModalBlocker(this.incognitoBlocker);
    }
}