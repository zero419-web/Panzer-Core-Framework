<p align="center">
  <img src="https://raw.githubusercontent.com/zero419-web/Panzer-Core-Framework/main/sw_logo.svg" width="180" alt="Core Logo - Panzer v7.x+">
</p>

<h1 align="center">🏗️ PANZER SDK & CORE FRAMEWORK</h1>

<p align="center">
  <img src="https://img.shields.io/badge/🌀_PANZER_SDK_BETA-v2.3.8-1f4e79" alt="SDK Badge">
  <img src="https://img.shields.io/badge/⚙️🪖_CORE_PANZER-v7.9.8+-4f4f00" alt="Core Badge">
  <img src="https://img.shields.io/badge/PoC-📱_PWA_x_PA-af0000" alt="PoC Badge">
  <img src="https://img.shields.io/badge/Licenza-🇪🇺_EUPL_v1.2-0055a5" alt="License Badge">
</p>

<h2 align="center">
  <a href="https://zero419-web.github.io/Panzer-Core-Framework/">
    <strong>👁️‍🗨️ PROVA LA DEMO LIVE ON-LINE 🌐</strong>
  </a>
</h2>

> [!NOTE]
> 💡 **La demo live permette di testare immediatamente:** la Resilienza di rete, la Modalità Bunker 🗄️, la simulazione Lie-Fi 🤥🛜 e il Download 📥 simultaneo delle risorse dal Manifesto.

---

## 🚀 Obiettivi del Progetto

- 🌀 **Proof of Concept (PoC):** Architettura software sovrana per **Progressive Web App (📲 PWA)** basata sul **⚙️🪖 Core Panzer v7.x+**, progettata in modalità *🔐 Zero-Trust*.
- 🏛️ **Conformità Istituzionale:** Il sistema garantisce **massima resilienza informatica**, continuità operativa *offline-first*, consultazione protetta di atti e documenti della **Pubblica Amministrazione (PA)**, nel pieno rispetto delle linee guida tecniche 📑 **AgID** e del **📜 Codice dell'Amministrazione Digitale (CAD)** per il riuso (*🇪🇺 EUPL v1.2*).
- ⚙️ **Difesa Attiva & Tolleranza ai Guasti:** Implementa strategie avanzate di computazione asincrona isolata, crittografia simmetrica client-side e tolleranza ai guasti di tipo militare. Garantisce che i dati sensibili rimangano protetti anche su reti degradate (*Lie-Fi 🤥🛜*) o assenti. In caso di manomissione fisica o *data breach* sul file system locale del client, tutti i file vengono eliminati per sicurezza e risincronizzati automaticamente con il server della PA.

---

## 🛠️ Architettura e Caratteristiche Principali

Il sistema si compone di due livelli perfettamente integrati: il **Service Worker (`ServiceWorker.js`)** che agisce come entità autonoma di difesa, e l'**SDK Client (`SDK.js`)** che gestisce l'interfaccia, la memoria e i meccanismi di blocco.

### 🔹 1. Core Engine (`ServiceWorker.js` - v7.x+)
- **🔐🌡️🛡️ Jittered Thermal Shield Race:** Ispezione forense profonda sul modulo `deepVaultValidation()`. Implementa una gara asincrona tra l'interrogazione a IndexedDB e lo **Scudo Termico Adattivo** (`waitTillIdle`).
- **🔄🌐🛡️🔗 Dynamic Adaptive Network Resiliency:** Algoritmo proprietario che adatta dinamicamente i timeout di rete basandosi su 5 profili telemetrici hardware di velocità della connessione.
- **🌐➡️💾 Network-First Predittivo con Cache Fallback:** Intercettazione condizionale degli eventi di fetch con abort atomico delle richieste in caso di latenza degradata e rilascio immediato della risorsa cifrata locale.
- **🔬🧬 SW Forensics (DNA Check & Binary Validation):** Controllo biometrico sequenziale (**🤯 Testa**, **👣 Coda**, **🪵 Corpo**) tramite `isValidBlob()` per prevenire attacchi di *☠️ Cache Poisoning*, bloccare file polyglot ed eradicare vettori malevoli (*Anti-PDF Scripting ❌📜*).
- **🛡️📴 Offline Bunker Mode & Emergency Wipe:** In caso di violazione rilevata, il Panzer attiva contromisure distruttive (*Tabula Rasa ☢️*): pialla il `Cache Storage` e il database locale (`indexedDB.deleteDatabase`), isolando il sistema per proteggere il dato sensibile.
- **🔀📡 Architettura di Instradamento a 5 Sezioni (Fetch Strict Layer 🚥):** Ciclo di vita della richiesta compartimentato in perimetri rigidi per superare i capitolati di ispezione AgID (*Normalizzazione, Online Gateway, Cache Hit, Filtro Multimediale, Critical Fallback*).
- **✉️↔️📬 Canale IPC PostMessage:** Ricezione sicura dei comandi dal frontend con isolamento della chiave in RAM tramite `Structured Clone API` e validazione profonda (`universalScanner`).

