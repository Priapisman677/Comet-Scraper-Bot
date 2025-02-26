//*types:
import { NextFunction, Request, Response } from "express";
import { ErrorCode, HttpException, InternalException, UnprocessableEntity } from "../utils/exceptions.js";
import { AnyZodObject, ZodError, ZodString } from "zod";



/**
 * Middleware wrapper to handle validation and errors for route handlers.
 *
 * - If a schema is provided, it validates the request before calling `func`.
 * - Executes the `func` (route handler or middleware).
 * - Catches errors and converts them into appropriate HTTP exceptions.
 *
 * @param func - The route handler or middleware function.
 * @param schema - Optional Zod schema to validate the request.
 * @returns An Express middleware function.
 */
const validateAndCatchErrors  = (func: Function, schema?: AnyZodObject | ZodString) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema) {
                schema.parse(req); // Validate request if schema is provided
            }

            await func(req, res, next); // Execute the actual route handler or middleware
        } catch (e) {
            let exception;

            if (e instanceof HttpException) {
                exception = e; // Already a known HTTP exception
            } else if (e instanceof ZodError) {
                // Convert validation errors into an Unprocessable Entity response
                exception = new UnprocessableEntity(
                    'Unprocessable entity',
                    ErrorCode.UNPROCESSABLE_ENTITY,
                    e.issues.map(issue => issue.message)
                );
            } else {
                // Catch-all for unexpected errors
                exception = new InternalException(
                    "Something went wrong: internal exception",
                    ErrorCode.INTERNAL_EXCEPTION,
                    e
                );
            }

            next(exception); // Forward error to Express error handling middleware
        }
    };
};

export default validateAndCatchErrors ;
