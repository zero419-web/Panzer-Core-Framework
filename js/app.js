/**
 * ⚙️⚡ App Controller 
 * Dashboard PA & Gestione UI
 * v2.4.3.3
 *
 * * 👤 Autore: Valentino Aglianó
 * Perito Informatico / Idoneo ASMEL 2025
 *
 * * 📜 License: EUPL-1.2
 */
import { PanzerSDK } from './SDK.js';

document.addEventListener('DOMContentLoaded', async () => {
    'use strict';
    
    // 🛡️ Controllo Chiusura scheda / nuova sessione...
    if (!sessionStorage.getItem('panzer_tab_active')) {
        sessionStorage.setItem('panzer_tab_active', 'true');
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'LOCK_VAULT' });
        }
    }
    window.addEventListener('beforeunload', () => {
        sessionStorage.removeItem('panzer_tab_active');
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'LOCK_VAULT' });
        }
    });
    
    
    // 🌍 Calcolo automatico della base URL e dello scope in base a dove è installata la PWA
    const currentPath = window.location.pathname;
    const baseDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    
    // 🎯 Percorsi per lo scope e il Service-Worker
    const getDefined_scope = baseDir;
    const getDefined_swPath = './ServiceWorker.js';

        // ⚙️📄 Core Assets allineati con percorsi relativi sicuri per il Service Worker
    const getDefinedCoreAssets = () => Object.freeze([
        './',
        './index.html',
        './js/sandbox_viewer.js',
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
    let activeViewerBlobUrl = null;
    let currentZoom = 1.0;
    let totalCombinedCount = 0;
    
    let activeMimeType = null;
    let activePageObjectUrls = [];
    let activeFallbackObjectUrl = null;
    let activePageBlobs = [];
    let activeSandboxNonce = null;
    
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
    
    // 🔏 Modale Grafico Unificato per Gestione PIN (Setup, Sblocco, Cambio, Associa PRF)
    const showPinModal = (mode = 'unlock', messageText = 'Inserisci il PIN di sblocco:') => {
        let pinModal = document.getElementById('PA-pin-manager-modal');
        if (!pinModal) {
            pinModal = document.createElement('div');
            pinModal.id = 'PA-pin-manager-modal';
            pinModal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(15, 23, 42, 0.98); z-index: 2147483647;
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                font-family: system-ui, sans-serif; color: #f8fafc; padding: 20px; box-sizing: border-box;
            `;
            document.body.appendChild(pinModal);
        }

        let innerFields = '';
        let buttonText = 'Sblocca Caveau';

        if (mode === 'setup') {
            innerFields = `
                <input type="password" id="pa-pin-1" placeholder="Crea PIN (min 4 cifre)" maxlength="8" style="width: 100%; padding: 12px; box-sizing: border-box; background: #0f172a; border: 1px solid #64748b; color: #fff; font-size: 1.1rem; border-radius: 6px; text-align: center; letter-spacing: 4px; margin-bottom: 12px;">
                <input type="password" id="pa-pin-2" placeholder="Conferma PIN" maxlength="8" style="width: 100%; padding: 12px; box-sizing: border-box; background: #0f172a; border: 1px solid #64748b; color: #fff; font-size: 1.1rem; border-radius: 6px; text-align: center; letter-spacing: 4px; margin-bottom: 16px;">
            `;
            buttonText = 'Crea Caveau Cifrato';
        } else if (mode === 'change') {
            innerFields = `
                <input type="password" id="pa-pin-old" placeholder="Vecchio PIN" maxlength="8" style="width: 100%; padding: 12px; box-sizing: border-box; background: #0f172a; border: 1px solid #64748b; color: #fff; font-size: 1.1rem; border-radius: 6px; text-align: center; letter-spacing: 4px; margin-bottom: 12px;">
                <input type="password" id="pa-pin-1" placeholder="Nuovo PIN" maxlength="8" style="width: 100%; padding: 12px; box-sizing: border-box; background: #0f172a; border: 1px solid #64748b; color: #fff; font-size: 1.1rem; border-radius: 6px; text-align: center; letter-spacing: 4px; margin-bottom: 12px;">
                <input type="password" id="pa-pin-2" placeholder="Conferma Nuovo PIN" maxlength="8" style="width: 100%; padding: 12px; box-sizing: border-box; background: #0f172a; border: 1px solid #64748b; color: #fff; font-size: 1.1rem; border-radius: 6px; text-align: center; letter-spacing: 4px; margin-bottom: 16px;">
            `;
            buttonText = 'Aggiorna PIN';
        } else if (mode === 'register-prf') {
            innerFields = `
                <input type="password" id="pa-pin-1" placeholder="Inserisci PIN corrente" maxlength="8" style="width: 100%; padding: 12px; box-sizing: border-box; background: #0f172a; border: 1px solid #64748b; color: #fff; font-size: 1.1rem; border-radius: 6px; text-align: center; letter-spacing: 4px; margin-bottom: 12px;">
                <button type="button" id="pa-pin-cancel-btn" style="
                    width: 100%; padding: 10px; margin-bottom: 12px; background: #0f172a; color: #cbd5e1;
                    border: 1px solid #475569; border-radius: 6px; cursor: pointer; font-size: 0.9rem;
                ">Annulla</button>
            `;
            buttonText = '🧬 Associa Passkey / Biometria';
        } else {
            innerFields = `
                <input type="password" id="pa-pin-1" placeholder="Inserisci PIN" maxlength="8" style="width: 100%; padding: 12px; box-sizing: border-box; background: #0f172a; border: 1px solid #64748b; color: #fff; font-size: 1.1rem; border-radius: 6px; text-align: center; letter-spacing: 4px; margin-bottom: 12px;">
                <button type="button" id="pa-prf-unlock-btn" style="
                    display: none; width: 100%; padding: 10px; margin-bottom: 14px;
                    background: #0f172a; color: #38bdf8; border: 1px solid #38bdf8;
                    border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.95rem;
                ">🔐🧬 Entra con Passkey / Biometria</button>
            `;
            buttonText = 'Sblocca Caveau';
        }

        pinModal.innerHTML = `
            <div style="background: #1e293b; border: 1px solid #475569; padding: 30px; border-radius: 12px; max-width: 380px; width: 100%; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <div style="font-size: 36px; margin-bottom: 12px;">🔐🪖</div>
                <h3 style="margin-top: 0; color: #38bdf8; font-size: 1.2rem;">SICUREZZA BUNKER PA</h3>
                <p id="pa-pin-modal-msg" style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 20px;">${messageText}</p>
                ${innerFields}
                <button id="pa-pin-action-btn" style="
                    width: 100%; padding: 12px; background: #2563eb; color: #fff; border: none; border-radius: 6px;
                    font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s;
                ">${buttonText}</button>
            </div>
        `;
        pinModal.style.display = 'flex';

        const btn = document.getElementById('pa-pin-action-btn');
        const pin1Input = document.getElementById('pa-pin-1');
        if (pin1Input) pin1Input.focus();

        const cancelBtn = document.getElementById('pa-pin-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                pinModal.style.display = 'none';
            });
        }

        const prfBtn = document.getElementById('pa-prf-unlock-btn');
        if (mode === 'unlock' && prfBtn && sdk && sdk.vaultManager && typeof sdk.vaultManager.canUsePrf === 'function') {
            sdk.vaultManager.canUsePrf().then((supported) => {
                if (supported && pinModal.style.display !== 'none') {
                    prfBtn.style.display = 'block';
                }
            });

            prfBtn.addEventListener('click', async () => {
                if (!sdk || !sdk.vaultManager || typeof sdk.vaultManager.unlockVaultWithFallback !== 'function') return;
                prfBtn.disabled = true;
                const origText = prfBtn.textContent;
                prfBtn.textContent = '⏳ Verifica Passkey / Biometria...';

                try {
                    const unlocked = await sdk.vaultManager.unlockVaultWithFallback(() => {});
                    if (unlocked) {
                        pinModal.style.display = 'none';
                        logToTerminal('success', '🔓🧬 Caveau sbloccato tramite WebAuthn PRF.');
                    } else {
                        prfBtn.disabled = false;
                        prfBtn.textContent = origText;
                        const msgEl = document.getElementById('pa-pin-modal-msg');
                        if (msgEl) msgEl.textContent = '🔐 Passkey non disponibile o annullata: inserisci il PIN.';
                        logToTerminal('info', '🔐 Fallback al PIN: sblocco PRF non completato.');
                        if (pin1Input) pin1Input.focus();
                    }
                } catch (_) {
                    prfBtn.disabled = false;
                    prfBtn.textContent = origText;
                    logToTerminal('warn', '⚠️ Fallback al PIN durante sblocco PRF.');
                    if (pin1Input) pin1Input.focus();
                }
            });
        }

        const handleAction = () => {
            if (!sdk || !sdk.vaultManager) return;

            if (mode === 'setup' || mode === 'change') {
                const p1El = document.getElementById('pa-pin-1');
                const p2El = document.getElementById('pa-pin-2');
                const p1Val = p1El.value.trim();
                const p2Val = p2El.value.trim();

                if (p1Val.length < 4) { alert("⚠️🔢 Il PIN deve essere di almeno 4 cifre."); return; }
                if (p1Val !== p2Val) { alert("❌🔄 I PIN inseriti non coincidono. Riprova."); return; }

                p1El.value = '';
                p2El.value = '';

                if (mode === 'setup') {
                    sdk.vaultManager.submitPin(p1Val, 'setup', async (res) => {
                        if (res && res.success) {
                            logToTerminal('success', '🔓✅ Caveau creato e sbloccato correttamente.');

                            const canPrf = sdk.vaultManager && typeof sdk.vaultManager.canUsePrf === 'function'
                                ? await sdk.vaultManager.canUsePrf()
                                : false;

                            if (canPrf && typeof sdk.vaultManager.registerPrfCredential === 'function') {
                                pinModal.innerHTML = `
                                    <div style="background: #1e293b; border: 1px solid #475569; padding: 30px; border-radius: 12px; max-width: 380px; width: 100%; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                                        <div style="font-size: 36px; margin-bottom: 12px;">🧬🔐</div>
                                        <h3 style="margin-top: 0; color: #38bdf8; font-size: 1.2rem;">ACCESSO RAPIDO PASSKEY</h3>
                                        <p id="pa-prf-setup-msg" style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 20px;">
                                            PIN impostato. Vuoi associare ora una Passkey / Biometria per sbloccare il caveau senza PIN?
                                        </p>
                                        <button type="button" id="pa-prf-register-btn" style="
                                            width: 100%; padding: 12px; margin-bottom: 10px; background: #2563eb; color: #fff;
                                            border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem;
                                        ">🔐🧬 Associa Passkey / Biometria</button>
                                        <button type="button" id="pa-prf-skip-btn" style="
                                            width: 100%; padding: 10px; background: #0f172a; color: #cbd5e1;
                                            border: 1px solid #475569; border-radius: 6px; cursor: pointer; font-size: 0.9rem;
                                        ">Salta (usa solo PIN)</button>
                                    </div>
                                `;

                                const regBtn = document.getElementById('pa-prf-register-btn');
                                const skipBtn = document.getElementById('pa-prf-skip-btn');
                                const setupMsg = document.getElementById('pa-prf-setup-msg');

                                if (skipBtn) {
                                    skipBtn.addEventListener('click', () => {
                                        pinModal.style.display = 'none';
                                    });
                                }

                                if (regBtn) {
                                    regBtn.addEventListener('click', async () => {
                                        regBtn.disabled = true;
                                        if (skipBtn) skipBtn.disabled = true;
                                        const origRegText = regBtn.textContent;
                                        regBtn.textContent = '⏳ Registrazione Passkey in corso...';

                                        const regRes = await sdk.vaultManager.registerPrfCredential(p1Val);
                                        if (regRes && regRes.success) {
                                            logToTerminal('success', '🔐🧬 Passkey PRF associata al caveau.');
                                            pinModal.style.display = 'none';
                                        } else {
                                            regBtn.disabled = false;
                                            if (skipBtn) skipBtn.disabled = false;
                                            regBtn.textContent = origRegText;
                                            if (setupMsg) {
                                                setupMsg.textContent = `⚠️ ${regRes?.error || 'Associazione non completata.'} Puoi riprovare o usare solo il PIN.`;
                                            }
                                            logToTerminal('warn', `⚠️ Associazione PRF non completata: ${regRes?.error || 'annullata'}`);
                                        }
                                    });
                                }
                            } else {
                                pinModal.style.display = 'none';
                            }
                        } else {
                            if (res && (res.wiped || (res.attemptsLeft === 0) || (res.error && res.error.toLowerCase().includes("rimasti 0")))) {
                                alert("🚨💣 3 tentativi falliti! La stiva è stata distrutta per sicurezza.");
                                // 🧹 Pulizia totale dello storage client
                                localStorage.removeItem('panzer_has_ever_synced');
                                localStorage.removeItem('panzer_vault_synced');
                                sessionStorage.removeItem('panzer_active_session');
                                window.location.reload();
                            } else {
                                alert(`❌🔒 ${res?.error || "PIN errato. Riprova."}`);
                                if (pin1Input) pin1Input.focus();
                            }
                        }
                    });
                } else {
                    const oldEl = document.getElementById('pa-pin-old');
                    const oldVal = oldEl.value.trim();

                    // 🛑 CONTROLLO: Il nuovo PIN non può essere identico al vecchio
                    if (oldVal === p1Val) {
                        alert("⚠️ Il nuovo PIN non può essere identico al vecchio PIN. Scegline uno diverso.");
                        if (pin1Input) pin1Input.focus();
                        return;
                    }

                    oldEl.value = '';

                    sdk.vaultManager.changePin(oldVal, p1Val, (res) => {
                        if (res && res.success) {
                            pinModal.style.display = 'none';
                            logToTerminal('success', '🔑✅ PIN modificato con successo.');
                            alert("✅🔑 PIN aggiornato correttamente!");
                        } else {
                            const errMsg = res?.error || 'Vecchio PIN errato o errore interno.';
                            logToTerminal('error', `❌🔑 Errore cambio PIN: ${errMsg}`);
                            alert(`❌🔑 Errore cambio PIN: ${errMsg}`);
                        }
                    });
                }
            } else if (mode === 'register-prf') {
                const pinVal = pin1Input.value.trim();
                if (pinVal.length < 4) { alert("⚠️🔢 Inserisci un PIN valido (min 4 cifre)."); return; }
                pin1Input.value = '';

                btn.disabled = true;
                if (cancelBtn) cancelBtn.disabled = true;
                const origBtnText = btn.textContent;
                btn.textContent = '⏳ Registrazione Passkey...';

                sdk.vaultManager.registerPrfCredential(pinVal).then((res) => {
                    btn.disabled = false;
                    if (cancelBtn) cancelBtn.disabled = false;
                    btn.textContent = origBtnText;
                    if (res && res.success) {
                        pinModal.style.display = 'none';
                        logToTerminal('success', '🔐🧬 Passkey PRF associata correttamente al caveau.');
                    } else {
                        const errMsg = res?.error || 'Associazione annullata o non riuscita.';
                        logToTerminal('warn', `⚠️ Associazione Passkey PRF: ${errMsg}`);
                        alert(`⚠️ ${errMsg}`);
                        if (pin1Input) pin1Input.focus();
                    }
                });
            } else {
                const pinVal = pin1Input.value.trim();
                if (pinVal.length < 4) { alert("⚠️🔢 Inserisci un PIN valido (min 4 cifre)."); return; }
                pin1Input.value = '';

                sdk.vaultManager.submitPin(pinVal, 'unlock', (res) => {
                    if (res && res.success) {
                        pinModal.style.display = 'none';
                        logToTerminal('success', '🔓✅ Caveau sbloccato correttamente.');
                    } else {
                        if (res && res.wiped) {
                            alert("🚨💣 3 tentativi falliti! La stiva è stata distrutta per sicurezza.");
                            // 🧹 Pulisci i flag locali prima del reload
                            localStorage.removeItem('panzer_has_ever_synced');
                            localStorage.removeItem('panzer_vault_synced');
                            sessionStorage.removeItem('panzer_active_session');
                            window.location.reload();
                        } else {
                            alert(`❌🔒 ${res?.error || "PIN errato. Riprova."}`);
                            if (pin1Input) pin1Input.focus();
                        }
                    }
                });
            }
        };

        btn.addEventListener('click', handleAction);
        if (pin1Input) {
            pin1Input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleAction();
            });
        }
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

    // 🔭 Zoom Universale...
    const postToSandboxFrame = (payload) => {
        if (!sandboxFrame || !sandboxFrame.contentWindow || !activeSandboxNonce) return false;
        try {
            sandboxFrame.contentWindow.postMessage({
                ...payload,
                nonce: activeSandboxNonce
            }, '*');
            return true;
        } catch (_) {
            return false;
        }
    };

    const applyZoom = () => {
        if (!activeMimeType) return;
        const posted = postToSandboxFrame({
            type: 'PANZER_ZOOM_VIEWER',
            nonce: activeSandboxNonce,
            zoom: currentZoom
        });
        if (!posted) {
            renderAndMountSandbox();
        }
    };

    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', () => {
            if (currentZoom < 3.0) {
                currentZoom = Math.round((currentZoom + 0.25) * 100) / 100;
                applyZoom();
            }
        });
    }

    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', () => {
            if (currentZoom > 0.5) {
                currentZoom = Math.round((currentZoom - 0.25) * 100) / 100;
                applyZoom();
            }
        });
    }

    // 🖼️📄 Generatore del visore protetto.
    const renderAndMountSandbox = async () => {
        // 🔑 Generazione del nonce crittografico di sessione per autenticare il canale parent <-> iframe.
        activeSandboxNonce = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

        const safeNonceAttr = JSON.stringify(activeSandboxNonce).replace(/"/g, '&quot;');

        // 🛡️ Documento ospite minimale in srcdoc privo di script inline (conforme a CSP strict 'self' su script-src).
        const viewerHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin:0; padding:0; box-sizing:border-box; user-select:none; -webkit-user-select:none; }
body, html { width:100%; height:100%; background:#0f172a; overflow:auto; -webkit-overflow-scrolling:touch; font-family:system-ui,sans-serif; color:#e2e8f0; }
.img-stage { background:#000; width:100%; height:100%; overflow:auto; }
.img-container { display:inline-flex; min-width:100%; min-height:100%; justify-content:center; align-items:center; padding:12px; }
.img-container.zoomed { justify-content:flex-start; align-items:flex-start; }
.img-container img { width:100%; max-width:none; height:auto; object-fit:contain; pointer-events:none; -webkit-user-drag:none; display:block; transition:width 0.15s ease; }
#pdf-wrapper { display:flex; flex-direction:column; align-items:center; width:100%; min-width:100%; padding:8px; gap:6px; }
#pdf-wrapper.zoomed { align-items:flex-start; width:max-content; }
.pdf-page { width:100%; max-width:none; height:auto; background:#fff; pointer-events:none; -webkit-user-drag:none; display:block; transition:width 0.15s ease; }
.generic-stage { width:100%; height:100%; background:#111; display:flex; justify-content:center; align-items:center; overflow:auto; }
.generic-stage object { width:100%; height:100%; transition:width 0.15s ease, height 0.15s ease; }
</style>
</head>
<body oncontextmenu="return false;" ondragstart="return false;" onselectstart="return false;">
<div id="panzer-viewer-root"></div>
<script src="js/sandbox_viewer.js" data-panzer-nonce="${safeNonceAttr}"></script>
</body>
</html>`;

        // 🧹 Revoca preventiva di eventuali Object URL del visore residui prima del nuovo montaggio.
        if (activeViewerBlobUrl) {
            URL.revokeObjectURL(activeViewerBlobUrl);
            activeViewerBlobUrl = null;
        }

        const currentNonce = activeSandboxNonce;

        // 📡🤝 Attesa della segnalazione PANZER_VIEWER_READY dal contesto isolato (con fallback su load e timeout di sicurezza).
        await new Promise((resolve) => {
            let settled = false;
            let timer = null;

            const finish = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                window.removeEventListener('message', onReadyMsg);
                sandboxFrame.removeEventListener('load', onFrameLoad);
                resolve();
            };

            const onReadyMsg = (event) => {
                if (event.source !== sandboxFrame.contentWindow) return;
                const d = event.data;
                if (!d || typeof d !== 'object') return;
                if (d.type === 'PANZER_VIEWER_READY' && d.nonce === currentNonce) {
                    finish();
                }
            };

            const onFrameLoad = () => {
                timer = setTimeout(finish, 120);
            };

            timer = setTimeout(finish, 1500);
            window.addEventListener('message', onReadyMsg);
            sandboxFrame.addEventListener('load', onFrameLoad, { once: true });

            sandboxFrame.removeAttribute('src');
            sandboxFrame.setAttribute('sandbox', 'allow-scripts');
            sandboxFrame.srcdoc = viewerHtml;
        });

        // 📦 Preparazione del payload binario (copia e trasferimento ArrayBuffer) in base al tipo MIME validato.
        let payload = null;
        const transferList = [];

        if (activeMimeType && activeMimeType.startsWith('image/') && activeRawBuffer) {
            const copyBuf = activeRawBuffer.slice(0);
            transferList.push(copyBuf);
            payload = {
                type: 'PANZER_RENDER_VIEWER',
                mimeType: activeMimeType,
                buffer: copyBuf,
                zoom: currentZoom
            };
        } else if (activeMimeType && activeMimeType.includes('pdf') && Array.isArray(activePageBlobs)) {
            const pageBuffers = [];
            for (const pBlob of activePageBlobs) {
                if (pBlob instanceof Blob) {
                    const ab = await pBlob.arrayBuffer();
                    pageBuffers.push(ab);
                    transferList.push(ab);
                }
            }
            payload = {
                type: 'PANZER_RENDER_VIEWER',
                mimeType: activeMimeType,
                pageBuffers,
                zoom: currentZoom
            };
        } else if (activeRawBuffer) {
            const copyBuf = activeRawBuffer.slice(0);
            transferList.push(copyBuf);
            payload = {
                type: 'PANZER_RENDER_VIEWER',
                mimeType: activeMimeType || 'application/octet-stream',
                buffer: copyBuf,
                zoom: currentZoom
            };
        }

        if (!payload || !sandboxFrame.contentWindow) {
            logToTerminal('warn', '⚠️ Invio payload al visore sandbox non riuscito.');
            return;
        }

        // 📩 Attesa del riscontro di montaggio (PANZER_RENDER_ACK / PANZER_VIEWER_ERR) per la telemetria PA.
        const ackPromise = new Promise((resolve) => {
            let done = false;
            const cleanup = () => {
                if (done) return;
                done = true;
                clearTimeout(timeoutTimer);
                window.removeEventListener('message', onDiagMsg);
                resolve();
            };

            const onDiagMsg = (event) => {
                if (event.source !== sandboxFrame.contentWindow) return;
                const d = event.data;
                if (!d || typeof d !== 'object' || d.nonce !== currentNonce) return;
                if (d.type === 'PANZER_RENDER_ACK') {
                    logToTerminal('vault', `📩 Sandbox ACK: montati ${d.count ?? 0} elementi.`);
                    cleanup();
                } else if (d.type === 'PANZER_VIEWER_ERR') {
                    logToTerminal('error', `❌ Sandbox ERR: ${d.msg || 'errore interno'}`);
                    cleanup();
                }
            };

            const timeoutTimer = setTimeout(() => {
                if (!done) {
                    logToTerminal('warn', '⚠️ Nessun ACK dal visore sandbox entro il timeout.');
                }
                cleanup();
            }, 1800);

            window.addEventListener('message', onDiagMsg);
        });

        try {
            sandboxFrame.contentWindow.postMessage({
                ...payload,
                nonce: currentNonce
            }, '*', transferList);
        } catch (postErr) {
            logToTerminal('error', `❌ Errore postMessage sandbox: ${postErr.message}`);
            return;
        }

        await ackPromise;
    };

    // 🔒 Visore Sandbox Protetto per la consultazione in sola lettura di atti, immagini e documenti PA.
    const openInSandbox = async (url, fileName) => {
        try {
            // 🔭 Ripristino fattore di zoom iniziale (100%) e registrazione dell'evento nella telemetria PA.
            currentZoom = 1.0;
            logToTerminal('vault', `🫙🔒 Apertura visore protetto per: ${fileName || url} ( Zoom: ${Math.round(currentZoom * 100)}% )`);

            sandboxTitle.textContent = `🔎🔒 ${fileName || url}`;

            // 🛑 Inibizione temporanea dei controlli di zoom durante il caricamento e la rasterizzazione del documento.
            if (btnZoomIn && btnZoomOut) {
                btnZoomIn.disabled = true;
                btnZoomOut.disabled = true;
                btnZoomIn.style.opacity = '0.5';
                btnZoomIn.style.cursor = 'not-allowed';
                btnZoomOut.style.opacity = '0.5';
                btnZoomOut.style.cursor = 'not-allowed';
            }

            // 🧹 Bonifica preventiva di eventuali risorse Object URL o buffer residui da sessioni precedenti.
            if (activeObjectUrl) { URL.revokeObjectURL(activeObjectUrl); activeObjectUrl = null; }
            if (activeViewerBlobUrl) { URL.revokeObjectURL(activeViewerBlobUrl); activeViewerBlobUrl = null; }
            if (activeFallbackObjectUrl) { URL.revokeObjectURL(activeFallbackObjectUrl); activeFallbackObjectUrl = null; }
            if (Array.isArray(activePageObjectUrls) && activePageObjectUrls.length > 0) {
                for (const u of activePageObjectUrls) {
                    try { URL.revokeObjectURL(u); } catch (_) {}
                }
                activePageObjectUrls = [];
            }
            activePageBlobs = [];
            activeSandboxNonce = null;

            // ⏳ Schermata di caricamento isolata in srcdoc senza script inline per evitare blocchi CSP.
            const loadingHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { background: #0f172a; color: #38bdf8; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; user-select: none; }
.spinner { width: 44px; height: 44px; border: 4px solid rgba(56, 189, 248, 0.2); border-top-color: #38bdf8; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
p { font-size: 14px; letter-spacing: 0.5px; font-weight: 500; }
</style>
</head>
<body>
<div class="spinner"></div>
<p>⏳📄 Loading...</p>
</body>
</html>`;

            sandboxFrame.removeAttribute('src');
            sandboxFrame.setAttribute('sandbox', 'allow-scripts');
            sandboxFrame.srcdoc = loadingHtml;
            sandboxModal.classList.add('active');

            // 📥 Acquisizione della risorsa dalla cache/stiva locale e identificazione del tipo MIME.
            const response = await fetch(url);
            if (!response || !response.ok) throw new Error(`HTTP ${response?.status || 'Risorsa irreperibile'}`);

            activeRawBuffer = await response.arrayBuffer();
            const rawMime = response.headers.get('Content-Type') || 'application/octet-stream';
            activeMimeType = CoreUtils.detectMimeType(url, rawMime);

            activePageObjectUrls = [];
            activeFallbackObjectUrl = null;
            activePageBlobs = [];

            // 🖼️📄 Decodifica e preparazione del contenuto in base alla tipologia documentale.
            if (activeMimeType.startsWith('image/')) {
                const imgBlob = new Blob([activeRawBuffer], { type: activeMimeType });
                activeFallbackObjectUrl = URL.createObjectURL(imgBlob);
            } else if (activeMimeType.includes('pdf')) {
                if (typeof pdfjsLib === 'undefined') {
                    await new Promise((resolve, reject) => {
                        const scriptEl = document.createElement('script');
                        scriptEl.src = 'js/pdf_min.js';
                        scriptEl.onload = resolve;
                        scriptEl.onerror = () => reject(new Error("Impossibile caricare js/pdf_min.js"));
                        document.head.appendChild(scriptEl);
                    });
                }

                if (typeof pdfjsLib === 'undefined') {
                    throw new Error("Lib. pdf_min.js non caricata nel contesto principale.");
                }

                pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf_worker_min.js';
                const pdfDataBytes = new Uint8Array(activeRawBuffer);

                const loadingTask = pdfjsLib.getDocument({
                    data: pdfDataBytes,
                    disableWorker: false,
                    isEvalSupported: false
                });

                const pdfDoc = await loadingTask.promise;
                logToTerminal('vault', `✅🔎 PDF - Pagine totali: ${pdfDoc.numPages}`);

                // 🖼️ Rasterizzazione pagina per pagina su canvas temporaneo e rilascio immediato del buffer canvas.
                for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                    const page = await pdfDoc.getPage(pageNum);
                    const scale = window.devicePixelRatio > 1 ? 1.5 : 1.2;
                    const viewport = page.getViewport({ scale: scale });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;

                    const pageBlob = await new Promise((resolve) => {
                        canvas.toBlob((blob) => resolve(blob), 'image/png');
                    });

                    if (pageBlob) {
                        activePageBlobs.push(pageBlob);
                    }

                    canvas.width = 0;
                    canvas.height = 0;
                }
            } else {
                const genericBlob = new Blob([activeRawBuffer], { type: activeMimeType });
                activeFallbackObjectUrl = URL.createObjectURL(genericBlob);
            }

            // 🚀 Montaggio del visore isolato e trasmissione sicura del payload.
            await renderAndMountSandbox();

            sandboxTitle.textContent = `🔎🔒 ${fileName || url}`;

            // 🔓 Riattivazione dei comandi di zoom a caricamento completato.
            if (btnZoomIn && btnZoomOut) {
                btnZoomIn.disabled = false;
                btnZoomOut.disabled = false;
                btnZoomIn.style.opacity = '1';
                btnZoomIn.style.cursor = 'pointer';
                btnZoomOut.style.opacity = '1';
                btnZoomOut.style.cursor = 'pointer';
            }

            logToTerminal('success', `🛡📦️ Documento Aperto nel visore protetto.`);
        } catch (err) {
            sandboxModal.classList.remove('active');
            logToTerminal('error', `❌ 👁️‍🗨️Errore apertura visore: ${err.message}`);
        }
    };

    // ️🔎🔒 Chiusura Visore, sigillatura canale, revoca risorse e bonifica volatile della RAM.
    const closeSandbox = () => {
        // 🔒 Invio del comando di bonifica e sigillatura al contesto sandboxato prima della disattivazione.
        postToSandboxFrame({ type: 'PANZER_CLEAR_VIEWER', nonce: activeSandboxNonce });
        sandboxModal.classList.remove('active');
        sandboxFrame.removeAttribute('srcdoc');
        sandboxFrame.src = 'about:blank';

        // 🧹 Revoca di tutti gli Object URL attivi e reset dei riferimenti di sessione.
        if (activeViewerBlobUrl) {
            URL.revokeObjectURL(activeViewerBlobUrl);
            activeViewerBlobUrl = null;
        }
        if (activeObjectUrl) {
            URL.revokeObjectURL(activeObjectUrl);
            activeObjectUrl = null;
        }
        if (activeFallbackObjectUrl) {
            URL.revokeObjectURL(activeFallbackObjectUrl);
            activeFallbackObjectUrl = null;
        }
        if (Array.isArray(activePageObjectUrls) && activePageObjectUrls.length > 0) {
            for (const url of activePageObjectUrls) {
                try { URL.revokeObjectURL(url); } catch (_) {}
            }
            activePageObjectUrls = [];
        }
        activePageBlobs = [];
        activeSandboxNonce = null;

        // 🧹 Sovrascrittura a zero del buffer binario in memoria volatile ove ancora allocato.
        if (activeRawBuffer) {
            try {
                if (!activeRawBuffer.detached && activeRawBuffer.byteLength > 0) {
                    const secureView = new Uint8Array(activeRawBuffer);
                    secureView.fill(0);
                    logToTerminal('vault', '🧹📄 Buffer Eliminato dalla RAM.');
                } else {
                    logToTerminal('vault', '🧹📄 Buffer RAM già rilasciato dal pdf_worker_min.js');
                }
            } catch (err) {
                logToTerminal('error', `❌ 🧹 Errore pulizia RAM: ${err.message}`);
            }
            activeRawBuffer = null;
        }

        activeMimeType = null;
        currentZoom = 1.0;

        logToTerminal('info', '🔎🔒 Visore protetto chiuso. ✅');
    };

    btnCloseSandbox.addEventListener('click', closeSandbox);

    // 🚀 Inizializzazione SDK con configurazione personalizzata dei blocker e trigger pulito su onOnline
    const sdk = new PanzerSDK(Object.freeze({
        swPath: getDefined_swPath,
        scope: getDefined_scope,
        coreAssets: getDefinedCoreAssets(),
        cacheNamePrefix: getDefined_CacheNamePrefix,
        checkTimeout: 6660,
        
        // 🔏 Hook per l'apertura del modale PIN gestito dall'App
        onPromptPin: (mode, msg) => {
            showPinModal(mode, msg);
        },

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
        
        onOnline: () => {
            setStatusBadge('🌐 Rete Online - Sincronizzazione...', 'badge-sync');
            logToTerminal('sync', '🛡️ SDK: 🌐 Connessione on-line ripristinata. ✅🔄 Avvio automatico sincronizzazione stiva...');
            btnSync.click();
        },

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

    // 🚪 Tasto esplicito Termina Sessione (Lock Session) nella UI
    const btnLockSession = document.getElementById('PA-btn-lock-session');
    if (btnLockSession) {
        btnLockSession.addEventListener('click', () => {
            if (sdk && sdk.vaultManager) {
                sdk.vaultManager.lockSession();
                showPinModal('unlock', 'Sessione terminata manualmente. Inserisci il PIN per rientrare:');
            }
        });
    }
    // 🔄🔑 Tasto esplicito cambia PIN.
    const btnChangePin = document.getElementById('PA-btn-change-pin');
    if (btnChangePin) {
        btnChangePin.addEventListener('click', () => {
            if (typeof showPinModal === 'function') {
                showPinModal('change', '🔑 Modifica il PIN di sicurezza del Caveau:');
            }
        });
    }
    
    // 🔐🧬 Tasto esplicito Associa Passkey PRF.
    const btnRegisterPrf = document.getElementById('PA-btn-register-prf');
    if (btnRegisterPrf && sdk && sdk.vaultManager && typeof sdk.vaultManager.registerPrfCredential === 'function') {
        if (typeof sdk.vaultManager.canUsePrf === 'function') {
            sdk.vaultManager.canUsePrf().then((supported) => {
                if (supported) {
                    btnRegisterPrf.style.display = 'inline-block';
                }
            });
        }

        btnRegisterPrf.addEventListener('click', () => {
            showPinModal('register-prf', '🔐🧬 Inserisci il PIN corrente per associare Passkey / Biometria:');
        });
    }
    
    // 🔎 Controllo iniziale dello stato del Caveau all'avvio
    const initVaultCheck = () => {
        if (sdk && sdk.vaultManager) {
            sdk.vaultManager.checkStatus((status) => {
                logToTerminal('vault', `🛡️ Stato Caveau all'avvio -> Configurato: ${status.configured}, Sbloccato: ${status.unlocked}`);
                
                const everSynced = localStorage.getItem('panzer_vault_synced') === 'true';

                // SE IL CAVEAU È CONFIGURATO MA NON SBLOCCATO
                if (status.configured && !status.unlocked) {
                    logToTerminal('warn', '🔒 Caveau bloccato. Richiesta sblocco PIN.');
                    showPinModal('unlock', '🔒🔑 Inserisci il PIN per sbloccare il caveau:');
                } 
                // SE NON È CONFIGURATO
                else if (!status.configured) {
                    if (everSynced) {
                        showPinModal('unlock', '🔒 Caveau protetto. Inserisci il PIN per sbloccare:');
                    } else {
                        showPinModal('setup', '🆕🔐 Prima installazione: Crea un PIN di sicurezza:');
                    }
                } 
                // SE È GIÀ SBLOCCATO MA NON HA MAI FATTO IL SYNC
                else if (status.unlocked && !everSynced) {
                    logToTerminal('warn', '⚠️ Caveau sbloccato, ma stiva non sincronizzata.');
                }
                else {
                    logToTerminal('success', '🟢 Caveau sbloccato e stiva pronta.');
                }
            });
        }
    };

    // Avvia il controllo...
    initVaultCheck();


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

        const rawQuery = storageSearch.value || '';
        const filterQuery = rawQuery.toLowerCase().replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

        const filteredAssets = allAssets.filter(asset => {
            const url = (asset.url || '').toLowerCase();
            const type = (asset.type || '').toLowerCase();
            const category = (asset.category || '').toLowerCase();
            return url.includes(filterQuery) || type.includes(filterQuery) || category.includes(filterQuery);
        });

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
            tdCache.innerHTML = cacheBadge;

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

            tr.appendChild(tdInfo);
            tr.appendChild(tdType);
            tr.appendChild(tdSize);
            tr.appendChild(tdCache);
            tr.appendChild(tdAction);

            const attachedBtn = tr.querySelector('.btn-sandbox-trigger');
            if (attachedBtn) {
                attachedBtn.addEventListener('click', (e) => {
                    const targetUrl = e.currentTarget.getAttribute('data-url');
                    openInSandbox(targetUrl, targetUrl.split('/').pop());
                });
            }
            fragment.appendChild(tr);
        }

        storageTbody.appendChild(fragment);
        logToTerminal('vault', `🔎🗄️ Ispezione stiva aggiornata: ${filteredAssets.length} risorse visualizzate via DocumentFragment.`);
    };

    try {
        logToTerminal('info', `📥📜🛒 Recupero file [ ${getDefined_Manifest_Assets} ] ...`);
        const res = await fetch(getDefined_Manifest_Assets);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

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