### 🔹 2. Client SDK & Dashboard (`SDK.js` / `app.js` - v2.x)
- **🐺🗄️ Watchdog Integrità Stiva Anti-Wipe:** Sistema di controllo costante sui dati della PWA per impedire che l'interfaccia rimanga attiva se la memoria viene svuotata inaspettatamente dal browser o dal sistema operativo, con popup di ripristino guidato.
- **🐺 Watchdog Anti-Incognito ❌🕵️:** Rilevamento selettivo della navigazione in incognito sui motori Chromium/Blink con timeout adattivo configurabile.
- **🔒 Visore Sandbox Protetto (`openInSandbox`):** Apertura isolata dei documenti tramite `iframe` con policy `sandbox="allow-scripts"`, zoom istantaneo su Blob e **Zeroization preventiva della RAM** (`Uint8Array.fill(0)`) alla chiusura.
- **❄️ Immutabilità & Hardening Client:** Congelamento delle configurazioni e del manifesto in memoria (`Deep Freeze`), sanitizzazione degli input e rendering sicuro del DOM senza `innerHTML` per azzerare i rischi di DOM-based XSS.
- **🎖️ Zero-Dipendenze:** Sviluppato interamente in **🍦 Vanilla JS**, garantendo assenza di debiti tecnici e piena rispondenza all'**Art. 69 del CAD**.

---

## 🌐 Browser Supportati

| 🌐 Browser | 🔎 Stato | Note Tecniche |
| :--- | :--- | :--- |
| 🌐 **Google Chrome** | Supportato ✅ | Pieno supporto a tutte le feature e Watchdog |
| 🌐 **Chromium** | Supportato ✅ | Pieno supporto (motore JS V8 ⚡) |
| 🧭 **Safari** | **In sperimentazione** ☑️ | Watchdog Anti-Incognito non supportato |
| 🦊 **Firefox** | **Non supportato** ❌ | Limitazioni architetturali sulle API richieste |

> [!TIP]
> 💡 **Compatibilità estesa:** Il progetto è pienamente compatibile con tutti i browser basati su motore **Chromium (`JS V8` ⚡)**, inclusi **Microsoft Edge, Brave, Opera, Vivaldi e Arc** (incluso il supporto completo al *🐺 Watchdog Anti-Incognito ❌🕵️*).

---

## 📖 Documentazione Ufficiale

- 🔍🚀 Per l'analisi dettagliata dei vettori crittografici, le metriche forensi di stabilità e gli scenari applicativi per Enti e Pubblica Amministrazione, consulta la **[📚 Wiki Ufficiale del Progetto](https://github.com/zero419-web/Panzer-Core-Framework/wiki)**.

---

## 👤 Autore

**Valentino Aglianò**
- 📌 **Perito Industriale Informatico** (*2013*)
- 👩‍💻 **Istruttore Informatico:** Qualificatosi *Idoneo nel Concorso Nazionale ASMEL 2025* per **Profili IT della Pubblica Amministrazione**.
- ⚙️🛡️ **Specializzazione:** Ingegneria difensiva, architetture PWA in *Bunker Mode* e cybersecurity applicata (**🟣 Purple Team:** bilanciamento tra mentalità offensiva *Red Team 🔴* e blindatura difensiva *Blue Team 🔵*).
- 🏥 **Production Case Study (*2014 - 2018*) – Sanità Pubblica (*ASP8 SR*):**
  - Sviluppo di **APP Gestionale Turnistica Infermieristica** ad altissima affidabilità (zero downtime in ambiente ospedaliero).
  - *Security & Stack:* Cifratura *SQLite via DLL*, `💾 Dongle USB Hardware Binding con Auto-Kill su WMI`, RBAC granulare, Engine `AutoIt3 + UI HTML4/CSS/JS + DB SQLite`.

---

## ⚖️ Licenza

