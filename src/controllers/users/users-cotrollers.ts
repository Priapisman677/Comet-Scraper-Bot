//* Types:
import { NextFunction, Request, Response } from 'express';
import { BadRequest, ErrorCode, OtherCaughtException } from '../../utils/exceptions.js';
import { CreateUserSchemaType, LoginSchemaType } from '../../zod-schemas/users-schemas.js';
import { cometCompare, cometGetRandomSalt, cometHash } from '../../utils/crypto/password.js';
import { cometJWTsign } from '../../utils/crypto/jwt.js';
import { prisma } from '../../server-setup.js';

/**
 * Creates a new user if they don't already exist.
 * Hashes the password with a generated salt and stores the user in the database.
 * Returns a signed JWT token for authentication.
 */
export const createUser = async (
	req: Request<{}, {}, CreateUserSchemaType>,
	res: Response,
	_next: NextFunction
) => {
	const { username, email, password } = req.body;

	// Check if user already exists
	const foundUser = await prisma.user.findFirst({ where: { email } });
	if (foundUser) {
		throw new BadRequest('User already exists', ErrorCode.USER_ALREADY_EXISTS);
	}

	// Hash password with generated salt
	const salt = cometGetRandomSalt();
	const hashedPassword = cometHash(password, salt);

	// Store user in the database
	const user = await prisma.user.create({
		data: {
			username,
			email,
			password: hashedPassword,
			salt,
		},
		select: { // Select only the fields you need
			id: true,
			username: true,
			email: true,
		}
	});
	

	// Generate authentication token
	const token = cometJWTsign({ userId: user.id }, process.env.HMAC_SECRT_KEY!);

	res.send({ user, token });
};

/**
 * Logs in an existing user by verifying email and password.
 * Returns a signed JWT token for authentication.
 */
export const login = async (
	req: Request<{}, {}, LoginSchemaType>,
	res: Response,
	_next: NextFunction
) => {
	const { email, password } = req.body;

	// Check if user exists
	const foundUser = await prisma.user.findFirst({ where: { email } });
	if (!foundUser) {
		throw new BadRequest('User not found', ErrorCode.USER_NOT_FOUND);
	}

	// Verify password
	const comparedPasswords = cometCompare(password, foundUser.salt, foundUser.password);
	if (!comparedPasswords) {
		throw new BadRequest('Invalid password', ErrorCode.INCORRECT_PASSWORD);
	}

	// Generate authentication token
	const token = cometJWTsign({ userId: foundUser.id }, process.env.HMAC_SECRT_KEY!);

	res.send({ foundUser, token });
};

/**
 * Deletes the currently authenticated user.
 * Returns confirmation upon successful deletion.
 */
export const deleteUser = async (
	req: Request,
	res: Response,
	_next: NextFunction
) => {
	const user = req.user;

	// Delete user from the database
	const deletedUser = await prisma.user.delete({
		where: {
			id: user.id,
		},
	});

	if (!deletedUser) {
		throw new OtherCaughtException('Error deleting user');
	}

	res.send({ data: 'Deleted user with email: ' + deletedUser.email });
};

/**
 * Test route to verify authentication middleware.
 * Returns the authenticated user's information.
 */
export const authtest = async (req: Request, res: Response) => {
	const user = req.user;
	res.send(user);
};
