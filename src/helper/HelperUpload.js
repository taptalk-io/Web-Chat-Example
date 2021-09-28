import { taptalk } from "@taptalk.io/web-sdk";

const FILE_UPLOAD_LIMIT = 5;
const ALLOWED_FILE_MEDIA = ['image', 'video'];

var HelperUpload = {
    fileUploadLimit: 5,
    limitMessage: {
        sizeLimit: "Maximum file size is 25 MB on a single file",
        countLimit: "Only " + FILE_UPLOAD_LIMIT + " files can be sent at once",
        fileLimit: "Only image and video are allowed on media upload"
    },
    checkFileLimit: (files, callback) => {
        if(files.length <= FILE_UPLOAD_LIMIT) {
            callback.onAllowed();
        }else {
            callback.onReachLimit(HelperUpload.limitMessage.countLimit);
        }
    },
    checkFileSizeLimit: (files, callback, sizeLimit = false) => {
        let fileSizeLimit = taptalk.getProjectConfigs() !== null ? taptalk.getProjectConfigs().core.chatMediaMaxFileSize : (sizeLimit ? sizeLimit : 26214400);
        // let fileSizeLimit = 2621440;
        let pass = true;
        let arrayOfFiles = [];
        
        if(files.length > 1) {
            for(let i = 0; i <= files.length; i++) {
                if(typeof files[i] === "object" && files[i].size > fileSizeLimit) {
                    pass = false;
                }
            }
        }else {
            if(files[0].size > fileSizeLimit) {
                pass = false;
            }
        }

        if(!pass) {
            callback.onReachLimit(HelperUpload.limitMessage.sizeLimit);
        }else {
            for(let i = 0; i <= files.length; i++) {
                if(typeof files[i] === "object" && files[i].size < fileSizeLimit) {
                    arrayOfFiles.push(files[i]);
                }
            }

            callback.onAllowed(arrayOfFiles);
        }
    },
    checkFileSizeLimitForMedia: (currentFilesInState, files, callback) => {
        let fileSizeLimit = taptalk.getProjectConfigs() !== null ? taptalk.getProjectConfigs().core.chatMediaMaxFileSize : 26214400;
        // let fileSizeLimit = 2621440;
        let pass = true;
        let arrayOfFiles = currentFilesInState.length === 0 ? [] : currentFilesInState;
        
        if(files.length > 1) {
            for(let i = 0; i <= files.length; i++) {
                if(typeof files[i] === "object" && files[i].size > fileSizeLimit) {
                    pass = false;
                }
            }
        }else {
            if(files[0].size > fileSizeLimit) {
                pass = false;
            }
        }

        if(!pass) {
            callback.onReachLimit(HelperUpload.limitMessage.sizeLimit);
        }else {
            if((currentFilesInState.length + files.length) <= FILE_UPLOAD_LIMIT) { 
                for(let i = 0; i <= files.length; i++) {
                    if(typeof files[i] === "object" && files[i].size < fileSizeLimit) {
                        let mediaFileReader = new FileReader();

                        mediaFileReader.onload = (e) => {
                            files[i].fileSrc = e.target.result;
                        }

                        mediaFileReader.readAsDataURL(files[i]);

                        files[i].caption = "";
                        arrayOfFiles.push(files[i]);

                        setTimeout(() => {
                            callback.onAllowed(arrayOfFiles);
                        }, 500)
                    }
                }
            }else {
                callback.onReachLimit(HelperUpload.limitMessage.countLimit);
            }
        }
    },
    checkFileAllowed: (files, callback, type = false) => {
        let pass = true;
        
        for(let i = 0; i <= files.length; i++) {
            if(typeof files[i] === "object") {
                let splitFileType = files[i].type.split('/');

                if(type) {
                    if(splitFileType[0] !== type) {
                        pass = false;
                    }
                }else {
                    let findIndex = ALLOWED_FILE_MEDIA.findIndex(value => value === splitFileType[0]);
    
                    if(findIndex === -1) {
                        pass = false;
                    }
                }
            }
        }

        if(!pass) {
            callback.onFileTypeDidntMatch(!type ? HelperUpload.limitMessage.fileLimit : `Only ${type} file are allowed`);
        }else {
            callback.onAllowed();
        }
    }
};

export default HelperUpload;