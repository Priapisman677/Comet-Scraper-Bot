import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../utils/exceptions.js';

/**
 * Express error-handling middleware.
 *
 * - Catches and processes `HttpException` errors.
 * - Sends a structured error response with status code, message, and error details.
 * - Logs the error to the console for debugging.
 *
 * @param error - The thrown error (expected to be an `HttpException`).
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function (not used but required for middleware signature).
 */
export const errorMiddleware = (
    error: HttpException,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    res.status(error.statusCode).send({
        error_message: error.message, // User-friendly error message
        errorCode: error.errorCode, // Error code for easier debugging
        error: error.error // Additional error details (could be stack trace, validation issues, etc.)
    });

    console.log(error); // Logs error for debugging (consider using a logging service in production)
};
