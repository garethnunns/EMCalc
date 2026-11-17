<img src="assets/icon-squircle.png" alt="EM Calc logo" width="128">

# EM Calc
### Barco Event Master Custom Format Calculator

[![Test](https://github.com/garethnunns/EMCalc/actions/workflows/commit.yml/badge.svg)](https://github.com/garethnunns/EMCalc/actions/workflows/commit.yml) [![Release](https://img.shields.io/github/v/release/garethnunns/EMCalc)](https://github.com/garethnunns/EMCalc/releases/latest) 

![EM Calc on a desktop, with the format settings beside the EDID timing](README/Desktop.png)

![EM Calc on a phone, showing the format settings and results](README/Phone-1.png) | ![EM Calc on a phone, showing which inputs support the format, including SDI](README/Phone-2.png)
:---:|:---:

This tool is designed to help calculate custom formats for the Barco 
Event Master range of products. This isn't a Barco product and 
there's no gaurantee it'll work.

The logic is largely based from the
[spreadsheet](https://www.facebook.com/groups/Barcofolsom/permalink/2524750314238262/)
created by Graham Loveridge, Syed Athar Hussain & Scott Gershick.

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

You'll need [Node.js](https://nodejs.org/) 22 or 24 (see `.nvmrc`).

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
| `npm run build-web` | Export the static website to `web-build/` |
| `npm run build-desktop` | Package the desktop app into `dist/` |
