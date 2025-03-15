const jwt = require("jsonwebtoken");

const authMiddleware = (req,res,next) => {
    const tokens = req.headers.authorization;
    if(!tokens){
        return res.status(401).json({
        message:"Authorization token Missing"
        })
    }else{
        const bearer =tokens.split(' ')
        const token = bearer[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            res.locals.userData = decodedToken;
            if(err){
                return res.status(400).json({
                    "message":err.message,
                    "code": "401",
                    "status":"failure"
                })
            }
            req.user = decodedToken;
            next();
        })
    }
};
module.exports = authMiddleware;