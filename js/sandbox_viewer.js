/**
 * 🌀🪖 Panzer-Core-Framework — Visore Isolato per Documenti PA (js/sandbox_viewer.js)
 *
 * 🛡️ Modulo client zero-dipendenze eseguito all'interno di un contenitore <iframe>
 * isolato (sandbox="allow-scripts", origine opaca) per la visualizzazione in sola
 * lettura di atti, immagini e documenti convertiti in memoria locale.
 *
 * 🔐 Controlli di sicurezza e continuità operativa:
 * - 🔑 Autenticazione di canale tramite nonce crittografico monouso per sessione.
 * - 🤝 Verifica della sorgente (event.source === window.parent) e sigillatura del
 *   canale alla chiusura/bonifica (PANZER_CLEAR_VIEWER).
 * - 🛑 Validazione stringente di comandi, fattori di zoom e tipologie MIME.
 * - 🧹 Gestione locale di Object URL temporanei con revoca esplicita per limitare
 *   la permanenza dei riferimenti in memoria.
 * - 📡 Notifica di prontezza (PANZER_VIEWER_READY), riscontro di montaggio
 *   (PANZER_RENDER_ACK) e segnalazione anomalie (PANZER_VIEWER_ERR).
 */
(function () {
    'use strict';

    // 🔑 Estrazione e normalizzazione del token di sessione (nonce) associato all'istanza del visore.
    const scriptEl = document.currentScript;
    const rawNonceAttr = scriptEl && scriptEl.dataset ? scriptEl.dataset.panzerNonce : '';
    let EXPECTED_NONCE = '';

    if (typeof rawNonceAttr === 'string' && rawNonceAttr.length > 0) {
        try {
            const parsed = JSON.parse(rawNonceAttr);
            EXPECTED_NONCE = typeof parsed === 'string' ? parsed : rawNonceAttr;
        } catch (_) {
            EXPECTED_NONCE = rawNonceAttr;
        }
    }

    // 📦 Stato interno del contesto isolato e riferimenti temporanei alle risorse locali.
    let channelSealed = false;
    const root = document.getElementById('panzer-viewer-root');
    const scroller = document.scrollingElement || document.documentElement;
    let currentUrls = [];
    let currentZoomVal = 1.0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    // 🛑 Vincoli difensivi sui parametri ricevuti dal contesto applicativo principale.
    const isValidZoom = (z) => typeof z === 'number' && Number.isFinite(z) && z >= 0.5 && z <= 3.0;
    const isValidMime = (m) =>
        typeof m === 'string' &&
        m.length > 0 &&
        m.length <= 100 &&
        /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(m.split(';')[0].trim());

    // 🧹 Revoca gli Object URL creati nel contesto del visore per rilasciare le risorse locali.
    const revokeLocalUrls = () => {
        for (let i = 0; i < currentUrls.length; i++) {
            try {
                URL.revokeObjectURL(currentUrls[i]);
            } catch (_) {}
        }
        currentUrls = [];
    };

    // 🔭 Applica il livello di ingrandimento (zoom) e abilita/disabilita lo scorrimento a trascinamento.
    const applyZoomState = (zoom) => {
        currentZoomVal = isValidZoom(zoom) ? zoom : 1.0;
        const isZoomedMode = currentZoomVal > 1.0;
        const pct = `${currentZoomVal * 100}%`;

        if (!root) return;

        const imgContainer = root.querySelector('.img-container');
        if (imgContainer) {
            imgContainer.classList.toggle('zoomed', isZoomedMode);
            const img = imgContainer.querySelector('img');
            if (img) img.style.width = pct;
        }

        const pdfWrapper = root.querySelector('#pdf-wrapper');
        if (pdfWrapper) {
            pdfWrapper.classList.toggle('zoomed', isZoomedMode);
            pdfWrapper.querySelectorAll('.pdf-page').forEach((el) => {
                el.style.width = pct;
            });
        }

        const objEl = root.querySelector('.generic-stage object');
        if (objEl) {
            objEl.style.width = pct;
            objEl.style.height = pct;
        }

        if (isZoomedMode) {
            document.body.style.touchAction = 'none';
            document.body.style.cursor = 'grab';
        } else {
            document.body.style.touchAction = '';
            document.body.style.cursor = 'default';
        }
    };

    // 🖐️ Gestione del panning (scorrimento tramite puntatore/touch) quando il documento è ingrandito.
    if (scroller) {
        scroller.addEventListener('pointerdown', (e) => {
            if (currentZoomVal <= 1.0) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startScrollLeft = scroller.scrollLeft;
            startScrollTop = scroller.scrollTop;
            document.body.style.cursor = 'grabbing';
            try {
                scroller.setPointerCapture(e.pointerId);
            } catch (_) {}
        }, { passive: true });

        scroller.addEventListener('pointermove', (e) => {
            if (!isDragging || currentZoomVal <= 1.0) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            scroller.scrollLeft = startScrollLeft - dx;
            scroller.scrollTop = startScrollTop - dy;
        }, { passive: true });

        const stopDrag = (e) => {
            if (!isDragging) return;
            isDragging = false;
            document.body.style.cursor = currentZoomVal > 1.0 ? 'grab' : 'default';
            if (e && typeof e.pointerId === 'number') {
                try {
                    scroller.releasePointerCapture(e.pointerId);
                } catch (_) {}
            }
        };

        scroller.addEventListener('pointerup', stopDrag, { passive: true });
        scroller.addEventListener('pointercancel', stopDrag, { passive: true });
    }

    // 📩 Ricezione e validazione dei comandi provenienti esclusivamente dal frame genitore (parent).
    window.addEventListener('message', (event) => {
        try {
            if (channelSealed) return;
            if (event.source !== window.parent) return;

            const data = event.data;
            if (!data || typeof data !== 'object' || Array.isArray(data)) return;
            if (!EXPECTED_NONCE || typeof data.nonce !== 'string' || data.nonce !== EXPECTED_NONCE) return;

            const allowedTypes = ['PANZER_RENDER_VIEWER', 'PANZER_ZOOM_VIEWER', 'PANZER_CLEAR_VIEWER'];
            if (!allowedTypes.includes(data.type)) return;

            // 🔭 Aggiornamento dinamico dello zoom sulla vista corrente.
            if (data.type === 'PANZER_ZOOM_VIEWER') {
                if (!isValidZoom(data.zoom)) return;
                applyZoomState(data.zoom);
                return;
            }

            // 🔒🧹 Bonifica locale dei riferimenti, svuotamento del DOM e chiusura definitiva del canale.
            if (data.type === 'PANZER_CLEAR_VIEWER') {
                channelSealed = true;
                revokeLocalUrls();
                if (root) root.innerHTML = '';
                currentZoomVal = 1.0;
                document.body.style.touchAction = '';
                document.body.style.cursor = 'default';
                return;
            }

            // 🖼️📄 Montaggio locale del contenuto (immagine, pagine PDF rasterizzate o risorsa generica).
            if (data.type === 'PANZER_RENDER_VIEWER') {
                if (!isValidMime(data.mimeType)) return;
                if (data.zoom !== undefined && !isValidZoom(data.zoom)) return;

                revokeLocalUrls();
                if (root) root.innerHTML = '';
                const mime = data.mimeType.split(';')[0].trim().toLowerCase();
                let mountedCount = 0;

                if (mime.startsWith('image/') && data.buffer instanceof ArrayBuffer) {
                    const blob = new Blob([data.buffer], { type: mime });
                    const objUrl = URL.createObjectURL(blob);
                    currentUrls.push(objUrl);

                    const stage = document.createElement('div');
                    stage.className = 'img-stage';
                    const container = document.createElement('div');
                    container.className = 'img-container';
                    const img = document.createElement('img');
                    img.src = objUrl;
                    img.alt = 'Immagine protetta';
                    container.appendChild(img);
                    stage.appendChild(container);
                    root.appendChild(stage);
                    mountedCount = 1;
                } else if (mime.includes('pdf') && Array.isArray(data.pageBuffers) && data.pageBuffers.length <= 500) {
                    const wrapper = document.createElement('div');
                    wrapper.id = 'pdf-wrapper';

                    data.pageBuffers.forEach((pBuf, idx) => {
                        if (!(pBuf instanceof ArrayBuffer)) return;
                        const pBlob = new Blob([pBuf], { type: 'image/png' });
                        const pUrl = URL.createObjectURL(pBlob);
                        currentUrls.push(pUrl);

                        const pageImg = document.createElement('img');
                        pageImg.className = 'pdf-page';
                        pageImg.src = pUrl;
                        pageImg.alt = `Pagina ${idx + 1}`;
                        wrapper.appendChild(pageImg);
                        mountedCount++;
                    });

                    root.appendChild(wrapper);
                } else if (data.buffer instanceof ArrayBuffer) {
                    const gBlob = new Blob([data.buffer], { type: mime });
                    const gUrl = URL.createObjectURL(gBlob);
                    currentUrls.push(gUrl);

                    const stage = document.createElement('div');
                    stage.className = 'generic-stage';
                    const objEl = document.createElement('object');
                    objEl.data = gUrl;
                    objEl.type = mime;
                    stage.appendChild(objEl);
                    root.appendChild(stage);
                    mountedCount = 1;
                }

                applyZoomState(data.zoom !== undefined ? data.zoom : 1.0);

                // ✅📩 Conferma al contenitore principale l'avvenuto montaggio degli elementi nel DOM.
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'PANZER_RENDER_ACK',
                        nonce: EXPECTED_NONCE,
                        count: mountedCount
                    }, '*');
                }
            }
        } catch (frameErr) {
            // ❌⚠️ Segnalazione strutturata dell'eccezione verso il contenitore principale per la telemetria.
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'PANZER_VIEWER_ERR',
                        nonce: EXPECTED_NONCE,
                        msg: frameErr && frameErr.message ? String(frameErr.message) : 'FrameError'
                    }, '*');
                }
            } catch (_) {}
        }
    });

    // 📡🤝 Segnalazione iniziale di disponibilità del ricevitore (handshake di sessione).
    try {
        if (window.parent && window.parent !== window && EXPECTED_NONCE) {
            window.parent.postMessage({
                type: 'PANZER_VIEWER_READY',
                nonce: EXPECTED_NONCE
            }, '*');
        }
    } catch (_) {}
})();
