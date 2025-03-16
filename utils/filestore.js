const httpstatus = require('../utils/httpstatus.js');
const fs = require('fs');

class fileUpoad {
    filetoUpload(path, file, randnum, file_name){
        try {
        const fileExtension = file_name.split('.');
        const imgBuffer = file.buffer;
        const filefullname = fileExtension[0] +'_'+randnum+ "."+fileExtension[1];
        const filepath = path + filefullname;
        if(!fs.existsSync(path)){
            fs.mkdirSync(path, {recursive : true});
        }
        fs.writeFileSync(filepath,imgBuffer);
        return path + filefullname;
    }catch (e) {
        return httpstatus.errorResponse("Internal server Error", res);
    }
    }
    async uploadGetDocumentPath(req, res){
        try {
        let fileUrl = 'storage/';
        let files = req.files;
        const randnum = Math.floor(100+ Math.random() * 900);
        const filepaths = [];
        files.forEach(function(file) {
            const filename = file.originalname;
            const jsonObj = {
                filename: filename,
                filepath : this.filetoUpload(fileUrl, file, randnum, filename),
            }
            filepaths.push(jsonObj);
        }, this);
        let response = {status:"File uploaded successfully",filepath:filepaths};
        return response;
    } catch (e) {
        return httpstatus.errorResponse("Internal server Error", res)
    }
    }
}

module.exports = new fileUpoad();