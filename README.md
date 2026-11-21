<p align="center">
  <img src="https://raw.githubusercontent.com/zero419-web/Panzer-Core-Framework/main/sw_logo.svg" width="180" alt="Core Logo - Panzer v7.x+">
</p>

<h1 align="center">🏗️ PANZER SDK & CORE FRAMEWORK</h1>

<p align="center">
  <img src="https://img.shields.io/badge/🌀_PANZER_SDK-v2.3.8.1-1f4e79" alt="SDK Badge">
  <img src="https://img.shields.io/badge/📊_PANZER_APP-v2.4.3.1-2563eb" alt="App Badge">
  <img src="https://img.shields.io/badge/⚙️🪖_CORE_PANZER-v7.9.40+-4f4f00" alt="Core Badge">
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
> 💡 **La demo live permette di testare immediatamente:** la Resilienza di rete, la Modalità Bunker 🗄️, la simulazione Lie-Fi 🤥🛜, lo sblocco tramite **PIN o WebAuthn PRF / Passkey** 🔐🧬 e il Download 📥 simultaneo delle risorse dal Manifesto.

<br>

---

## 🚀 Obiettivi del Progetto

- 🌀 **Proof of Concept (PoC):** <br> Architettura software sovrana per **Progressive Web App (📲 PWA)** basata sul **⚙️🪖 Core Panzer v7.9.40+**, il client **PanzerSDK v2.3.8.1** e la Dashboard **App Controller v2.4.3.1**, progettata in modalità *🔐 Zero-Trust*.

- 🏛️ **Conformità Istituzionale:** <br> Il sistema garantisce **massima resilienza informatica**, continuità operativa *offline-first*, consultazione protetta di atti e documenti della **Pubblica Amministrazione (PA)**, nel pieno rispetto delle linee guida tecniche 📑 **AgID** e del **📜 Codice dell'Amministrazione Digitale (CAD)** per il riuso (*🇪🇺 EUPL v1.2*).

- ⚙️ **Difesa Attiva & Tolleranza ai Guasti:** <br> Implementa strategie avanzate di computazione asincrona isolata, crittografia simmetrica client-side (`AES-GCM 256-bit`) con Key Wrapping basato su PIN (`PBKDF2` + `SHA-256`) o Passkey (`WebAuthn PRF` + `HKDF-SHA256`) e tolleranza ai guasti di tipo militare. Garantisce che i dati sensibili rimangano protetti anche su reti degradate (*Lie-Fi 🤥🛜*) o assenti. In caso di manomissione o *data breach* sul file system locale del client, vengono attivate contromisure distruttive di sicurezza e risincronizzazione.

<br>

---

## 🛠️ Architettura e Caratteristiche Principali

Il sistema si compone di due livelli perfettamente integrati: il **Service Worker (`ServiceWorker.js` - `v7.9.40+`)** che agisce come entità autonoma di difesa, e l'**SDK & Dashboard Client (`SDK.js` `v2.3.8.1` / `app.js` `v2.4.3.1`)** che gestisce l'interfaccia, la memoria, i flussi PIN/Passkey PRF e i meccanismi di blocco con gestione avanzata del caveau cifrato.

<br>

### 🔹 1. Core Engine ( `ServiceWorker.js` - v7.9.40+ )

- **🔐🔑 Pin-Protected & PRF Key Wrapping (`PBKDF2` / `HKDF` + `AES-GCM 256-bit`):** <br> La Master Key è protetta a riposo su IndexedDB (`PWA_Vault`) tramite `wrapped_master_key` derivato dal PIN (`100.000 iterazioni PBKDF2, SHA-256`) e supporta l'associazione opzionale di una credenziale **WebAuthn PRF** (`prf_wrapped_master_key` derivata via `HKDF-SHA256` con dominio `PANZER_WEBAUTHN_PRF_KEK_V1` e salt casuale).

- **⏳🔑 Session Key Store con TTL (`sessionKeyStore`):** <br> Stiva temporanea cifrata in IndexedDB con scadenza a 10 minuti (`SESSION_TTL_MS = 600.000 ms`) per preservare in sicurezza la chiave di sessione anche durante la sospensione/ibernazione del Service Worker senza estendere la durata della sessione.

- **🔐🌡️🛡️ Jittered Thermal Shield Race:** <br> Ispezione forense profonda sul modulo `deepVaultValidation()` con gara asincrona tra lettura del caveau e **Scudo Termico Adattivo** (`waitTillIdle`) per distinguere saturazione CPU/I/O da manomissioni reali.

