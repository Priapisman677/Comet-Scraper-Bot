import { cometJWTsign, cometJWTVerify } from './jwt.js';
import { cometHash, cometCompare, cometGetRandomSalt } from './password.js';

/**
 * Custom cryptographic utilities for authentication & password security.
 *
 * - `cometJWTsign`, `cometJWTVerify`: A manually ilmpemented JWT-like signing & verification mechanism using HMAC-SHA256.
 * - `cometHash`, `cometCompare`, `cometGetRandomSalt`: Custom password hashing & verification using PBKDF2.
 * 
 * ### Why This Custom Implementation?
 * While established libraries like `jsonwebtoken` (for JWT) and `bcrypt` (for password hashing) are 
 * **widely used, well-documented, and optimized, this approach provides more flexibility and 
 * deeper control over cryptographic operations.
 * 
 * The "comet" prefix distinguishes these functions as part of a custom-built security module.
 *
 * However, in production environments, battle-tested libraries are generally more secure, better documented, and less error-prone.
 * This custom implementation is mainly useful for learning purposes and scenarios where built-in libraries 
 * might not fully meet specific needs.
 */

export default {
    cometJWTsign,
    cometJWTVerify,
    cometHash,
    cometCompare,
    cometGetRandomSalt,
};