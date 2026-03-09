/**
 * Base custom error class
 */
export declare class AppError extends Error {
    statusCode: number;
    details: any;
    constructor(message: string, statusCode?: number, details?: any);
}
/**
 * Thrown when bad inputs are provided
 */
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
/**
 * Thrown when an item is not found
 */
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
/**
 * Thrown when the EXPA GraphQL API responds with errors
 */
export declare class ExpaApiError extends AppError {
    constructor(message: string, details?: any);
}
//# sourceMappingURL=errors.d.ts.map