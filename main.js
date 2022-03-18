
const { app , BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')
const Store = require('electron-store')
Store.initRenderer();

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width:1248,
        height:859,
        webPreferences:{
            //preload:path.join(__dirname,'preload.js'),
            nodeIntegration:true,
            contextIsolation:false,
            enableRemoteModule: true,
        }
    })
    require('@electron/remote/main').initialize();
    require('@electron/remote/main').enable(mainWindow.webContents);
    const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl'
    mainWindow.loadURL(urlLocation)
    
})

