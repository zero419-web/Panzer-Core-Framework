<p align="center">
  <img src="https://raw.githubusercontent.com/zero419-web/Panzer-Core-Framework/main/sw_logo.svg" width="180" alt="Core Logo - Panzer v7.x+">
</p>

<h1 align="center">🏗️ PANZER SDK & CORE FRAMEWORK</h1>

<p align="center">
  <img src="https://img.shields.io/badge/🌀_PANZER_SDK-v2.3.8-1f4e79" alt="SDK Badge">
  <img src="https://img.shields.io/badge/📊_PANZER_APP-v2.4.2-2563eb" alt="App Badge">
  <img src="https://img.shields.io/badge/⚙️🪖_CORE_PANZER-v7.9.30+-4f4f00" alt="Core Badge">
  <img src="https://img.shields.io/badge/PoC-📱_PWA_x_PA-af0000" alt="PoC Badge">
  <img src="https://img.shields.io/badge/Licenza-🇪🇺_EUPL_v1.2-0055a5" alt="License Badge">
</p>

<br>

<h2 align="center">
  <a href="https://zero419-web.github.io/Panzer-Core-Framework/">
    <strong>👁️‍🗨️ PROVA LA DEMO LIVE ON-LINE 🌐</strong>
  </a>
</h2>

<br>

> [!NOTE]
> 💡 **La demo live permette di testare immediatamente:** la Resilienza di rete, la Modalità Bunker 🗄️, la simulazione Lie-Fi 🤥🛜 e il Download 📥 simultaneo delle risorse dal Manifesto.

<br>

---

## 🚀 Obiettivi del Progetto

- 🌀 **Proof of Concept (PoC):** <br> Architettura software sovrana per **Progressive Web App (📲 PWA)** basata sul **⚙️🪖 Core Panzer v7.9.30+**, il client **SDK v2.3.8** e la Dashboard **App v2.4.2**, progettata in modalità *🔐 Zero-Trust*.

- 🏛️ **Conformità Istituzionale:** <br> Il sistema garantisce **massima resilienza informatica**, continuità operativa *offline-first*, consultazione protetta di atti e documenti della **Pubblica Amministrazione (PA)**, nel pieno rispetto delle linee guida tecniche 📑 **AgID** e del **📜 Codice dell'Amministrazione Digitale (CAD)** per il riuso (*🇪🇺 EUPL v1.2*).

- ⚙️ **Difesa Attiva & Tolleranza ai Guasti:** <br> Implementa strategie avanzate di computazione asincrona isolata, crittografia simmetrica client-side con Key Wrapping basato su PIN utente e tolleranza ai guasti di tipo militare. Garantisce che i dati sensibili rimangano protetti anche su reti degradate (*Lie-Fi 🤥🛜*) o assenti. In caso di manomissione fisica o *data breach* sul file system locale del client, tutti i file vengono eliminati per sicurezza e risincronizzati automaticamente con il server della PA.

<br>

---

## 🛠️ Architettura e Caratteristiche Principali

Il sistema si compone di due livelli perfettamente integrati: il **Service Worker (`ServiceWorker.js`)** che agisce come entità autonoma di difesa, e l'**SDK & Dashboard Client (`SDK.js` / `app.js`)** che gestisce l'interfaccia, la memoria e i meccanismi di blocco con gestione avanzata del caveau cifrato.

<br>

### 🔹 1. Core Engine ( `ServiceWorker.js` - v7.9.16+ )

- **🔐🔑 Pin-Protected Key Wrapping (PBKDF2 + AES-GCM):** <br> Evoluzione radicale della sicurezza: la Master Key non è più solo non esportabile in RAM, ma viene cifrata a riposo su IndexedDB tramite un pacchetto protetto (`wrapped_master_key`) derivato dai byte del PIN dell'operatore ( *100.000 iterazioni PBKDF2, SHA-256* ).

