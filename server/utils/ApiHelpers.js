const httpStatus = require("http-status");

module.exports.successResponseGenerator = (statusCode, msg, data = {}) => ({
  status: "SUCCESS",
  code: statusCode,
  message: msg,
  data: data,
});

module.exports.errorResponse = (statusCode, msg, data = {}) => ({
  status: "ERROR",
  code: statusCode,
  message: msg,
  data: data,
});
