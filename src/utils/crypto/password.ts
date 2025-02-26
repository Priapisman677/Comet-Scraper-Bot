import crypto from 'node:crypto';

/**
 * Generates a cryptographically secure random salt.
 * 
 * - Uses `crypto.randomBytes(16)` to generate a 16-byte (128-bit) random salt.
 * - Encodes it as a hexadecimal string for easy storage.
 * 
 * @returns A 32-character hex string salt.
 */
export const cometGetRandomSalt = (): string => {
    return crypto.randomBytes(16).toString('hex');
};

/**
 * Hashes a password using PBKDF2 with SHA-256.
 * 
 * - Key derivation function PBKDF2 (Password-Based Key Derivation Function 2).
 * - Iterations 100,000 (slows down brute-force attacks).
 * - Salt: Required to make each hash unique.
 * - Output: 64-byte derived key, converted to a hex string.
 * 
 * @param password - The plain-text password.
 * @param salt - A unique salt for each password.
 * @returns A securely hashed password in hex format.
 */
export const cometHash = (password: string, salt: string): string => {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha-256').toString('hex'); 
};

/**
 * Compares a plain-text password with a stored hash.
 * 
 * - Hashes the provided password using the same salt and algorithm.
 * - Compares the result with the stored hash using `timingSafeEqual()`.
 * - First checks if lengths match before comparing (prevents timing attacks).
 * 
 * @param password - The plain-text password to verify.
 * @param salt - The salt used when storing the original hash.
 * @param storedHash - The previously stored hashed password.
 * @returns `true` if the password matches, otherwise `false`.
 */
export const cometCompare = (password: string, salt: string, storedHash: string): boolean => {
    // Compute hash of the inbound password
    const bufferFromInboundPass = Buffer.from(cometHash(password, salt), 'hex');
    const bufferFromStoredHash = Buffer.from(storedHash, 'hex');

    // First, compare lengths for security (avoids leaking timing info)
    if (bufferFromInboundPass.length !== bufferFromStoredHash.length) {
        return false;
    }

    // Use timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(bufferFromInboundPass, bufferFromStoredHash);
};