- **🔐🌡️🛡️ Jittered Thermal Shield Race:** <br> Ispezione forense profonda sul modulo `deepVaultValidation()`. Implementa una gara asincrona tra l'interrogazione al database della stiva e lo **Scudo Termico Adattivo** (`waitTillIdle`).

- **🔄🌐🛡️🔗 Dynamic Adaptive Network Resiliency:** <br> Algoritmo proprietario che adatta dinamicamente i timeout di rete basandosi su 5 profili telemetrici hardware di velocità della connessione.

- **🌐➡️💾 Network-First Predittivo con Cache Fallback:** <br> Intercettazione condizionale degli eventi di fetch con abort atomico delle richieste in caso di latenza degradata e rilascio immediato della risorsa cifrata locale.

- **🔬🧬 SW Forensics (DNA Check & Binary Validation):** <br> Controllo biometrico sequenziale (**🤯 Testa**, **👣 Coda**, **🪵 Corpo**) tramite `isValidBlob()` per prevenire attacchi di *☠️ Cache Poisoning*, bloccare file polyglot ed eradicare vettori malevoli (*Anti-PDF Scripting ❌📜*).

- **🛡️📴 Offline Bunker Mode & Emergency Wipe:** <br> In caso di violazione rilevata o 3 tentativi errati di inserimento PIN, il Panzer attiva contromisure distruttive (*Tabula Rasa ☢️*): pialla il `Cache Storage` e il database locale (`indexedDB.deleteDatabase`), isolando il sistema per proteggere il dato sensibile.

- **🔀📡 Architettura di Instradamento a 5 Sezioni (Fetch Strict Layer 🚥):** <br> Ciclo di vita della richiesta compartimentato in perimetri rigidi per superare i capitolati di ispezione AgID (*Normalizzazione, Online Gateway, Cache Hit, Filtro Multimediale, Critical Fallback*).

- **✉️↔️📬 Canale IPC PostMessage:** <br> Ricezione sicura dei comandi dal frontend con isolamento della chiave in RAM tramite `Structured Clone API` e validazione profonda (`universalScanner`).

<br>

### 🔹 2. Client SDK & Dashboard ( `SDK.js` v2.3.7 & `app.js` v2.4.2 )

- **🔏🛡️ PanzerVaultManager & Sblocco Forzato all'Avvio (`initVaultCheck`):** <br> Gestione governativa della sessione client con timer di inattività fissato a 10 minuti (auto-lock della RAM), modale unificato per Setup, Sblocco e Cambio PIN, e trigger automatico all'avvio o post-refresh per eliminare qualsiasi stallo sulla schermata di caricamento.

- **🐺🗄️ Watchdog Integrità Stiva Anti-Wipe:** <br> Sistema di controllo costante sui dati della PWA per impedire che l'interfaccia rimanga attiva se la memoria viene svuotata inaspettatamente dal browser o dal sistema operativo, con popup di ripristino guidato.

- **🐺 Watchdog Anti-Incognito ❌🕵️:** <br> Rilevamento selettivo della navigazione in incognito sui motori Chromium/Blink con timeout adattivo configurabile.

- **🔒 Visore Sandbox Protetto (`openInSandbox`):** <br> Apertura isolata dei documenti tramite `iframe` con policy `sandbox="allow-scripts"`, zoom istantaneo su Blob e **Zeroization preventiva della RAM** (`Uint8Array.fill(0)`) alla chiusura.

- **❄️ Immutabilità & Hardening Client:** <br> Congelamento delle configurazioni e del manifesto in memoria (`Deep Freeze`), sanitizzazione degli input e rendering sicuro del DOM senza `innerHTML` per azzerare i rischi di DOM-based XSS.

- **🎖️ Zero-Dipendenze:** <br> Sviluppato interamente in **🍦 Vanilla JS**, garantendo assenza di debiti tecnici e piena rispondenza all'**Art. 69 del CAD**.

<br>

---

## 🌐 Browser Supportati

