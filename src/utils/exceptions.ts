/**
 * Base class for all HTTP-related exceptions.
 * Extends the built-in `Error` class to provide structured error handling.
 */
export class HttpException extends Error {
    constructor(
        public message: string,  // Error message, inherited from `Error`
        public errorCode: ErrorCode,   // Custom error code specific to this application
        public statusCode: number, // HTTP status code for this exception
        public error: any        // Additional error data (optional)
    ){
        super(message) // Pass message to the built-in `Error` class
    }
}

/**
 * Application-specific error codes.
 * These codes provide more granularity than standard HTTP status codes.
 */
export enum ErrorCode {
    OTHER_COUGHT_EXCEPTION = 1000,
    USER_NOT_FOUND = 1001,
    USER_ALREADY_EXISTS = 1002,
    INCORRECT_PASSWORD = 1003,
    UNPROCESSABLE_ENTITY = 1004,
    INTERNAL_EXCEPTION = 1005,
    UNAUTHORIZED = 1006,
    INVALID_PRODUCT_PAGE = 1007,
    ALREADY_TRACKED = 1008,
    PRODUCT_EXISTS_NO_REVIEWS = 1014,
    AI_ERROR = 1015,
    ID_REQUIRED = 1016,
    PRODUCT_NOT_FOUND = 1017
}

/**
 * Specialized HTTP exceptions for various error scenarios.
 * Each class corresponds to a specific HTTP status and error type.
 */
export class UnprocessableEntity extends HttpException {
    constructor(message: string, errorCode: ErrorCode, error: any) {  
        super(message, errorCode, 422, error) // 422: Unprocessable Entity
    }
}

export class ImATeaPot extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {  
        super(message, errorCode, 418, null) // 418: I'm a teapot (Easter egg status code)
    }
}

export class InternalException extends HttpException {
    constructor(message: string, errorCode: ErrorCode, error: any) {
        super(message, errorCode, 500, error) // 500: Internal Server Error
    }
}

export class BadRequest extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {  
        super(message, errorCode, 400, null) // 400: Bad Request
    }
}

export class OtherCaughtException extends HttpException {
    constructor(message: string) {  
        super(message, ErrorCode.OTHER_COUGHT_EXCEPTION, 400, null) // Default error case
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
        super(message, errorCode, 401, null) // 401: Unauthorized
    }
}