- **🔄🌐🛡️🔗 Dynamic Adaptive Network Resiliency:** <br> Algoritmo proprietario che adatta dinamicamente i timeout e il parallelismo di rete basandosi su 5 profili telemetrici (`Ultrafast`, `Fast`, `Medium`, `Low`, `Verylow`) e controllo reale della connettività (`checkRealOnline`).

- **🌐➡️💾 Network-First Predittivo con Cache Fallback & SWR:** <br> Intercettazione condizionale degli eventi di `fetch` con abort atomico (`AbortController` / `AbortSignal.any`) in caso di latenza degradata o interruzione sync e rilascio immediato della risorsa locale.

- **🔬🧬 SW Forensics (DNA Check & Binary Validation - v5.0):** <br> Controllo sequenziale su tre scomparti (**🤯 Testa**, **👣 Coda**, **🪵 Corpo**) tramite `isValidBlob()` per prevenire attacchi di *☠️ Cache Poisoning*, bloccare file polyglot (`SVG`, `PNG`, `WEBP`, `JPEG`, `AVIF`), ispezionare `PDF` / `PAdES` / `CAdES` (anche su stream compressi `/flatedecode` fino a 50 MB) e bonificare la RAM (`fill(0)`).

- **🛡️📴 Offline Bunker Mode, Canary Loopback & Emergency Wipe:** <br> Verifica tramite test canarino (`CONFIG.vaultCanaryText`), tolleranza ai fallimenti temporanei e, in caso di violazione confermata o 3 tentativi errati di PIN, attivazione della distruzione totale (*Tabula Rasa ☢️*): azzeramento chiavi in RAM, cancellazione di `Cache Storage` e `indexedDB.deleteDatabase("PWA_Vault")`.