| 🌐 Browser | 🔎 Stato | Note Tecniche |
| :--- | :--- | :--- |
| 🌐 **Google Chrome** | Supportato ✅ | Pieno supporto a tutte le feature e Watchdog |
| 🌐 **Chromium** | Supportato ✅ | Pieno supporto (motore JS V8 ⚡) |
| 🧭 **Safari** | **In sperimentazione** ☑️ | Watchdog Anti-Incognito non supportato |
| 🦊 **Firefox** | **Non supportato** ❌ | Limitazioni architetturali sulle API richieste |

<br>

> [!TIP]
> 💡 **Compatibilità estesa:** Il progetto è pienamente compatibile con tutti i browser basati su motore **Chromium (`JS V8` ⚡)**, inclusi **Microsoft Edge, Brave, Opera, Vivaldi e Arc** (incluso il supporto completo al *🐺 Watchdog Anti-Incognito ❌🕵️*).

<br>

---

## 📖 Documentazione Ufficiale

- 🔍🚀 Per l'analisi dettagliata dei vettori crittografici, le metriche forensi di stabilità e gli scenari applicativi per Enti e Pubblica Amministrazione, consulta la **[📚 Wiki Ufficiale del Progetto](https://github.com/zero419-web/Panzer-Core-Framework/wiki)**.

<br>

---

## 👤 Autore

**Valentino Aglianò**

- 📌 **Perito Industriale Informatico** (*2013*)

- 👩‍💻 **Istruttore Informatico:** <br> Qualificatosi *Idoneo nel Concorso Nazionale ASMEL 2025* per **Profili IT della Pubblica Amministrazione**.

- ⚙️🛡️ **Specializzazione:** <br> Ingegneria difensiva, architetture PWA in *Bunker Mode* e cybersecurity applicata (**🟣 Purple Team:** bilanciamento tra mentalità offensiva *Red Team 🔴* e blindatura difensiva *Blue Team 🔵*).

- 🏥 **Production Case Study (*2014 - 2018*) – Sanità Pubblica (*ASP8 SR*):** <br>
  Sviluppo di **APP Gestionale Turnistica Infermieristica** ad altissima affidabilità (zero downtime in ambiente ospedaliero). <br>
  *Security & Stack:* Cifratura *SQLite via DLL*, `💾 Dongle USB Hardware Binding con Auto-Kill su WMI`, RBAC granulare, Engine `AutoIt3 + UI HTML4/CSS/JS + DB SQLite`.

<br>

---

## ⚖️ Licenza

- ⚙️📑 Progetto rilasciato sotto licenza **🇪🇺 EUPL v1.2** (*European Union Public Licence*).

- 📜 La legalità del riuso, la trasparenza del codice e la conformità ai framework normativi dell'Unione Europea sono garantiti. Consulta il file [`LICENSE`](https://github.com/zero419-web/Panzer-Core-Framework?tab=License-1-ov-file#%E2%84%B9%EF%B8%8F--eupl-v12---european-union-public-licence) per i dettagli.

<br>

---

## 📜 Changelog & Storico Versioni

<details>
<summary><strong>⚙️🪖 Espandi Changelog <br> CORE PANZER ( v7.6+ → v7.9.30+ )</strong></summary>

<br>

### 🪖 NOVITÀ v7.9.30+ (`🐛 BUG Fix`)
- 🔬🧬 **Bug fix, scansione ( 🪵 Corpo ) modificata per escludere falsi positivi...**

- 🪳🔑 **Creata Key sessione con scadenza 10min, per argirare il riposo del ServiceWorker dopo 30s.**

- 🪳📥 **Bug fix, Sync Download.**

<br>

### 🪖 NOVITÀ v7.9.16+ ( `🪨🔑 PIN Key Wrapping` ) 

- 🔑🎁 **Key Wrapping Nativo con PBKDF2 :** <br> Introduzione del meccanismo di protezione a riposo della Master Key tramite cifratura AES-GCM (256-bit) derivata dai byte del PIN inserito dall'utente ( *100.000 iterazioni PBKDF2* ).

<br>

### 🪖 NOVITÀ v7.9.11+ ( `🪨 Hardening` ) 

