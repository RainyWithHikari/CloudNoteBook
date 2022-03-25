
const { app , BrowserWindow ,Menu,ipcMain} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const Store = require('electron-store')
const QiniuManager = require('./src/utils/QiniuManager')
const settingsStore = new Store({ name: 'Settings'})
Store.initRenderer();
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
let mainWindow,settingsWindow;

app.on('ready', () => {
    // mainWindow = new BrowserWindow({
    //     minHeight:900,
    //     minWidth:1248,
    //     width:1248,
    //     height:900,
    //     webPreferences:{
    //         //preload:path.join(__dirname,'preload.js'),
    //         nodeIntegration:true,
    //         contextIsolation:false,
    //         enableRemoteModule: true,
    //     }
    // })
    const mainWindowConfig = {
        minHeight:900,
        minWidth:1248,
        width:1248,
        height:900,
    }
    let menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
    
    const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl'
    mainWindow = new AppWindow(mainWindowConfig,urlLocation)
    mainWindow.on('closed',()=>{
        mainWindow = null
    })
    ipcMain.on('open-settings-window' , ()=>{
        const settingsWindowConfig = {
            width:500,
            height:400,
            parent:mainWindow,
        }
        const settingsFileLocation = `file://${path.join(__dirname,'./settings/settings.html')}`
        settingsWindow = new AppWindow(settingsWindowConfig,settingsFileLocation)
        settingsWindow.on('closed',()=>{
            mainWindow = null
        })
        require('@electron/remote/main').enable(settingsWindow.webContents);
    })
    ipcMain.on('config-is-saved',()=>{
        // watch out menu items index for mac and windows
        let qiniuMenu = process.platform == 'darwin' ? menu.items[3] : menu.items[2]
        const switchItems = (toggle) =>{
            [1,2,3].forEach(number =>{
                qiniuMenu.submenu.items[number].enabled = toggle
            })
        }
        const qiniuIsConfiged =  ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))
        if(qiniuIsConfiged){
            switchItems(true)
        }else{
            switchItems(false)
        }
    })
    //mainWindow.loadURL(urlLocation)
    require('@electron/remote/main').initialize();
    require('@electron/remote/main').enable(mainWindow.webContents);
    

})

