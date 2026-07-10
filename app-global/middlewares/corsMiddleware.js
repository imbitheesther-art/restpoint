/**
 * CORS Middleware - Pass-through only
 * CORS is handled exclusively by the API Gateway.
 * This middleware does nothing but pass requests through.
 */
module.exports = (req, res, next) => {
  next();
};