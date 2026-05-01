[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Release][release-shield]][release-url]

<br />
<div align="center">
  <a href="https://github.com/gnmyt/myspeed">
    <img src="https://i.imgur.com/aCmA6rH.png" alt="Logo" width="80" height="80">
  </a>
  <h3>MySpeed <a href="README.de.md">🇩🇪</a> <a href="README.md">🇺🇸</a></h3>
</div>


## 🤔 Was ist MySpeed?

MySpeed ist eine Speedtest-Analyse-Software, welche die Geschwindigkeit deines Internets bis zu 30 Tage lang speichert.

### ⭐ Features

- 📊 MySpeed generiert übersichtliche Statistiken über Geschwindigkeit, Ping und mehr
- ⏰ MySpeed automatisiert Speedtests und lässt dich mithilfe von Cron-Expressions die Zeit zwischen den Tests festlegen
- 🗄️ Füge mehrere Server direkt zu einer MySpeed-Instanz hinzu
- 🩺 Es lassen sich Healthchecks konfigurieren, welche dich bei Fehlern oder Ausfällen über E-Mail, Signal, WhatsApp oder Telegram benachrichtigen können
- 📆 Testergebnisse lassen sich bis zu 30 Tage lang speichern
- 🔥 Unterstützung für Prometheus und Grafana
- 🗳️ Wähle zwischen Ookla, LibreSpeed und Cloudflare Speedtest-Servern
- 💁 Erfahre mehr zu MySpeed auf unserer [Website](https://myspeed.dev)

### ⬇️ Installation

- **🐧 Anleitung für [Linux](https://docs.myspeed.dev/setup/linux)**
- **🪟 Anleitung für [Windows](https://docs.myspeed.dev/setup/windows)**

### 🍎 macOS-Unterstützung

- MySpeed laesst sich jetzt unter macOS fuer lokale Entwicklung und beim Start aus dem Quellcode erfolgreich ausfuehren.
- Der macOS-Startpfad beruecksichtigt jetzt sowohl Apple Silicon als auch Intel Macs bei Nutzung des integrierten Ookla-CLI-Bootstraps.
- Wenn du aus dem Quellcode startest, verwende `deno task dev` oder `deno run --allow-all server/index.js` im Repository-Root.
- Die Installationsanleitungen oben bleiben weiterhin auf Linux und Windows fokussiert.

### 📸 Beispiel-Screenshots

#### Startseite (Listen-Ansicht)

<img src="https://i.imgur.com/XXDLXVX.png" alt="Startseite">

#### Startseite (Statistik-Ansicht)
<img src="https://i.imgur.com/nNaTJTe.png" alt="Statistik">

#### Serverauswahl

<img src="https://i.imgur.com/gZnGSJb.png" alt="Serverauswahl">

#### Auswahl-Menü

<img src="https://i.imgur.com/zCzTJ53.png" alt="Auswahl-Menü">

#### Seite während eines Speedtests

<img src="https://i.imgur.com/RccxiUb.png" alt="Seite während eines Speedtests">

## Überzeugt?

Cool, dann lass uns loslegen! Die Installationsanleitungen fuer Linux und Windows findest du oben unter Installation, den Hinweis zum Start unter macOS aus dem Quellcode direkt darueber.

## Lizenz

Verbreitet unter der MIT-Lizenz. Siehe `LICENSE` für weitere Informationen.

[contributors-shield]: https://img.shields.io/github/contributors/gnmyt/myspeed.svg?style=for-the-badge

[contributors-url]: https://github.com/gnmyt/myspeed/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/gnmyt/myspeed.svg?style=for-the-badge

[forks-url]: https://github.com/gnmyt/myspeed/network/members

[stars-shield]: https://img.shields.io/github/stars/gnmyt/myspeed.svg?style=for-the-badge

[stars-url]: https://github.com/gnmyt/myspeed/stargazers

[issues-shield]: https://img.shields.io/github/issues/gnmyt/myspeed.svg?style=for-the-badge

[issues-url]: https://github.com/gnmyt/myspeed/issues

[license-shield]: https://img.shields.io/github/license/gnmyt/myspeed.svg?style=for-the-badge

[license-url]: https://github.com/gnmyt/myspeed/blob/master/LICENSE

[release-shield]: https://img.shields.io/github/v/release/gnmyt/myspeed.svg?style=for-the-badge

[release-url]: https://github.com/gnmyt/myspeed/releases/latest
