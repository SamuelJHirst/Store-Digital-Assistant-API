import { Request, Response, NextFunction } from 'express';
import { config } from '../helpers/config';
import axios, { AxiosResponse } from 'axios';
import { send500 } from '../helpers/responses';

export const getCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	axios.get(`${config.base}/customers/${req.params.customer ?? req.body.customer}`, { headers: { Authorization: req.header('Authorization') } }).then((response: AxiosResponse) => {
		res.locals.customer = response.data;
		next();
	}).catch((error: Error & { response: { status: number } }) => {
		if (error.response.status === 404 || error.response.status === 400) res.sendStatus(404);
		else send500(res, error);
	});
};