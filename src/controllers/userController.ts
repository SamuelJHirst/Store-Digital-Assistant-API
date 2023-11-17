import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { config } from '../helpers/config';
import { User, IUser } from '../entities/User';
import { ISite } from '../entities/Site';
import { send500 } from '../helpers/responses';

class UserUpdate {
	firstName?: string;
	lastName?: string;
	username?: string;
	password?: string;
	userType?: string;
	site?: number;
}

interface UserResponse {
	firstName: string;
	lastName: string;
	username: string;
	password: string | undefined;
	userType: string;
	site: ISite;
}

export const addUser = async (req: Request, res: Response): Promise<void> => {
	try {
		req.body.site = res.locals.site._id;
		req.body.password = await hash(req.body.password, 10);
		const newUser = new User(req.body);
		newUser.populate('site');
		newUser.save().then((doc: UserResponse) => {
			doc.password = undefined;
			res.status(201).send(doc);
		}, (error: Error & { name: string, code: number }) => {
			if (error.code === 11000) res.sendStatus(409);
			else if (error.name === 'ValidationError') res.sendStatus(400);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
	try {
		User.findOne({ username: req.params.username }, { password: 0 }).populate('site').then((doc: IUser | null) => {
			if (!doc) res.sendStatus(404);
			else res.send(doc);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const update = new UserUpdate();
		if (req.body.firstName) update.firstName = req.body.firstName;
		if (req.body.lastName) update.lastName = req.body.lastName;
		if (req.body.userType) update.userType = req.body.userType;
		if (req.body.password) update.password = await hash(req.body.password, 10);
		if (req.body.site) update.site = await axios.get(`${config.base}/locations/${req.body.site}`).then((response: AxiosResponse) => { return response.data; }).catch(() => { return null; });
		if (req.body.username) update.username = await axios.get(`${config.base}/users/${req.body.username}`).then((response: AxiosResponse) => { return response.data; }).catch(() => { return req.body.username; });
		if (Object.keys(update).length === 0 || (req.body.code && !update.site)) res.sendStatus(400);
		else if (req.body.username && typeof update.username !== 'string') res.sendStatus(409);
		else User.findOneAndUpdate({ username: req.params.username }, { '$set': update }, { runValidators: true, new: true }).then(async (doc: IUser | null) => {
			if (!doc) res.sendStatus(400);
			else {
				await doc.populate('site');
				const resp: UserResponse = doc as UserResponse;
				resp.password = undefined;
				res.send(resp);
			}
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const doc = await User.findOne({ username: req.params.username });
		if (doc) {
			await doc.deleteOne();
			res.sendStatus(204);
		}
		else res.sendStatus(404);
	} catch (error) {
		send500(res, error);
	}
};

export const authenticate = async (req: Request, res: Response): Promise<void> => {
	try {
		User.findOne({ username: req.body.username }).populate('site').then(async (doc: IUser | null) => {
			if (!doc) res.sendStatus(401);
			else {
				const valid = await compare(req.body.password, doc.password);
				if (!valid) res.sendStatus(401);
				else {
					const payload = doc.toObject();
					payload.password = '';
					const token = sign(payload, config.jwtSecret);
					res.send({ token });
				}
			}
		}, (error: Error) => {
			send500(res, error);
		});
	}
	catch (error) {
		send500(res, error);
	}
};

export const getAuthUser = async (req: Request, res: Response): Promise<void> => {
	try {
		res.send(res.locals.authUser);
	}
	catch (error) {
		send500(res, error);
	}
};