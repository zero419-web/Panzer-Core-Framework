![LOGO](https://img.shields.io/badge/🌀_PANZER_SDK_BETA-v2.x-1f4e79)
![LOGO](https://img.shields.io/badge/PoC-📱_PWA_x_PA-af0000)
![LOGO](https://img.shields.io/badge/File:_📜_ServiceWorker.js_=-_⚙️🪖_FrameWork_CORE_PANZER_v7.9.7+-4f4f00)

# 🏗️ **SDK** <br> ( ⚙️📦 *Software Development Kit* )
> [!Important]
>   - 🔃 **Last Update :** `v2.3.4`
> 
> - 🌀🧪 **E un PoC, `Proof of Concept`**
> 
> ⚙️ **SDK : NOVITÀ, BUG Fix & Altro...**
>
> - **📣 NOVITÀ v2.3.4 :** <br> `🪨 Hardening`
>   - 🔒 **Immutabilità Totale tramite `❄️ Object.freeze` :**
>     - 🛑 Sigillatura completa delle configurazioni dei modali di blocco (`incognitoBlocker`, `cacheWipeBlocker`, `purgeSuccessBlocker`) per prevenire manomissioni a runtime da script terzi o potenziali iniezioni.
>     - 📦 Immutabilità dell'array dei Core Assets (`this.coreAssets`) e del payload IPC in uscita (`safePayload` nel metodo `initDB`).
> ***
> - **🪳 Bug Fix 🔄📊 GUI DashBoard :**
>   - **📜 File :** `app.js` *v2.3.3*
>     - `renderStorageTable()`, ottimizzare le prestazioni visive da non rallentare il browser su dispositivi datati, tramite uso di **DocumentFragment**.
>
> - **📣 NOVITÀ v2.3.2 :** <br> `➕🔄 Funzionalità & aggiornamenti...`
> - ⚡ **Controllo del Ciclo di Vita Avanzato (`autoInit`, `init()`, `destroy()`) :**
>   - ⚙️ Aggiunta dell'opzione `autoInit` (default `true`) nel costruttore per una gestione flessibile dell'istanza.
>
>   - 🛑 Introduzione del metodo pubblico `destroy()` per il rilascio sicuro e pulito delle risorse ( annullamento dei timer `setInterval` e rimozione puntuale di tutti i `window`/`navigator` event listener tramite riferimenti vincolati ).
>
> - 🧱 **Motore Grafico Modale Unificato :**
>    - 🖼️ Centralizzazione del rendering dei modali (`_renderModalBlocker`) con gestione sicura e ripristino automatico dello scroll della pagina (`overflow`).
>
> - 📚 Integrazione di blocchi JSDoc dettagliati (`@typedef`, `@param`, `@returns`) su tutte le opzioni e i metodi per abilitare l'autocompletamento e l'IntelliSense nativo negli IDE moderni ( es. VS Code ).
> ***
> - **📣 NOVITÀ v2.3 :** <br> `➕🔄 Funzionalità & aggiornamenti...`
>    - **🐺🗄️ Watchdog Integrità Stiva ( Cache Wipe ) :**
>       - 🔎 **Monitoraggio periodico della cache con popup di ripristino personalizzabile in caso di cancellazione inaspettata dei dati.**
>
>   - ℹ️ **Popup personalizzabile Se viene fatta la purga volontaria della cache 🗑️🗄️, e pulsante per ricaricare la PWA.**
>
>    - **🕵️‍♂️ Rilevamento Incognito Selettivo :**
>       - 🔎 **Controllo mirato esclusivamente sui motori Chromium/Blink** ( *escludendo nativamente iOS, Safari e Mac Safari* ).
>
>    - **🌐🔄 Gestione Rete Resiliente ( *On-line/Off-line & Auto-Sync* ) :**
>       - ✅ **Sintonizzazione automatica dello stato di connessione con badge dinamico e auto-risincronizzazione della stiva al ritorno della rete.**
>
>    - **📌🗄️ Prefisso Cache Parametrico :**
>       - Gestione centralizzata e parametrica della nomenclatura della stiva (`PA_PANZER_ENGINE_v`).
>
> ***
> - **📣 NOVITÀ v2.1 :** <br> `🐛 BUG Fix`
>    - **🪳 BUG Fix :**
>       - 📜 **`SDK.js`**
>       - 📜 **`ServiceWorker.js` fix for `SDK.js`.**
>       - **🔒👁️‍🗨️ Sandbox Visore ❌💾**
>       - **🛡️🗄️ Sync Stiva Bunker.**
> 
>    - **🔄📊 Aggiornamento GUI DashBoard**
>       - **📜 File :** `app.js, SDK.js`
>
> ***
> - **🐺 Watchdog Anti-Incognito** ❌🕵️ Pre requisiti Install `PWA` & il timeout adattivo dopo `Xsec`, *Minimo / Massimo* personalizzato, ⏱️ Time-out per dichiarare lo stato **🕵️ Incognito del Browser! ✅**
> 
> - **📊 Dashboard :**  
> **🌀 PoC per la PA 🏛️** <br> Un esempio pratico di dashboard sviluppata per la **Pubblica Amministrazione** orientata alla consultazione sicura in modalità *🛡️ Bunker.*
>
<h2 align="center">
 <a href="https://zero419-web.github.io/Panzer-Core-Framework/">
  <strong>
    👁️‍🗨️ SDK DEMO
  </br>
    ➡️ On-line 🌐
  </strong>
 </a>
</h2>

---
![LOGO](https://img.shields.io/badge/Logo-CORE_PANZER_v7.x+-1f4e79)
<p align="center"><img src="https://raw.githubusercontent.com/zero419-web/Panzer-Core-Framework/main/sw_logo.svg" width="200" alt="Core Logo - Panzer v7.x+"></p>

---

# 🌐 Browser Supportati !
| 🌐 Browser | 🔎 Stato |
| :--- | :--- |
| 🌐 Google Chrome |  Supportato ✅ |
| 🌐 Chromium |  Supportato ✅ |
| 🧭 Safari | **Supportato - non testato** ☑️ |
| 🦊 FireFox | **Non supportato** ❌ |

> [!TIP]
> 💡 **Nota:** Progetto pienamente compatibile con altri `Browser` :
> 
> ⚙️🌐 Motore di **Chromium : `js V8` ⚡**
>
> `Es. Edge, Brave, Opera, Vivaldi, Arc `.
> - ✅ **Supporto :**
>    - 🐺 *Watchdog Anti-Incognito* ❌🕵️
---
## 🚀 Obiettivi del Progetto :

- 🌀 **Proof of Concept :** <br> ( *PoC* ) di un'architettura software sovrana per <br>Progressive Web App ( 📲 **PWA** ) basata sul **⚙️🪖 Core Panzer v7.x+**, progettata in modalità *🔐 Zero-Trust*. Il sistema garantisce **massima resilienza informatica**, continuità operativa offline-first, consultazione protetta di atti e documenti PA, e piena conformità alle linee guida tecniche 📑 **AgID** e al **📜 Codice dell'Amministrazione Digitale** ( *CAD* ) per il riuso ( *🇪🇺 EUPL v1.2* ).

- ⚙️ Questo engine implementa strategie avanzate di computazione asincrona isolata, crittografia simmetrica client-side e tolleranza ai guasti di tipo militare. Garantisce che le applicazioni web e i dati sensibili rimangano protetti e operativi anche in condizioni di rete degradata ( Lie-Fi 🤥🛜 ), o assente, in caso di tentativi di manomissione fisica o data breach sul file system locale del client tutti i file verrano eliminati per sicurezza e risoncronizari di nuovo col server della PA.

> [!NOTE]
> 💡 **La demo live serve per provare immediatamente: la Resilienza, la Modalità Bunker 🗄️, il Lie-Fi 🤥🛜 , il Download 📥 simultanio delle Risorse dal Manifesto...** `ecc...`
> 
---
## 📣⚙️🪖 NOVITÀ & BUG Fix & Altro...
- **🪖 NOVITÀ v7.9.8+ :** <br> `🪨 Hardening`
    - 🛡️ **Validazione Ingressi IPC rigorosa (`validateAndSanitizeAssetPath`) :**
       - 🌐 **Same-Origin Check:** Controllo stringente per azzerare qualsiasi rischio di Server-Side Request Forgery ( *SSRF* ) verso domini esterni.
       - 🛑 **Anti-Path Traversal:** Blocco tassativo e preventivo di sequenze di risalita directory (`../`, `..\`, `\0`).

    - 🛑 **Protezione Anti-DoS & Memory Exhaustion :**
       - Introduzione di un tetto massimo rigoroso (`MAX_ALLOWED_ASSETS = 500`) sul numero di risorse accettate dal manifesto e dai core assets.

    - 💻 **Dashboard Client Hardening (`app.js`) :**
       - 🧹 **Sanitizzazione Input di Ricerca:** Pulizia attiva della stringa `filterQuery` mediante rimozione di caratteri di controllo ASCII invisibili (`[\u0000-\u001F\u007F-\u009F]`).

       - 🔒 **Rendering Tabella Sicuro (`renderStorageTable`):** Sostituzione dell'interpolazione `innerHTML` con elementi DOM nativi (`document.createElement`) e `textContent` per eliminare alla radice ogni rischio di DOM-based XSS, mantenendo inalterate le performance del `DocumentFragment`.

- **🪖 NOVITÀ v7.9.7+ :** <br> `🐛 BUG Fix`
    - 🪳 **Bug Fixed : `Evento Fetch` Del SW ( ⚙️🪖 ),**
       - 🌐 **NetWorkFirst**
       - 🚀 **SWR - `Stale-While-Revalidate`**
       - 🔀🎭 **Regolatore di Flusso Polimorfo**
       - 🖼️🩹 **Placeholder, non Ritorna per una risorsa Immagine su una richiesta HEAD, ma restituisce un `404 Error` ❌**
       - 🧠 **Universal-Scan, Fix bug's**
    
    - ➕ **🧭 `Safari`, Supporto in sperimentazione ...**
       - 🧭🚫🐺 **Watchdog `Anti-Incognito` ❌🕵️ non `Supportato`**

- **🪖 NOVITÀ v7.9.6+ :** <br> `🐛 BUG Fix`
    - 🪳 **Bug Fixed : `Evento Fetch` Del SW ( ⚙️🪖 ),**
       - ➕ **`Content-Length`, risposta del `SW` alle Risorse da servire al Browser.**

    - 🐺️🐤 **WATCHDOG DI SICUREZZA :**
       - ➕ **Controllo, 3 tentativi prima di dichiarare se la 🔑🗄️ di cifratura e compromessa veramente.**
 
- **🪖 NOVITÀ v7.9.5+ :** <br> `🐛 BUG Fix`
   - 🪳 **Molti Bug Fixed !**
      - 🚀 **SWR, Strategia migliorata su reti degradate.**
      - 🔀🎭 **Fix: `Regolatore di Flusso Polimorfo`, ora si adatta alle reti degradate e decide la strategia migliore.**
      - 🎯 **Riorganizzazione Del `Evento Fetch` Del SW ( ⚙️🪖 ), Per Il `NetworkFirst/SaveBackground, SWR, CacheFirst ( Off-line )`**
 
- **🪖 NOVITÀ v7.9+ :** <br> `🪨 Hardening contro il Red-Team 🔴`
   - 🔍 **1. Validazione Forense Blob (`isValidBlob`)**
       - 🧹 **SVG & Anti-Polyglot:** Blocco tag ostili (`<script>`, `<iframe>`), event handler inline (`onload=`) e signature di script in immagini raster (es. `PNG`, `WEBP`, `JPEG`).
       - 📄 **PDF, PAdES & CAdES De-Obfuscated:** Finestra di analisi estesa a **4096 byte** per header e footer (per tollerare firme digitali, aggiornamenti incrementali e buste crittografiche `.p7m`), soglia minima a **2 KB** (`2048` byte), decodifica esadecimale, strip commenti/spazi, blocco stream compressi (`/flatedecode`, `/lzwdecode`, ecc.) e isolamento pattern malevoli da `CONFIG.pdf`.
       - 🧠 **RAM Zero-Out:** Bonifica della memoria con `.fill(0)` sui buffer attivi gestita tramite blocchi `finally` sicuri subito dopo l'analisi o in caso di eccezione.

   - 🧠 **2. Deep Scanner IPC (`universalScanner`):**
       - 🛑 **Cap Nodi & Profilo:** Limite massimo di **999 nodi per albero** e vincolo tassativo a **12 livelli** di profondità ( *Anti-JSON-Bomb* ).
       - 🛡️ **Anti-Path Traversal:** Sanitizzazione e scarto di chiavi e percorsi con risalite directory (`../`, `..\`) o null byte (`\0`).
       - ⚡ **CPU Yielding:** Pausa non-blocking dell'Event Loop ogni 10 nodi per preservare la reattività del thread worker.

   - 🔒 **3. Iniezione Security Headers (`injectSecurityHeaders`):**
       - 🌐 **Fetch Response Hardening:** Riscrittura automatica in-flight degli header HTTP (`nosniff`, `DENY`, `strict-origin-when-cross-origin`, `same-origin`) su ogni risposta intercettata.

- **🪖 NOVITÀ v7.8+ :** <br> `🪨 Hardening TOTALE contro il Red-Team 🔴`

- **🪖 NOVITÀ v7.7+ :** <br> `🪨 Hardening contro il Red-Team 🔴`
   - 🔬🧬 **SW Forensics ( DNA Check & Binary Validation ), in isValidBlob() :**
     - 🤯 **Testa ( Header 512 Byte ) :** <br> Analisi dei primi 512 byte del file per la verifica stringente dei Magic Bytes reali, bloccando sul nascere lo spoofing del MIME-type e le estensioni camuffate.
     - 👣 **Coda ( Tail Check ) :** <br> Test di lettura a basso livello sul terminatore finale via `blob.slice(-5).arrayBuffer()` per escludere troncamenti, file corrotti o stream incompleti.
     - 🪵 **Corpo & Anti-PDF Obfuscation ( ❌📜 ) :** Scansione dei payload PDF con supporto alla decodifica di tecniche di offuscamento (`stringhe esadecimali/ottali, annotazioni annidate, flussi encodati`) ed eradicazione di vettori malevoli (`/JS, /JavaScript, /OpenAction, /Launch`). <br>
**✅ Risultato :** <br> Neutralizza il Cache Poisoning ☠️, azzera i crash silenziosi del Service Worker dovuti a eccezioni di lettura e forza l'azzeramento della memoria di lavoro ( *wipeRAM()* 🧽 ) in caso di fallimento o abort dell'operazione.

  - **🪖 NOVITÀ v7.6+ :** <br> `➕ Funzionalità...`
     - **Integrazione di protocolli 🏴‍☠️ Anti-Profiling :** <br>Ogni punto di errore è stato convertito in un " 🕳️ *Black Hole* " informativo; la **sterilizzazione degli stack trace e l'iniezione di rumore temporale 💉⏱️** previene attacchi di tipo *side-channel* e la profilazione del **🏴‍☠️🔴 Red Team.**

***

## 🛠️ Caratteristiche :<br>( ⚙️🪖 v7.x+ )
🔹💜 Il cuore del sistema è un **Service Worker** ( `ServiceWorker.js` ) ad altissima specializzazione, operante come entità autonoma tramite i seguenti moduli nativi :

- **🔐🌡️🛡️ Jittered Thermal Shield Race :** <br> Ispezione forense profonda sul modulo `deepVaultValidation()`. Implementa una gara asincrona tra l'interrogazione a IndexedDB e lo **🌡️🛡️ Scudo Termico Adattivo** ( `waitTillIdle` ).

- **🔄🌐🛡️🔗 Dynamic Adaptive Network Resiliency :** <br> Algoritmo proprietario che adatta dinamicamente i timeout di rete basandosi su 5 profili telemetrici hardware di velocità della connessione.

- **🌐➡️💾 Network-First Predittivo con Cache Fallback :** <br> Intercettazione condizionale degli eventi di fetch con abort atomico delle richieste in caso di latenza degradata e rilascio immediato della risorsa cifrata locale.

- **🔬🧬 SW Forensics ( DNA Check & Binary Validation ) :** <br> Controllo biometrico sequenziale ( 🤯 Testa, 👣 Coda, 🪵 Corpo ) per prevenire attacchi di ☠️ *Cache Poisoning* ed eradicare vettori malevoli ( Anti-PDF Scripting ❌📜 ).

- **🛡️📴 Offline Bunker Mode & Emergency Wipe :** <br> In caso di violazione rilevata, il Panzer attiva contromisure distruttive ( *Tabula Rasa* ☢️ ): pialla il `Cache Storage` e il database locale ( `indexedDB.deleteDatabase` ), isolando il sistema per proteggere il dato sensibile.

- **🔀📡 Architettura di Instradamento a 5 Sezioni ( Fetch Strict Layer 🚥 ) :** <br> Ciclo di vita della richiesta compartimentato in perimetri rigidi per superare i capitolati di ispezione AgID ( `Normalizzazione, Online Gateway, Cache Hit, Filtro Multimediale, Critical Fallback` ).

- **✉️↔️📬 Canale IPC PostMessage :** <br> Ricezione sicura dei comandi dal frontend con isolamento della chiave in RAM tramite `Structured Clone API`.

- **🎖️ Conformità Costituzionale e Normativa PA:** <br> Sviluppato interamente in **🍦 Vanilla JS** ( *Zero-Dipendenze* ), garantendo assenza di debiti tecnici e rispondenza all'**Art. 69 del CAD**.

---
## 👤 Autore : <br> **Valentino Aglianò**
- 📌 Perito Industriale <br> **Informatico** ( *2013* )

- 🏥 Production Case Study <br> ( *2014 - 2018* )<br> Sanità Pubblica ( *ASP8 SR* ).<br>
**📲 APP Gestionale Turnistica Infermieristica :**
   - 🛡️ **Security:** <br> Cifratura *SQLite via DLL*, `💾 Dongle USB Hardware Binding con Auto-Kill su WMI`, 🍇 RBAC granulare.

   - ⚡🔋 **Stack:** <br> Engine `AutoIt3 + UI HTML4/CSS/JS + DB SQLite`.

   - 📊 **Reliability:** <br> Operatività ininterrotta senza downtime sul campo in ambiente ospedaliero.

- 👩‍💻 Istruttore Informatico: <br> Qualificatosi *Idoneo nel Concorso Nazionale ASMEL 2025* per **Profili IT della Pubblica Amministrazione.**

- ⚙️🛡️ Specialista in ingegneria difensiva, architetture PWA in Bunker Mode e cyber security applicata <br> ( 🟣 Purple Team: bilanciamento tra mentalità offensiva Red team 🔴, e blindatura il Blue Team 🔵 ).

---
## ⚖️ Licenza :
- ⚙️📑 Progetto rilasciato sotto licenza **🇪🇺 EUPL v1.2**. <br> La legalità del riuso, la trasparenza del codice e la conformità ai framework normativi dell'Unione Europea sono garantiti. Consulta il file [`LICENSE`](https://github.com/zero419-web/Panzer-Core-Framework?tab=License-1-ov-file#%E2%84%B9%EF%B8%8F--eupl-v12---european-union-public-licence).

---
## 📖 Documentazione Ufficiale :
- 🔍🚀 Per l'analisi dei vettori crittografici, le metriche forensi di stabilità e gli scenari applicativi per Enti e Pubblica Amministrazione, consulta la nostra [📚 Wiki Ufficiale](https://github.com/zero419-web/Panzer-Core-Framework/wiki).
