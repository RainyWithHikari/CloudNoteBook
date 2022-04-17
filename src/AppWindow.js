const { BrowserWindow } = require('electron')

class AppWindow extends BrowserWindow {
    constructor(config, urlLocation) {
        const basicConfig = {
            minHeight: 400,
            minWidth: 400,
            width: 800,
            height: 600,
            webPreferences: {
                //preload:path.join(__dirname,'preload.js'),
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
            },
            show:false,
            backgroundColor:'#efefef',
        }
        const finalConfig = {...basicConfig , ...config}
        super(finalConfig)
        this.loadURL(urlLocation)
        this.once('ready-to-show',()=>{
            this.show()
        })
    }
}
module.exports = AppWindow