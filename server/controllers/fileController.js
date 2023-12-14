// controllers/fileController.js
const httpStatus = require("http-status");
const {
    successResponseGenerator,
    errorResponse,
  } = require("../utils/ApiHelpers");
const config = require("./../config/config");
const  JoiValidator = require("../utils/Joi");
const catchAsync = require("../utils/catchAsync");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const s3Service = require("../service/s3.service");
const filesService = require("./../service/file.service");
const requestsArr = []; // This array can be memory based like redis / db

const fileController = {
    // TODO : There is a constraint in Node Js you can't open more then 100 files or so at the same time that needs tackling
    // TODO : Upload zip file to S3 with expiry of 24 hours
    // TODO : Unlink local zip file
    // TODO : Organize the code
    // TODO : Generate signed url for zip file which was uploaded and then send that url to front end
    generateZip: catchAsync(async  (req, res) => {
        let filePrefixes = req.body.filePrefixes;
        filePrefixes = filePrefixes || []
        const requestId = uuidv4();
        try {
            // Send the response to the client that we are processing on your request
            requestsArr[requestId]= {
                status : 'Processing'
            };
            res
                .status(httpStatus.OK)
                .send(
                    successResponseGenerator(
                        httpStatus.OK,
                        "Archive is being built. Please wait...",
                        {
                            id : requestId
                        }
                    )
                );
            // Make sure we are only proccessing unique directories
            filePrefixes = filesService.listRootDirectories(filePrefixes);
            if(filePrefixes.length  == 0){
                filePrefixes = [''];
            }

            // Start downloading files
            const filesDownloadedPromises = 
                (filePrefixes || [])
                    .map(async (prefix)=>fileController.helperGenerateZipSinglePrefix(prefix , requestId));
            const promisesResponse = await Promise.all(filesDownloadedPromises);

            console.log("All files downloaded"  , promisesResponse );
            // We need to archive the directory whhich is created for this request
            const requestFilesDirectory = filesService.getDirectoryPath(requestId)
            const zipFileName = await filesService.archiveFile([requestFilesDirectory]);
            
            // Let's unlink / delete the directory of raw assets
            await filesService.unlinkFile(requestFilesDirectory);
            
            // Raw files are now deleted
            // Need to upload the zip file to s3 to send url to front end
            requestsArr[requestId] ={
                status : "Success",
                data : {
                    file_url : `${config.base_url}archives/${zipFileName}`
                }
            }
        }catch (error) {
            console.log("An error occured" , error );
            requestsArr[requestId] ={
                status : "Error",
                error
            }
        }
    }),
    helperGenerateZipSinglePrefix : async (prefix , requestId)=>{
            // I will create one directory where all the assets for this request will be kept
            // Lets first fetch files which are also downloaded
            const objectsList = await s3Service.listAllObjects(prefix);

            // We need to filter down the files and the directories
            const directoryList = 
                (objectsList || [])
                    .map(obj=>(obj.Key || ''))
                    .filter(key=>key.endsWith("/"));
            const filesList = 
                (objectsList || [])
                    .map(obj=>(obj.Key || ''))
                    .filter(key=>!key.endsWith("/"));

            // Since now directories are created
            await filesService.createDirectoriesLocal(directoryList , requestId);

            // List of files retrieved from the bucket
            // Need to filter down directories so that relative structure can be created
            // Specify the directory where you want to save the files
            const filesDownloaded= await s3Service.downloadFiles(filesList , requestId );
            return filesDownloaded;
    },
    getStatus: catchAsync(async  (req, res) => {
        const {requestId} = req.params;
        const validatedInput = JoiValidator.uuidSchema.validate(requestId);
        console.log(validatedInput );
        if(!validatedInput.error){
            res
            .status(httpStatus.OK)
            .send(
                successResponseGenerator(
                    httpStatus.OK,
                    "Request status",
                    requestsArr[requestId]
                )
            );
        }else{
            res
              .status(httpStatus.BAD_REQUEST)
              .send(errorResponse(httpStatus.BAD_REQUEST, "Invalid uuid passed" ));
        }
    }),
    getObjectList: catchAsync(async  (req, res) => {
        console.log(req.body , req.params , req.query );
        const search = '';
        // I will create one directory where all the assets for this request will be kept
        // Lets first fetch files which are also downloaded
        const objectsList = await s3Service.listAllObjects(search);
        res
            .status(httpStatus.OK)
            .send(
                successResponseGenerator(
                    httpStatus.OK,
                    "Success",
                    objectsList
                )
            );
    })
};
  
module.exports = fileController;
  