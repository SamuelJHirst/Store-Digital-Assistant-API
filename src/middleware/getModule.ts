import { Request, Response, NextFunction } from 'express';
import { config } from '../helpers/config';
import axios, { AxiosResponse } from 'axios';
import { send500 } from '../helpers/responses';

export const getModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	axios.get(`${config.base}/modules/${req.params.module ?? req.body.module}`).then((response: AxiosResponse) => {
		res.locals.module = response.data;
		next();
	}).catch((error: Error & { response: { status: number } }) => {
		if (error.response.status === 404 || error.response.status === 400) res.sendStatus(404);
		else send500(res, error);
	});
};