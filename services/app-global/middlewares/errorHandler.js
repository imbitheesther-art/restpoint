/**
 * Standardized error response handler
 * Prevents exposure of internal server details in production
 */

const errorHandler = (err, req, res, next) => {
    const isProd = process.env.NODE_ENV === 'production';

    // Log the full error internally
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, {
        message: err.message,
        stack: isProd ? undefined : err.stack,
        code: err.code,
        statusCode: err.statusCode || 500
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Build safe response - never expose internal details in production
    const response = {
        success: false,
        message: err.message || 'Internal Server Error'
    };

    // Only include error details in development
    if (!isProd) {
        response.error = err.message;
        if (err.stack) response.stack = err.stack;
    }

    // For 500 errors in production, use generic message
    if (statusCode === 500 && isProd) {
        response.message = 'Internal Server Error';
        delete response.error;
    }

    res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
};

/**
 * Async route wrapper to catch errors in async handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};