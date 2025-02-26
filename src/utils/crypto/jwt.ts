import crypto from 'node:crypto';

interface ExtractedPayload {
    userId: number;
}

/**
 * Custom implementation of JWT signing using Node.js crypto module.
 * 
 * This function:
 * - Creates a JWT-like token with a base64url-encoded header and payload.
 * - Generates a HMAC-SHA256 signature for integrity verification.
 * - Returns the final token in `header.payload.signature` format.
 * 
 * Note: Unlike standard JWT libraries, this does not support expiration (`exp`) or advanced claims.
 *
 * @param payload - The payload to include in the token (must contain `userId`).
 * @param secret - Secret key used for signing the token.
 * @returns A JWT-like token as a string.
 */
export const cometJWTsign = (payload: { userId: number }, secret: string): string => {
    const jsonPayload = JSON.stringify(payload);
    const headers = JSON.stringify({ alg: 'HS256', type: 'jwt' });

    const base64Payload = Buffer.from(jsonPayload, 'utf-8').toString('base64url');
    const base64Headers = Buffer.from(headers, 'utf-8').toString('base64url');
    const concat = base64Headers + '.' + base64Payload;

    // Generate HMAC-SHA256 signature
    const signature = crypto.createHmac('sha256', secret).update(concat).digest('base64url');
    return concat + '.' + signature;
};

/**
 * Custom implementation of JWT verification.
 * 
 * This function:
 * - Extracts and decodes the JWT-like token.
 * - Recomputes the HMAC-SHA256 signature and verifies it using `crypto.timingSafeEqual()`.
 * - Returns the `userId` if valid, otherwise returns `null`.
 * 
 * @param token - The token to verify (should include "Bearer " prefix).
 * @param secret - Secret key used for verification.
 * @returns The extracted `userId` if valid, otherwise `null`.
 */
export const cometJWTVerify = (token: string, secret: string): number | null => {
    const tokenNoBearer = token.split(' ')[1]; // Remove "Bearer " prefix

    // Extract token parts
    const base64Headers = tokenNoBearer.split('.')[0];
    const base64Payload = tokenNoBearer.split('.')[1];
    const base64Signature = tokenNoBearer.split('.')[2];

    const concat = base64Headers + '.' + base64Payload;

    // Recompute signature
    const veriHash = crypto.createHmac('sha256', secret).update(concat).digest('base64url');

    try {
        // Use timingSafeEqual() to prevent timing attacks
        const isValid = crypto.timingSafeEqual(Buffer.from(base64Signature), Buffer.from(veriHash));
        if (!isValid) {
            return null;
        }
    } catch (e) {
        return null; // Handle errors safely
    }

    // Decode and extract payload
    const extractedPayload: ExtractedPayload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));

    return extractedPayload.userId;
};
