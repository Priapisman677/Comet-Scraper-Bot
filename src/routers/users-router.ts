import { Router } from 'express';
//*types:
import validateAndCatchErrors from '../middleware.ts/validateAndCatchErrors.js';
import { createUserSchema, loginSchema } from '../zod-schemas/users-schemas.js';
//prettier ignore
import {
	authtest,
	createUser,
	deleteUser,
	login,
} from '../controllers/users/users-cotrollers.js';
import authMiddleware from '../middleware.ts/auth-middleware.js';

const router = Router();

router.post(
	'/users/signup',
	validateAndCatchErrors(createUser, createUserSchema)
);

router.get('/users/login', validateAndCatchErrors(login, loginSchema));

router.delete(
	'/users/delete',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(deleteUser)
);

//* Onlly for debugging:
router.get(
	'/authtest',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(authtest)
);

export default router;
