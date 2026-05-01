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


## 🤔 What is MySpeed?

MySpeed is a speed test analysis software that records your internet speed for up to 30 days.

### ⭐ Features

- 📊 MySpeed generates clear statistics on speed, ping, and more
- ⏰ MySpeed automates speed tests and allows you to set the time between tests using Cron expressions
- 🗄️ Add multiple servers directly to a MySpeed instance
- 🩺 Configure health checks to notify you via email, Signal, WhatsApp, or Telegram in case of errors or downtime
- 📆 Test results can be stored for up to 30 days
- 🔥 Support for Prometheus and Grafana
- 🗳️ Choose between Ookla, LibreSpeed and Cloudflare speed test servers
- 💁 Learn more about MySpeed on our [website](https://myspeed.dev)

### ⬇️ Installation

- **🐧 Guide for [Linux](https://docs.myspeed.dev/setup/linux)**
- **🪟 Guide for [Windows](https://docs.myspeed.dev/setup/windows)**

### 🍎 macOS Support

- MySpeed can now start on macOS for local development and source-based setups.
- The macOS startup path now includes code-path support for both Apple Silicon and Intel Macs when using the built-in Ookla CLI bootstrap.
- If you run from source, start the app with `deno task dev` or `deno run --allow-all server/index.js` from the repository root.
- The one-click installation guides above are still Linux and Windows focused.

### 📸 Example Screenshots

#### Homepage (List View)

<img src="https://i.imgur.com/NHX7Ba9.png" alt="Homepage">

#### Homepage (Statistics View)
<img src="https://i.imgur.com/5JAFgrk.png" alt="Statistics">

#### Server Selection

<img src="https://i.imgur.com/hgOR93G.png" alt="Server Selection">

#### Dropdown Menu

<img src="https://i.imgur.com/alKEMrg.png" alt="Dropdown Menu">

#### Page During a Speed Test

<img src="https://i.imgur.com/kxsrjIe.png" alt="Page During a Speed Test">

## Convinced?

Great, let's get started! You can find the installation instructions for Linux and Windows at the top under Installation, and the macOS source-based startup note right above.

## License

Distributed under the MIT license. See `LICENSE` for more information.

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
