import { Request, Response } from 'express';
import { config } from '../helpers/config';
import axios, { AxiosResponse } from 'axios';
import { AuditLog, IAuditLog } from '../entities/AuditLog';
import { send500 } from '../helpers/responses';

export const addLog = async (req: Request, res: Response): Promise<void> => {
	try {
		axios.get(`${config.base}/users/${req.body.username}`, {
			headers: {
				Authorization: req.header('Authorization'),
			}
		}).then((response: AxiosResponse) => {
			const user = response.data;
			const newLog = new AuditLog({
				site: res.locals.site._id,
				user: user._id,
				action: req.body.action,
				timestamp: Date.now()
			});
			newLog.save().then(async (doc: IAuditLog) => {
				await newLog.populate({ path: 'user', select: '-password' }).execPopulate();
				await newLog.populate('site user.site').execPopulate();
				res.status(201).send(doc);
			}, (error: Error & { name: string, code: number }) => {
				if (error.name === 'ValidationError') res.sendStatus(400);
				else send500(res, error);
			});
		}).catch((error: Error & { response: { status: number } }) => {
			if (error.response.status === 404 || error.response.status === 400) res.sendStatus(404);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getLog = async (req: Request, res: Response): Promise<void> => {
	try {
		AuditLog.find({ site: res.locals.site._id }, { _id: 0, __v: 0 })
			.populate({ path: 'site' })
			.populate({ path: 'user', select: '-password', populate: { path: 'site' } })
			.then((docs: IAuditLog[]) => {
				res.send(docs);
			}, (error: Error) => {
				send500(res, error);
			});
	} catch (error) {
		send500(res, error);
	}
};