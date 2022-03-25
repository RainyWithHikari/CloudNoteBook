const qiniu = require('qiniu')
const axios = require('axios')
const fs = require('fs')
class QiniuManager {
    constructor(accessKey, secretKey, bucket) {
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);//generate mac
        this.bucket = bucket
        //initialize config class
        this.config = new qiniu.conf.Config();
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0;
        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config)

    }
    _handleCallback(resolve, reject) {
        return (respErr, respBody,
            respInfo) => {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode == 200) {
                resolve(respBody);
            } else {
                reject({
                    statusCode: respInfo.statusCode,
                    body: respBody,
                })

            }
        }
    }
    getBucketDomain() {
        const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
        const digest = qiniu.util.generateAccessToken(this.mac, reqURL)
        console.log('trigger here')
        return new Promise((resolve, reject) => {
            qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallback(resolve, reject))
        })
    }
    generateDownloadLink(key){
        const domainPromise = this.publicBucketDomain ? Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
        return domainPromise.then(data =>{
            if(Array.isArray(data) && data.length > 0){
                const pattern = /^https?/
                this.publicBucketDomain = pattern.test(data[0])? data[0] : `http://${data[0]}`
                return this.bucketManager.publicDownloadUrl(this.publicBucketDomain,key)            
            }else{
                throw Error('域名未找到')
            }
        })
    }
    uploadFile(key, localFilePath) {
        //generate upLoadToken
        var options = {
            scope: this.bucket + ":" + key,
        }
        var putPolicy = new qiniu.rs.PutPolicy(options)
        var uploadToken = putPolicy.uploadToken(this.mac)
        var formUploader = new qiniu.form_up.FormUploader(this.config)
        var putExtra = new qiniu.form_up.PutExtra()
        return new Promise((resolve, reject) => {
            formUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallback(resolve, reject))
        })


    }
    deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.delete(this.bucket, key, this._handleCallback(resolve, reject))

        })
    }
    downloadFile(key,downloadPath){
        //get the download link
        return this.generateDownloadLink(key).then(link =>{
            const timeStamp = new Date().getTime()
            //send the request to download link
            const url = `${link}?timestamp=${timeStamp}`
            //return a readable stream
            return axios({
                url,
                method:'GET',
                responseType:'stream',
                headers:{'Cache-Control':'no-cache'},

            })

        }).then(response => {
            //create a wirtable stream and pipe to it
            const writer = fs.createWriteStream(downloadPath)
            response.data.pipe(writer)
            return new Promise((resolve,reject)=>{
                writer.on('finish',resolve)
                writer.on('error',reject)
            })
        }).catch(err=>{
            return Promise.reject({ err: err.response})
        })
        
        //return a promise based result

    }


}
module.exports = QiniuManager