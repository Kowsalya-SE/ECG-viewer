const httpstatus = require('../utils/httpstatus.js');
const filestore = require('../utils/filestore.js');
const { knex } = require('../config/database.js');
const dayjs = require('dayjs');
const fs = require('fs');
const {Readable} = require('stream');

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
            const parsedData = 
            await getEcgDataById(insertDb[0]);
            return httpstatus.successResponse({message:file.status,parsedData},res);
        } catch (e) {
            console.log(e,'error')
            return httpstatus.errorResponse({message:"Internal server error"},res);
        }
    }
    async viewEcgfile(req, res) {
        try {
            const { id } = req.params;
            const parsedData = await this.getEcgDataById(id);
            
            if (parsedData.error) {
                return httpstatus.errorResponse({ message: parsedData.error }, res);
            }
    
            return httpstatus.successResponse({ message: "Fetched successfully", parsedData }, res);
        } catch (error) {
            console.error(error);
            return httpstatus.errorResponse({ message: "Error processing EDF file" }, res);
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

async function getEcgDataById(id) {
    const file = await knex('files_lists').where({ id }).first();
    if (!file) throw new Error("File not found");

    const filePath = file.file_path;
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
        // Reading the file into a buffer
        fs.readFile(filePath, (err, buffer) => {
            if (err) {
                console.error("File read error:", err);
                return reject(err);
            }

            // Convert the buffer into a readable stream
            const stream = Readable.from(buffer);
            const parser = edfParser();

            // Try piping the stream directly into edfParser
            stream.pipe(parser);

            parser.on('data', (data) => {
                console.log(data); // Check the data here
                resolve(data); // Resolve with parsed data
            });

            parser.on('error', (error) => {
                console.error("Error during EDF parsing:", error);
                reject(error); // Reject in case of error
            });

            parser.on('end', () => {
                console.log("Parsing completed successfully");
            });
        });
    });
}
module.exports = new  uploadFunctions();