
const QiniuManager = require('./src/utils/QiniuManager')
const path = require('path')
//generate mac
var accessKey = '8Y3NoKqZcfoSEDWKoEaObMR6b44-iL4omXil4jJM';
var secretKey = 'ZOxJiEtKLlaHg-fWLGk7njJJuUWmCzzf75nzTp68';

var localFile = "C:\\Users\\anhko\\Documents\\lol.md";
var key = 'lol.md';
var downloadPath = path.join(__dirname,key)
 const manager = new QiniuManager(accessKey,secretKey,'rainy-cloud-doc')
//  manager.uploadFile(key,localFile).then((data)=>{
//  console.log('upload successfully', data)
// // return manager.deleteFile(key)
// // }).then((data)=>{
// //     console.error('delete successfully')
//  })
//manager.deleteFile(key)
//var publicBucketDomain = 'http://r96qv8o8t.hd-bkt.clouddn.com';

// manager.generateDownloadLink(key).then(data =>{
//     console.log(data)
//     return manager.generateDownloadLink('lol2.md')
// }).then(data=>{
//     console.log(data)
// })

manager.downloadFile(key,downloadPath).then(()=>{
    console.log('download successfully')
})