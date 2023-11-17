import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '../helpers/config';
import { send500 } from '../helpers/responses';

export const getAuthUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const auth = req.header('Authorization');
		if (auth) {			
			const decoded: & { password?: string, __v?: number, iat?: number } = verify(auth, config.jwtSecret) as & { password?: string, __v?: number, iat?: number };
			if (decoded) {
				decoded['password'] = undefined;
				decoded['__v'] = undefined;
				decoded['iat'] = undefined;
				res.locals.authUser = decoded;
				next();
			}
			else res.sendStatus(401);
		}
		else res.sendStatus(401);
	}
	catch (error) {
		send500(res, error);
	}
};