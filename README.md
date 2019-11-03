# Quickshot

### An attempt at making a good screenshot tool using Electron

#### Install
For now you have to build it. The cropping window (that opens with the PrintScreen key),
stays on top of other windows. If you start the app using the `--dev` argument, this parameter will be disabled.

```
npm install
electron  . --dev
```

### What works?
Press the PrintScreen key, crop a region of the screen using your mouse, and release the buttons. Your image is now saved in your clipboard! Press Control-V anywhere (for example in Discord or Paint), and you'll have it!

#### Goals
- High-performance
  > For now the window that opens with the PrintScreen key loads fast, but I think I could do better. Maybe if we load one file instead of separating every module.
- (Auto-)Export anywhere
  > Support for Google Drive, iCloud, Discord?
- Support for videos/gif
- Possibility to run in a DirectX process, so we can screenshot easily in a game for example
- Encryption
- Customizations
- Beautiful UI