- 🧬🔬 **DNA Forensic** `IsvalidBlob` : migliore, bug fix, Hardening, e sbarramenti per decompressione fino a 50mb di PDF.

- 💉🔰️ **Iniezione chirurgica delle intestazioni di sicurezza prima di servire la risposta al browser, esteso anche alle risorse in cache.**

- 🪳 **Bug fixed generali e minori...**

<br>

### 🪖 NOVITÀ v7.9.9+ ( `🪨 Hardening` )

- 🛡️ **Validazione Forense Estesa al Magazzino (`userCache`) :**
  - Il controllo rigoroso tramite `isValidBlob` è stato esteso simmetricamente anche alle risorse non cifrate estratte dal Magazzino, con eliminazione automatica (`cache.delete`) e rilascio di risposta `404` in caso di file corrotti o manomessi sul disco.

- 🧹 **Bonifica RAM :**
  - Rafforzato l'azzeramento aggressivo con zeri (`fill(0)`) su tutti i buffer binari e sulle copie `.slice()` dedicate alla compatibilità con 🧭 **Safari**, gestito in modo sicuro sia nei flussi di successo che nei blocchi d'errore (`catch`).

- 🧠 **Mitigazione Heap per Stringhe (`TextDecoder`):**
  - Introdotta la nullificazione immediata (`= null`) di tutte le stringhe temporanee generate durante le ispezioni forensi e all'interno dei blocchi `finally`, forzando il rilascio tempestivo dei riferimenti da parte del Garbage Collector di V8.

<br>

### 🪖 NOVITÀ v7.9.8+ (`🪨 Hardening`)