- ⚙️📑 Progetto rilasciato sotto licenza **🇪🇺 EUPL v1.2** (*European Union Public Licence*).
- La legalità del riuso, la trasparenza del codice e la conformità ai framework normativi dell'Unione Europea sono garantiti. Consulta il file [`LICENSE`](https://github.com/zero419-web/Panzer-Core-Framework?tab=License-1-ov-file#%E2%84%B9%EF%B8%8F--eupl-v12---european-union-public-licence) per i dettagli.

---

## 📜 Changelog & Storico Versioni

<details>
<summary><strong>⚙️🪖 Espandi Changelog CORE PANZER (v7.6+ → v7.9.8+)</strong></summary>

### 🪖 NOVITÀ v7.9.8+ (`🪨 Hardening`)
- 🛡️ **Validazione Ingressi IPC rigorosa 🚧 (`validateAndSanitizeAssetPath`):**
  - 🌐 **Same-Origin Check:** Controllo stringente per azzerare qualsiasi rischio di *Server-Side Request Forgery (SSRF)* verso domini esterni.
  - 🛑 **Anti-Path Traversal:** Blocco tassativo e preventivo di sequenze di risalita directory (`../`, `..\`, `\0`).
- 🛑 **Protezione Anti-DoS & Memory Exhaustion:** Introduzione di un tetto massimo rigoroso (`MAX_ALLOWED_ASSETS = 500`) sul numero di risorse accettate dal manifesto e dai core assets.

### 🪖 NOVITÀ v7.9.7+ (`🐛 BUG Fix`)
- 🪳 **Bug Fixed su Evento Fetch del SW:** Ottimizzazione di *NetWorkFirst*, *SWR (Stale-While-Revalidate)*, *Regolatore di Flusso Polimorfo* e *Universal-Scan*.
- 🖼️🩹 **Gestione Placeholder:** Risolto il comportamento sulle richieste `HEAD` per le risorse immagine (restituisce `404 Error` ❌ invece del placeholder).
- ➕ **🧭 Safari:** Avviato supporto in sperimentazione (escluso il Watchdog Anti-Incognito).

### 🪖 NOVITÀ v7.9.6+ (`🐛 BUG Fix`)
- 🪳 **Evento Fetch:** Aggiunto calcolo e invio corretto dell'header `Content-Length` nelle risposte servite dal Service Worker.
- 🐺️🐤 **Watchdog di Sicurezza:** Introdotta tolleranza a **3 tentativi** prima di dichiarare compromessa la chiave di cifratura della stiva (`🔑🗄️`).

### 🪖 NOVITÀ v7.9.5+ (`🐛 BUG Fix`)
- 🚀 **SWR & Reti Degradate:** Strategia migliorata e perfezionamento del *Regolatore di Flusso Polimorfo* per adattarsi dinamicamente alle connessioni instabili.
- 🎯 **Riorganizzazione Fetch:** Ottimizzazione dei flussi *NetworkFirst/SaveBackground*, *SWR* e *CacheFirst (Off-line)*.

### 🪖 NOVITÀ v7.9+ (`🪨 Hardening contro il Red-Team 🔴`)
- 🔍 **1. Validazione Forense Blob (`isValidBlob`):**
  - 🧹 **SVG & Anti-Polyglot:** Blocco tag ostili (`<script>`, `<iframe>`), event handler inline (`onload=`) e signature di script in immagini raster (`PNG`, `WEBP`, `JPEG`).
  - 📄 **PDF, PAdES & CAdES De-Obfuscated:** Finestra di analisi estesa a **4096 byte** per header e footer (supporto firme digitali e buste `.p7m`), soglia minima a **2 KB**, decodifica esadecimale, strip commenti/spazi, blocco stream compressi (`/flatedecode`, `/lzwdecode`) e isolamento pattern malevoli.
  - 🧠 **RAM Zero-Out:** Bonifica della memoria con `.fill(0)` sui buffer attivi gestita tramite blocchi `finally` sicuri.
- 🧠 **2. Deep Scanner IPC (`universalScanner`):**
  - 🛑 **Cap Nodi & Profilo:** Limite massimo di **999 nodi per albero** e vincolo a **12 livelli** di profondità (*Anti-JSON-Bomb*).
  - 🛡️ **Anti-Path Traversal:** Sanitizzazione e scarto di chiavi e percorsi con risalite directory (`../`, `..\`) o null byte (`\0`).
  - ⚡ **CPU Yielding:** Pausa non-blocking dell'Event Loop ogni 10 nodi per preservare la reattività del thread worker.
- 🔒 **3. Iniezione Security Headers (`injectSecurityHeaders`):** Riscrittura automatica in-flight degli header HTTP (`nosniff`, `DENY`, `strict-origin-when-cross-origin`, `same-origin`) su ogni risposta intercettata.

### 🪖 NOVITÀ v7.7+ / v7.8+ (`🪨 Hardening Totale`)
- 🔬🧬 **SW Forensics (DNA Check & Binary Validation):** Verifica dei Magic Bytes nei primi 512 byte (*Testa*), controllo terminatore finale via `blob.slice(-5).arrayBuffer()` (*Coda*) e scansione anti-offuscamento del corpo PDF (`/JS`, `/JavaScript`, `/OpenAction`, `/Launch`) con azzeramento memoria (`wipeRAM()`) in caso di fallimento.

### 🪖 NOVITÀ v7.6+ (`➕ Funzionalità`)
- 🏴‍☠️ **Protocolli Anti-Profiling:** Conversione dei punti di errore in *Black Hole* informativi, sterilizzazione degli stack trace e iniezione di rumore temporale (`💉⏱️`) contro attacchi *side-channel*.

</details>

<details>
<summary><strong>⚙️📦 Espandi Changelog SDK & DASHBOARD (v2.1 → v2.3.8)</strong></summary>

### 📣 NOVITÀ v2.3.8 (`🔄📊 GUI DashBoard & Sandbox`)
- 🔒 **Visore Sandbox Protetto (`openInSandbox`):** Isolamento tramite `iframe` (`sandbox="allow-scripts"`) e zoom universale istantaneo su Blob rasterizzato.
- 💻 **Gestione Sicura RAM (`closeSandbox`):** Controllo `!activeRawBuffer.detached` e sanitizzazione Heap con `Uint8Array.fill(0)` prima del rilascio definitivo.
- ❄️ **Deep Freeze:** Configurazioni e manifesto PA congelati in sola lettura all'avvio.

### 📣 NOVITÀ v2.3.6 (`🐺🗄️ Watchdog & Hardening`)
- 🛡️ **Watchdog Integrità Stiva Anti-Wipe:** Protezione intelligente contro lo svuotamento imprevisto della memoria, resilienza al riavvio e popup di ripristino guidato con un click.
- 🪨 **Hardening GUI DashBoard (`app.js`):** Aggiornamenti di sicurezza sull'interfaccia.

### 📣 NOVITÀ v2.3.4 (`🪨 Hardening`)
- 🔒 **Immutabilità Totale (`Object.freeze`):** Sigillatura dei modali di blocco (`incognitoBlocker`, `cacheWipeBlocker`, `purgeSuccessBlocker`), dei Core Assets e del payload IPC (`safePayload`).
- 💻 **Dashboard Client Hardening (`app.js`):** Sanitizzazione input di ricerca (`filterQuery`) da caratteri di controllo ASCII e sostituzione di `innerHTML` con `document.createElement` e `textContent` in `renderStorageTable` per prevenire DOM-based XSS.

### 🪳 Bug Fix v2.3.3 (`app.js`)
- Ottimizzazione delle prestazioni visive di `renderStorageTable()` su dispositivi datati tramite `DocumentFragment`.

### 📣 NOVITÀ v2.3.2 (`➕🔄 Ciclo di Vita & Modali`)
- ⚡ **Controllo Ciclo di Vita:** Aggiunta opzione `autoInit` nel costruttore e metodo pubblico `destroy()` per la pulizia sicura di timer ed event listener.
- 🧱 **Motore Grafico Modale Unificato (`_renderModalBlocker`):** Gestione centralizzata dei modali e ripristino automatico dello scroll.
- 📚 **JSDoc Completo:** Integrazione di `@typedef`, `@param`, `@returns` per supporto IntelliSense negli IDE.

### 📣 NOVITÀ v2.3 (`➕🔄 Funzionalità`)
- **🐺🗄️ Watchdog Integrità Stiva:** Monitoraggio periodico della cache con popup personalizzabile per purga volontaria o involontaria.
- **🕵️‍♂️ Rilevamento Incognito Selettivo:** Controllo mirato esclusivamente su motori Chromium/Blink.
- **🌐🔄 Gestione Rete Resiliente:** Badge dinamico On-line/Off-line e auto-risincronizzazione della stiva al ritorno della rete.
- **📌🗄️ Prefisso Cache Parametrico:** Gestione centralizzata (`PA_PANZER_ENGINE_v`).

### 📣 NOVITÀ v2.1 (`🐛 BUG Fix`)
- Fix generali su `SDK.js`, `ServiceWorker.js`, Sandbox Visore, Sync Stiva Bunker e aggiornamento GUI Dashboard (`app.js`).

</details>