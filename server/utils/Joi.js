const Joi = require('joi');

const JoiValidator = {
    // Define a Joi schema for validating UUID
    uuidSchema : Joi.string().guid({ version: 'uuidv4' })
}
module.exports = JoiValidator;