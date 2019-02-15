# teaFlix (BETA)
A fully open-source, electron-react desktop client for webtorrent, includes auto-metdata-retriever for movies as well as TV Shows.



## To get started, follow the instructions:

1. Clone this repository on your computer.
2. Hit `npm install`

### If there are `fsevents` errors then:

1. Go to `node-modules/fsevents/package.json` and change:

```
{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz
```

To

```
{module_name}-v{version}-node-v64-{platform}-{arch}.tar.gz
```

2. Do the same in `node-modules/chokidar/node-modules/fsevents/package.json`

3. Once again run `npm install`

## To run the development app

1. run `npm start`

## To build a binary for macOS

1. run `npm run dist`

Instructions for linux and windows will be added soon.

## Beta download for macOS (binary):
https://github.com/nitnk9/teaFlix/releases/tag/v0.1-beta
