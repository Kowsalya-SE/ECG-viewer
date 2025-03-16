const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
      code: 200,
      status: "success",
      API_Version: "v1",
      Application_Name: "ECG-Viewer-Uploader"
    });
});
  
module.exports = router;