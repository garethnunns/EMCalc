# EM Calc

<img src="assets/icon-squircle.png" alt="EM Calc logo" width="80" align="left">

### Barco Event Master Custom Format Calculator
[![Test](https://github.com/garethnunns/EMCalc/actions/workflows/commit.yml/badge.svg)](https://github.com/garethnunns/EMCalc/actions/workflows/commit.yml) [![Release](https://img.shields.io/github/v/release/garethnunns/EMCalc)](https://github.com/garethnunns/EMCalc/releases/latest) [![Downloads](https://img.shields.io/github/downloads/garethnunns/EMCalc/total)](https://github.com/garethnunns/EMCalc/releases) [![Web app](https://img.shields.io/badge/web%20app-e2.garethnunns.com-blue)](https://e2.garethnunns.com) [![License: MIT](https://img.shields.io/github/license/garethnunns/EMCalc)](LICENSE)

<br clear="left">

![EM Calc on a desktop, with the format settings beside the EDID timing](README/Desktop.png)

![EM Calc on a phone, showing the format settings and results](README/Phone-1.png) | ![EM Calc on a phone, showing which inputs support the format, including SDI](README/Phone-2.png)
:---:|:---:

This tool is designed to help calculate custom formats for the Barco 
Event Master range of products. This isn't a Barco product and 
there's no gaurantee it'll work.

The logic is largely based from the
[spreadsheet](https://www.facebook.com/groups/Barcofolsom/permalink/2524750314238262/)
created by Graham Loveridge, Syed Athar Hussain & Scott Gershick.

Each format can also be downloaded as an EDID file, to load into whatever's
sending it (e.g. BetterDisplay on a Mac, Custom Resolution Utility on Windows,
or an EDID emulator). Formats too big for a standard EDID timing, like those
over 4096 wide, are added in a DisplayID block.

# Run

Download the latest version for your platform on the 
[releases page](https://github.com/garethnunns/EMCalc/releases)
or use the [web version](https://e2.garethnunns.com).

It's written with [React Native](https://github.com/facebook/react-native) and 
[Expo](https://expo.io/) so native Android and iOS apps could be created if
there's demand, in the mean time, it's a PWA so you can add it to your home
screen and it will still work offline.

Please [open an issue](https://github.com/garethnunns/EMCalc/issues/new)
to report a bug or request a feature.

## Build

You'll need [Node.js](https://nodejs.org/) 24 (see `.nvmrc`).

````bash
# clone this repo
git clone https://github.com/garethnunns/EMCalc.git

# go to cloned repo folder
cd EMCalc

# install dependencies
npm install

# run the Expo dev server (press w for web, i for iOS, a for Android)
npm start
````

Other scripts:

| Command | Does |
| --- | --- |
| `npm run web` | Run in the browser with live reload |
| `npm run desktop` | Build the web version and open it in Electron |
| `npm test` | Run the unit tests |
| `npm run lint` | Check the code with ESLint |
| `npm run test:e2e` | Run the browser tests against `web-build/` (run `npm run build-web` and `npx playwright install chromium` first) |
| `npm run build-web` | Export the static website to `web-build/` |
| `npm run build-desktop` | Package the desktop app into `dist/` |
