import { Request, Response } from 'express';

export const send405 = async (req: Request, res: Response): Promise<void> => {
	res.sendStatus(405);
};

export const send500 = async (res: Response, error: Error): Promise<void> => {
	res.sendStatus(500);
	throw error;
};