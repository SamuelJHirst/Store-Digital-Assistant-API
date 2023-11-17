import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '../helpers/config';
import { send500 } from '../helpers/responses';

interface UserPermissions {
	userType: string;
}

export const isUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const auth = req.header('Authorization');
		if (auth) {			
			const decoded = verify(auth, config.jwtSecret);
			if (decoded) next();
			else res.sendStatus(401);
		}
		else res.sendStatus(401);
	}
	catch (error) {
		send500(res, error);
	}
};

export const isManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const auth = req.header('Authorization');
		if (auth) {			
			const decoded = verify(auth, config.jwtSecret);
			if (decoded && ((decoded as UserPermissions).userType === 'Manager' || (decoded as UserPermissions).userType === 'Admin')) next();
			else res.sendStatus(401);
		}
		else res.sendStatus(401);
	}
	catch (error) {
		send500(res, error);
	}
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const auth = req.header('Authorization');
		if (auth) {			
			const decoded = verify(auth, config.jwtSecret);
			if (decoded && (decoded as UserPermissions).userType === 'Admin') next();
			else res.sendStatus(401);
		}
		else res.sendStatus(401);
	}
	catch (error) {
		send500(res, error);
	}
};