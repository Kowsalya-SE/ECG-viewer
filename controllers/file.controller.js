const httpstatus = require('../utils/httpstatus.js');
const filestore = require('../utils/filestore.js');

class uploadFunctions{
    async uploadFile(req,res){
        try {
            req.body.file = req.files;
            if (!req.files) {
                return httpstatus.invalidInputResponse({ message: "File is required!" },res);
            }        
            const allowedExtensions = [".edf"];
            
            const fileExtension = `.${req.files[0].originalname.split(".").pop().toLowerCase()}`;
            if (!allowedExtensions.includes(fileExtension)) {
              return httpstatus.invalidInputResponse({ message: "Invalid file format! Only EDF are allowed." },res);
            }          

            const file = await filestore.uploadGetDocumentPath(req, res);
            const response = {
                filepath : file.filepath[0].filepath
            }
            return httpstatus.successResponse({message:file.status,response},res);
        } catch (e) {
            console.log(e,'error')
            return httpstatus.errorResponse({message:"Internal server error"},res);
        }
    }
}

module.exports = new  uploadFunctions();