const httpstatus = require('../utils/httpstatus.js');
const filestore = require('../utils/filestore.js');
const { knex } = require('../config/database.js');
const dayjs = require('dayjs');

class uploadFunctions{
    async getFiles(req,res){
        try{
            let getLogs = await getFilelist();
            return httpstatus.successResponse({message:"Files fetched successfully!..",files:getLogs},res)
        } catch (e){
            console.log(e,'e')
            return httpstatus.errorResponse({message:"Internal server error"},res);
        }
    }
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
            const insertDb = await knex('files_lists').insert({
                file_name:file.filepath[0].filename,
                file_path:file.filepath[0].filepath,
                created_at:new Date(),
                updated_at:new Date()
            })
            const getfiles = await getFilelist();
            let response = {
                id:insertDb[0],
                filepath : file.filepath[0].filepath,
                files:getfiles
            }
            return httpstatus.successResponse({message:file.status,response},res);
        } catch (e) {
            console.log(e,'error')
            return httpstatus.errorResponse({message:"Internal server error"},res);
        }
    }
}
async function getFilelist(params) {
    let getLists = await knex('files_lists');
    for(const data of getLists){
        data.created_at = dayjs(data.created_at).format('ddd, MMM D, YYYY h:mm A');
        data.file_path = `${process.env.API_URL}${data.file_path}`
    }
    return getLists;
}
module.exports = new  uploadFunctions();