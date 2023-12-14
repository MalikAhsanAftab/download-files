const config = require('../config/config');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const filesDirectory = path.join(__dirname , "..", config.assets_directory);

function createDirectoriesLocal(directoriesList , prefix ){
    const rawAssetsDirectory = path.join( __dirname, '..' , config.assets_directory , 'raw',prefix );
    // Let's create a root directory for this request only    
    if(!fs.existsSync(rawAssetsDirectory))
    {
        fs.mkdirSync(rawAssetsDirectory);
    }
    // The directory list that is recieved from AWS is in order like [parent , parent/child1 , parent/child/child2]
    for (let index = 0; index < directoriesList.length; index++) {
        const directory = directoriesList[index];
        let currentDir = path.join(rawAssetsDirectory, directory);
        console.log("Directory exists" ,  fs.existsSync(currentDir) , currentDir);
        if (!fs.existsSync(currentDir)) {
            console.log("Gonna create directory" , currentDir );
            fs.mkdirSync(currentDir);
        }
    }
}
function getDirectoryPath(directory){
    const rawAssetsDirectory = path.join( __dirname, '..' , config.assets_directory , 'raw', directory );
    return rawAssetsDirectory;
}

// Generate a unique file name based on current time components
function generateUniqueFileName() {
    const currentDate = new Date();
    
    // Get individual time components
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  
    // Create a unique file name using time components
    return `file_${year}_${month}_${day}_${hours}-${minutes}-${seconds}`;
  }
  
function archiveFile(filesArray) {
    return new Promise((resolve , reject)=>{
        // Create a new output stream object
        const zipName  = generateUniqueFileName() +".zip";

        const savePath = path.join(filesDirectory , "archives" , zipName);

        const output = fs.createWriteStream(savePath);

        // Create a new archiver instance
        const archive = archiver('zip', {
            zlib: { level: 9 } // Set compression level (optional)
        });

        // Listen for all archive data to be written
        output.on('close', () => {
            console.log(archive.pointer() + ' total bytes');
            resolve(zipName);
        });

        // Handle errors
        archive.on('error', (err) => {
            reject(err)
            throw err;
        });

        // Pipe the output stream
        archive.pipe(output);

        //Make sure file exists
        const fileExistsArray = (filesArray || []).filter(filePath=>fs.existsSync(filePath));

        // Add files to the archive
        const filesToAdd = fileExistsArray;

        filesToAdd.forEach((filePath) => {
            const fileName = path.basename(filePath);
            archive.file(filePath, { name: fileName });
        });

        // Finalize the archive
        archive.finalize();
    });
}

async function saveFile(savePath  , contents){
    try{
        savePath = path.join(filesDirectory , savePath);
        // Save the file locally
        fs.writeFileSync(savePath, contents)
        return savePath;
    }catch(error){
        return `Error saving file ${savePath} locally:`
    }
}
async function unlinkFile(savePath){
    try{
        // savePath = path.join(filesDirectory , savePath);
        console.log("While unlinking" , savePath)
        // Save the file locally
        deleteDirectoryRecursive(savePath)
        return savePath;
    }catch(error){
        return `Error deleting file ${savePath} locally:`
    }
}
// Function to delete a directory recursively
function deleteDirectoryRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach((file) => {
        const curPath = path.join(directoryPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // Recursive call for directories
          deleteDirectoryRecursive(curPath);
        } else {
          // Delete files within the directory
          fs.unlinkSync(curPath);
        }
      });
      // Remove the directory itself after its contents are deleted
      fs.rmdirSync(directoryPath);
      console.log(`Directory ${directoryPath} is deleted successfully.`);
    } else {
      console.log(`Directory ${directoryPath} does not exist.`);
    }
  }
  function listRootDirectories(paths) {
    const directories = new Set(); // Use a Set to store unique directory names
    
    // Iterate through each path and extract root directories
    paths.forEach(path => {
      const parts = path.split('/'); // Split path by '/'
      if (parts.length > 0) {
        // Add the first part as a root directory to the Set
        directories.add(parts[0]);
      }
    });
    
    return Array.from(directories); // Convert the Set back to an array
  }
module.exports = {
    createDirectoriesLocal,
    getDirectoryPath ,
    archiveFile ,
    saveFile ,
    unlinkFile ,
    listRootDirectories
}