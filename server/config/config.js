const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");
dotenv.config({ path: path.join(__dirname, "../.env") });

const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(3000),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_REGION : Joi.string().required(),
    S3_BUCKET_NAME : Joi.string().required(),
    STATIC_ASSETS_DIRECTORY : Joi.string().required(),
    BASE_URL : Joi.string().required()
  })
  .unknown();
 
const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  aws: {
    access_key_id: envVars.AWS_ACCESS_KEY_ID,
    secret_access_key: envVars.AWS_SECRET_ACCESS_KEY,
    region: envVars.AWS_REGION,
    bucket_name: envVars.S3_BUCKET_NAME,
  },
  assets_directory : envVars.STATIC_ASSETS_DIRECTORY,
  port : envVars.PORT,
  base_url : envVars.BASE_URL
};