- **🔀📡 Architettura di Instradamento & Security Headers (`injectSecurityHeaders`):** <br> Instradamento compartimentato su `mainCache` (`Bunker` cifrato) e `userCache` (`Magazzino` con TTL), con iniezione automatica delle intestazioni HTTP difensive (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Cross-Origin-Resource-Policy: same-origin`, `X-XSS-Protection`).

- **✉️↔️📬 Canale IPC PostMessage Hardened:** <br> Origin guard, lista esplicita dei comandi autorizzati (`INIT_DB`, `LOCK_VAULT`, `SUBMIT_PIN`, `CHANGE_PIN`, `CHECK_VAULT_STATUS`, `GET_PRF_CONFIG`, `UNLOCK_PRF`, `REGISTER_PRF`), `validateAndSanitizeAssetPath` (anti-SSRF e anti-path traversal), limite `MAX_ALLOWED_ASSETS = 500` e `universalScanner` (`MAX_NODES_LIMIT = 999`, profondità max 12).

<br>

### 🔹 2. Client SDK & Dashboard ( `SDK.js` v2.3.8.1 & `app.js` v2.4.3.1 )

- **🔏🛡️ PanzerVaultManager & Sblocco all'Avvio (`initVaultCheck`):** <br> Gestione del timer di inattività di 10 minuti con auto-lock della RAM, controllo di sessione per scheda (`panzer_tab_active`), modale grafico unificato (`showPinModal`) per `setup`, `unlock`, `change` e `register-prf`, e sblocco immediato all'avvio o dopo refresh.

- **🔐🧬 WebAuthn PRF con Catena di Fallback Multilivello:** <br> `registerPrfCredential` esegue la registrazione con bonifica dei buffer sensibili in RAM e fallback progressivo (`platform` con PRF → authenticator esterno/roaming `USB/NFC/QR` con PRF → esterno senza PRF in fase di creazione), mentre `unlockVaultWithFallback` tenta lo sblocco con Passkey/Biometria e ripiega in modo trasparente sul PIN senza bruciare i tentativi PIN.

- **🐺🗄️ Watchdog Integrità Stiva Anti-Wipe:** <br> Controllo periodico (ogni 5 secondi e al ritorno in primo piano) su `PWA_Vault` e `Cache Storage` con tolleranza a 3 tentativi e modale di ripristino guidato.

- **🐺 Watchdog Anti-Incognito ❌🕵️:** <br> Rilevamento selettivo della navigazione in incognito o sandbox restrittive sui motori Chromium/Blink con timeout adattivo.

- **🔒 Visore Sandbox Protetto (`openInSandbox` & `closeSandbox`):** <br> Apertura isolata dei documenti tramite `iframe` (`sandbox="allow-scripts"`), rendering rasterizzato delle pagine PDF tramite `pdfjsLib`, zoom regolabile e **Zeroization preventiva della RAM** (`Uint8Array.fill(0)`) alla chiusura.

- **❄️ Immutabilità & Hardening Client:** <br> Sigillatura delle configurazioni e del manifesto in memoria (`Object.freeze` / `deepFreeze`), sanitizzazione dei filtri di ricerca e rendering tabellare tramite `DocumentFragment` e `textContent`.

- **🎖️ Zero-Dipendenze:** <br> Sviluppato interamente in **🍦 Vanilla JS**, senza framework esterni e allineato ai principi di riuso dell'**Art. 69 del CAD**.

<br>

---

## 🌐 Browser Supportati

| 🌐 Browser | 🔎 Stato | Note Tecniche |
| :--- | :--- | :--- |
| 🌐 **Google Chrome** | Supportato ✅ | Pieno supporto a tutte le feature, Watchdog e WebAuthn PRF |
| 🌐 **Chromium** | Supportato ✅ | Pieno supporto (motore JS V8 ⚡) |
| 🧭 **Safari** | **In sperimentazione** ☑️ | Watchdog Anti-Incognito non supportato; gestione buffer/slice dedicata |
| 🦊 **Firefox** | **Non supportato** ❌ | Limitazioni architetturali sulle API richieste |

<br>

> [!TIP]
> 💡 **Compatibilità estesa:** Il progetto è compatibile con i browser basati su motore **Chromium (`JS V8` ⚡)**, inclusi **Microsoft Edge, Brave, Opera, Vivaldi e Arc** (incluso il supporto al *🐺 Watchdog Anti-Incognito ❌🕵️*).

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
<summary><strong>⚙️🪖 Espandi Changelog <br> CORE PANZER ( v7.6+ → v7.9.40+ )</strong></summary>

<br>

### 🪖 NOVITÀ v7.9.40+ (`🔐🧬 WebAuthn PRF Vault & Hardening`)
- 🔐🧬 **Supporto WebAuthn PRF nel Caveau:** <br> Introdotti i comandi IPC `GET_PRF_CONFIG`, `UNLOCK_PRF` e `REGISTER_PRF` con derivazione KEK tramite `HKDF-SHA256` (`deriveKeyFromPrfBytes`), wrapping dedicato della Master Key (`wrapMasterKeyWithPrf`), verifica canarino e bonifica sistematica di tutti i buffer sensibili in RAM.

- ⏳🔑 **Persistenza Chiave di Sessione con TTL (`sessionKeyStore`):** <br> Rafforzato il salvataggio e il ripristino della chiave di sessione (`SESSION_TTL_MS = 10 min`) in IndexedDB tramite chiave simmetrica dedicata con azzeramento dei buffer grezzi.

- 🛡️🔬 **DNA Check Post-Decrittazione & Bonifica:** <br> Aggiunta la verifica forense sul plaintext decifrato estratto dal Bunker (`VAULT_PLAINTEXT_DNA_CORRUPTED`) e il reset dello stato/sessione nelle routine di emergenza (`Destroy_ALL_Caches`).

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
<summary><strong>⚙️📦 Espandi Changelog <br> SDK ( v2.3.8.1 ) & DASHBOARD APP ( v2.4.3.1 )</strong></summary>

<br>

### 📣 NOVITÀ SDK v2.3.8.1 & APP v2.4.3.1 (`🔐🧬 WebAuthn PRF & Fallback Multilivello`)

- 🔐🧬 **Sblocco e Registrazione WebAuthn PRF (`SDK v2.3.8.1`):** <br> Aggiunti in `PanzerVaultManager` i metodi `canUsePrf()`, `_getPrfConfigFromSW()`, `_sendPrfUnlockToSW()`, `unlockVaultWithFallback()` e `registerPrfCredential()` con fallback automatico su authenticator esterni (`USB/NFC/QR`), gestione dei casi senza `prf` in creazione, ripiego sicuro sul PIN e bonifica dei buffer in RAM.

- 🎛️ **UI Passkey / Biometria & Gestione Scheda (`APP v2.4.3.1`):** <br> Aggiornato `showPinModal` con la modalità `register-prf`, il pulsante di sblocco rapido via Passkey/Biometria nella schermata `unlock`, il flusso post-setup per associare una Passkey e il controllo del ciclo di vita scheda (`panzer_tab_active` e blocco su `beforeunload`).

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
