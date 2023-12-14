const config = require('../config/config');
const AWS = require('aws-sdk');
const fileService = require("./file.service");
const path = require("path");

// Set the AWS credentials and region
AWS.config.update({
    accessKeyId: config.aws.access_key_id,
    secretAccessKey: config.aws.secret_access_key,
    region: process.env.region
});


// Create an S3 instance
const s3 = new AWS.S3();

// Bucket name and optional prefix for filtering objects
const bucketName = config.aws.bucket_name;


// Fetching list of files from S3 bucket
// Function to list all objects in a bucket with pagination handling
async function listAllObjects(prefix = '') {
    const allObjects = [];
    let continuationToken = null;
  
    do {
      const params = {
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken
      };
  
      const response = await s3.listObjectsV2(params).promise();
  
      if (response.Contents) {
        allObjects.push(...response.Contents);
      }
  
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
  
    return allObjects;
}
// Downloading files
async function downloadFiles(filesArr , prefix ){
    return new Promise(async (resolve , reject )=>{
        const fileDownloadPromisesArray = filesArr.map( (fileKey) => {
            return helperDownloadFile(fileKey , prefix)
        });
        const filesDownloaded = await Promise.all(fileDownloadPromisesArray);
        resolve(filesDownloaded);
    })
}
function helperDownloadFile(fileKey , prefix ){
    return new Promise((resolve , reject)=>{
        try{
            const fileParams = {
                Bucket: bucketName,
                Key: fileKey
            };
        
            // Download each file
            s3.getObject(fileParams, async (downloadErr, fileData) => {
                try{
                    if (downloadErr) {
                        throw downloadErr;
                    }
                    
                    // Specify the directory where you want to save the files
                    const savePath = path.join("raw" , prefix , fileKey);
                    await fileService.saveFile(savePath , fileData.Body )
                    resolve(savePath);
                }catch(error){
                    reject (error);
                }
            });
        }catch(err){
            console.log("File download error")
            reject(err);
        }
    })
}

  
module.exports = {
    listAllObjects,
    downloadFiles
}