import { NextFunction, Request, Response } from 'express';
import { ErrorCode, UnauthorizedException } from '../utils/exceptions.js';
import comet from '../utils/crypto/index.js';
import { prisma } from '../server-setup.js';

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction)=>{

    const token = req.headers.authorization

    // We are already checking for a missing token at Zod validation but we do it twice even though it is redundant:
    if(!token){
        throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED)
    }
    // This is my custom HMAC function. If it is successful it will return a user id, if it's not it will return "null".
    const userId = comet.cometJWTVerify(token, '123456')
    if(!userId){
        throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED)
    }

    const user = await prisma.user.findUnique({
		where: {
			id: userId
		}
	});
    
    if(!user){
        throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED)
    }

    (req as any).user = user
    next()
}

export default authMiddleware