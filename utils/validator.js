const Validator = require('validatorjs')
const httpstatus = require('../utils/httpstatus.js');

class ValidatorClass {
    validate(req, res, rules) {
        let validation = new Validator(req.body, rules);
        if (validation.fails()) {
            return httpstatus.invalidInputResponse(validation.errors, res);

        } else {
            return false;
        }
    }
}

module.exports = new ValidatorClass();