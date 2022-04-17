
const { app , BrowserWindow ,Menu,ipcMain,dialog} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const Store = require('electron-store')
const QiniuManager = require('./src/utils/QiniuManager')
const settingsStore = new Store({ name: 'Settings'})
const fileStore = new Store({name:'Files Data'})
Store.initRenderer();
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const { info } = require('console')
let mainWindow,settingsWindow;
const createManager = () =>{
    const accessKey = settingsStore.get('accessKey')
    const secretKey = settingsStore.get('secretKey')
    const bucketName = settingsStore.get('bucketName')
    return new QiniuManager(accessKey,secretKey,bucketName)
}
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
    ipcMain.on('upload-file',(event,data)=>{
        const manager = createManager()
        manager.uploadFile(data.key,data.path).then(data =>{
            console.log('upload successfully',data)
            mainWindow.webContents.send('active-file-uploaded')
        }).catch(()=>{
            dialog.showErrorBox('uploaded fail','please check')
        })
    })
    ipcMain.on('delete-file',(event,data)=>{
        const manager = createManager()
        manager.deleteFile(data.key).then(data => {
            mainWindow.webContents.send('active-file-deleted')
        }).catch(()=>{
            dialog.showErrorBox('delete fail','please check')
        })
    })
    ipcMain.on('rename-file' , (event , data) => {
        const manager = createManager()
        manager.renameFile( data.key , data.newTitle ).then(data => {
            mainWindow.webContents.send('active-file-renamed')
        }).catch(()=>{
            dialog.showErrorBox('rename fail','please check')
        })
    })
    ipcMain.on('download-file',(event , data ) =>{
        const manager = createManager()
        const filesObj = fileStore.get('files')
        const { key , path , id } = data
        manager.getStat(data.key).then((resp)=>{
            console.log(resp)
            console.log(filesObj[data.id])
            const serverUpdatedTime = Math.round(resp.putTime / 10000)
            console.log('qiniu:',serverUpdatedTime)
            const localUpdatedTime = filesObj[id].updatedAt
            console.log('local:',localUpdatedTime)
            if( serverUpdatedTime > localUpdatedTime || !localUpdatedTime ){
                console.log('new file downloaded')
                manager.downloadFile(key,path).then(()=>{
                    mainWindow.webContents.send('file-downloaded' , {status:'download-success' , id})
                })
            }else{
                console.log('no new file')
                mainWindow.webContents.send('file-downloaded' , {status:'no-new-file' , id})
            }
        },(error) =>{
            console.log(error)
            if(error.statusCode == 612){
                mainWindow.webContents.send('file-downloaded' , {status:'no-file' , id})
            }

        })
    })
    ipcMain.on('upload-all-to-qiniu' , () => {
        mainWindow.webContents.send('loading-status', true)
        const manager = createManager()
        const filesObj = fileStore.get('files') || {}
        const uploadPromiseArr = Object.keys(filesObj).map(key =>{
            const file = filesObj[key]
            return manager.uploadFile(`${file.title}.md`,file.path)
        })
        Promise.all(uploadPromiseArr).then(result => {
            console.log(result)
            //show uploaded message
            dialog.showMessageBox({
                type:'info',
                title:`成功上传了${result.length}个文件`,
                message:`成功上传了${result.length}个文件`,
            })
            mainWindow.webContents.send('files-uploaded')
        }).catch(()=>{
            dialog.showErrorBox('uploaded fail','please check')
        }).finally(()=>{
            mainWindow.webContents.send('loading-status', false)
        })
        
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