- 🛡️ **Validazione Ingressi IPC rigorosa 🚧 (`validateAndSanitizeAssetPath`):**
  - 🌐 **Same-Origin Check:** Controllo stringente per azzerare qualsiasi rischio di *Server-Side Request Forgery (SSRF)* verso domini esterni.
  - 🛑 **Anti-Path Traversal:** Blocco tassativo e preventivo di sequenze di risalita directory (`../`, `..\`, `\0`).

- 🛑 **Protezione Anti-DoS & Memory Exhaustion:** <br> Introduzione di un tetto massimo rigoroso (`MAX_ALLOWED_ASSETS = 500`) sul numero di risorse accettate dal manifesto e dai core assets.

<br>

### 🪖 NOVITÀ v7.9.7+ (`🐛 BUG Fix`)

- 🪳 **Bug Fixed su Evento Fetch del SW:** <br> Ottimizzazione di *NetWorkFirst*, *SWR (Stale-While-Revalidate)*, *Regolatore di Flusso Polimorfo* e *Universal-Scan*.

- 🖼️🩹 **Gestione Placeholder:** <br> Risolto il comportamento sulle richieste `HEAD` per le risorse immagine (restituisce `404 Error` ❌ invece del placeholder).

- ➕ **🧭 Safari:** <br> Avviato supporto in sperimentazione (escluso il Watchdog Anti-Incognito).

<br>

### 🪖 NOVITÀ v7.9.6+ (`🐛 BUG Fix`)

- 🪳 **Evento Fetch:** <br> Aggiunto calcolo e invio corretto dell'header `Content-Length` nelle risposte servite dal Service Worker.

- 🐺️🐤 **Watchdog di Sicurezza:** <br> Introdotta tolleranza a **3 tentativi** prima di dichiarare compromessa la chiave di cifratura della stiva (`🔑🗄️`).

<br>

### 🪖 NOVITÀ v7.9.5+ (`🐛 BUG Fix`)

- 🚀 **SWR & Reti Degradate:** <br> Strategia migliorata e perfezionamento del *Regolatore di Flusso Polimorfo* per adattarsi dinamicamente alle connessioni instabili.

- 🎯 **Riorganizzazione Fetch:** <br> Ottimizzazione dei flussi *NetworkFirst/SaveBackground*, *SWR* e *CacheFirst (Off-line)*.

<br>

### 🪖 NOVITÀ v7.9+ (`🪨 Hardening contro il Red-Team 🔴`)

- 🔍 **1. Validazione Forense Blob (`isValidBlob`):**
  - 🧹 **SVG & Anti-Polyglot:** Blocco tag ostili (`<script>`, `<iframe>`), event handler inline (`onload=`) e signature di script in immagini raster (`PNG`, `WEBP`, `JPEG`).
  - 📄 **PDF, PAdES & CAdES De-Obfuscated:** Finestra di analisi estesa a **4096 byte** per header e footer (supporto firme digitali e buste `.p7m`), soglia minima a **2 KB**, decodifica esadecimale, strip commenti/spazi, blocco stream compressi (`/flatedecode`, `/lzwdecode`) e isolamento pattern malevoli.
  - 🧠 **RAM Zero-Out:** Bonifica della memoria con `.fill(0)` sui buffer attivi gestita tramite blocchi `finally` sicuri.

- 🧠 **2. Deep Scanner IPC (`universalScanner`):**
  - 🛑 **Cap Nodi & Profilo:** Limite massimo di **999 nodi per albero** e vincolo a **12 livelli** di profondità (*Anti-JSON-Bomb*).
  - 🛡️ **Anti-Path Traversal:** Sanitizzazione e scarto di chiavi e percorsi con risalite directory (`../`, `..\`) o null byte (`\0`).
  - ⚡ **CPU Yielding:** Pausa non-blocking dell'Event Loop ogni 10 nodi per preservare la reattività del thread worker.

- 🔒 **3. Iniezione Security Headers (`injectSecurityHeaders`):** <br> Riscrittura automatica in-flight degli header HTTP (`nosniff`, `DENY`, `strict-origin-when-cross-origin`, `same-origin`) su ogni risposta intercettata.

<br>

### 🪖 NOVITÀ v7.7+ / v7.8+ (`🪨 Hardening Totale`)

- 🔬🧬 **SW Forensics (DNA Check & Binary Validation):** <br> Verifica dei Magic Bytes nei primi 512 byte (*Testa*), controllo terminatore finale via `blob.slice(-5).arrayBuffer()` (*Coda*) e scansione anti-offuscamento del corpo PDF (`/JS`, `/JavaScript`, `/OpenAction`, `/Launch`) con azzeramento memoria (`wipeRAM()`) in caso di fallimento.

<br>

### 🪖 NOVITÀ v7.6+ (`➕ Funzionalità`)

- 🏴‍☠️ **Protocolli Anti-Profiling:** <br> Conversione dei punti di errore in *Black Hole* informatici, sterilizzazione degli stack trace e iniezione di rumore temporale (`💉⏱️`) contro attacchi *side-channel*.

</details>

<br>

<details>
<summary><strong>⚙️📦 Espandi Changelog <br> SDK ( v2.3.8 ) & DASHBOARD APP ( v2.4.2 )</strong></summary>

<br>

### 📣 NOVITÀ SDK v2.3.8 (`🐛 BUG Fix`)

- 🪳🔑 **Bug fix, gestione chiave di sessione, allineata al SW.**

<br>

### 📣 NOVITÀ SDK v2.3.7 & APP v2.4.2 ( `🔄📊 GUI DashBoard & PanzerVaultManager PIN Integration` )

- 🔏🔒 **PanzerVaultManager & Gestione Sessione PIN ( SDK v2.3.7 ) :** <br> Implementazione del gestore di sicurezza per il timer di inattività a 10 minuti (con auto-lock della RAM), il bridge IPC asincrono e la gestione trasparente del wrapping della chiave basato su PIN (`wrapped_master_key`).

- 🛡️ **Risoluzione Stallo Post-Refresh ( `initVaultCheck` & `app.js` v2.4.2 ) :** <br> Ottimizzazione del controllo dello stato del caveau all'avvio: se il sistema rileva che la stiva è configurata ma bloccata dopo un refresh ( `unlocked: false` ), forza l'apertura immediata del modale di sblocco PIN ( `showPinModal('unlock')` ), eliminando lo stallo indefinito sul log *"In attesa dell'avvio del modulo applicativo PA..."*.

<br>

### 📣 NOVITÀ v2.4.0 (`🔄📊 GUI DashBoard`)

- 🔒 **Visore Sandbox Protetto (`openInSandbox`):** *Fix, apertura immediata del visore con loader di attesa del caricamento del PDF rasterizato.*

<br>

### 📣 NOVITÀ v2.3.8 (`🔄📊 GUI DashBoard & Sandbox`)

- 🔒 **Visore Sandbox Protetto (`openInSandbox`):** <br> Isolamento tramite `iframe` (`sandbox="allow-scripts"`) e zoom universale istantaneo su Blob rasterizzato.

- 💻 **Gestione Sicura RAM (`closeSandbox`):** <br> Controllo `!activeRawBuffer.detached` e sanitizzazione Heap con `Uint8Array.fill(0)` prima del rilascio definitivo.

- ❄️ **Deep Freeze:** <br> Configurazioni e manifesto PA congelati in sola lettura all'avvio.

<br>

### 📣 NOVITÀ v2.3.6 (`🐺🗄️ Watchdog & Hardening`)

- 🛡️ **Watchdog Integrità Stiva Anti-Wipe:** <br> Protezione intelligente contro lo svuotamento imprevisto della memoria, resilienza al riavvio e popup di ripristino guidato con un click.

- 🪨 **Hardening GUI DashBoard (`app.js`):** <br> Aggiornamenti di sicurezza sull'interfaccia.

<br>

### 📣 NOVITÀ v2.3.4 (`🪨 Hardening`)

- 🔒 **Immutabilità Totale (`Object.freeze`):** <br> Sigillatura dei modali di blocco (`incognitoBlocker`, `cacheWipeBlocker`, `purgeSuccessBlocker`), dei Core Assets e del payload IPC (`safePayload`).

- 💻 **Dashboard Client Hardening (`app.js`):** <br> Sanitizzazione input di ricerca (`filterQuery`) da caratteri di controllo ASCII e sostituzione di `innerHTML` con `document.createElement` e `textContent` in `renderStorageTable` per prevenire DOM-based XSS.

<br>

### 🪳 Bug Fix v2.3.3 (`app.js`)

- ⚡ Ottimizzazione delle prestazioni visive di `renderStorageTable()` su dispositivi datati tramite `DocumentFragment`.

<br>

### 📣 NOVITÀ v2.3.2 (`➕🔄 Ciclo di Vita & Modali`)

- ⚡ **Controllo Ciclo di Vita:** <br> Aggiunta opzione `autoInit` nel costruttore e metodo pubblico `destroy()` per la pulizia sicura di timer ed event listener.

- 🧱 **Motore Grafico Modale Unificato (`_renderModalBlocker`):** <br> Gestione centralizzata dei modali e ripristino automatico dello scroll.

- 📚 **JSDoc Completo:** <br> Integrazione di `@typedef`, `@param`, `@returns` per supporto IntelliSense negli IDE.

<br>

### 📣 NOVITÀ v2.3 (`➕🔄 Funzionalità`)

- 🐺🗄️ **Watchdog Integrità Stiva:** <br> Monitoraggio periodico della cache con popup personalizzabile per purga volontaria o involontaria.

- 🕵️‍♂️ **Rilevamento Incognito Selettivo:** <br> Controllo mirato esclusivamente su motori Chromium/Blink.

- 🌐🔄 **Gestione Rete Resiliente:** <br> Badge dinamico On-line/Off-line e auto-risincronizzazione della stiva al ritorno della rete.

- 📌🗄️ **Prefisso Cache Parametrico:** <br> Gestione centralizzata (`PA_PANZER_ENGINE_v`).

<br>

### 📣 NOVITÀ v2.1 (`🐛 BUG Fix`)

- 🔧 Fix generali su `SDK.js`, `ServiceWorker.js`, Sandbox Visore, Sync Stiva Bunker e aggiornamento GUI Dashboard (`app.js`).

</details>
