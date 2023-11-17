import { Request, Response } from 'express';
import { hash } from 'bcrypt';
import validator from 'validator';
import { config } from '../helpers/config';
import { Customer, ICustomer } from '../entities/Customer';
import { Counter } from '../entities/Counter';
import { send500 } from '../helpers/responses';

class CustomerUpdate {
	title?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	password?: string;
	addressNumberName?: string;
	addressStreet1?: string;
	addressStreet2?: string;
	addressCity?: string;
	addressPostcode?: string;
	mobilePhone?: string;
}

interface CustomerResponse {
	title: string;
	firstName: string;
	lastName: string;
	email: string;
	password?: string | undefined;
	addressNumberName: string;
	addressStreet1: string;
	addressStreet2?: string;
	addressCity: string;
	addressPostcode: string;
	mobilePhone: string;
	customerNumber: number;
}

export const addCustomer = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.body.email || !validator.isEmail(req.body.email)) res.sendStatus(400);
		else if (!req.body.mobilePhone || !validator.isMobilePhone(req.body.mobilePhone, 'en-GB')) res.sendStatus(400);
		else if (!req.body.addressPostcode || !validator.isPostalCode(req.body.addressPostcode, 'GB')) res.sendStatus(400);
		else {
			req.body.password = await hash(req.body.password, 10);
			const newCustomer = new Customer(req.body);
			newCustomer.save().then((doc: CustomerResponse) => {
				doc.password = undefined;
				res.send(doc);
			}, async (error: Error & { name: string, code: number }) => {
				await Counter.findByIdAndUpdate(config.customerCounter, { $inc: { seq: -1 } });
				if (error.code === 11000) res.sendStatus(409);
				else if (error.name === 'ValidationError') res.sendStatus(400);
				else send500(res, error);
			});
		}
	} catch (error) {
		send500(res, error);
	}
};

export const getCustomer = async (req: Request & { params: { customer: number } }, res: Response): Promise<void> => {
	try {
		Customer.findOne({ customerNumber: req.params.customer }, { password: 0, __v: 0 }).then((doc: ICustomer | null) => {
			if (!doc) res.sendStatus(404);
			else res.send(doc);
		}, (error: Error & { name: string }) => {
			if (error.name === 'CastError') res.sendStatus(404);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const updateCustomer = async (req: Request & { params: { customer: number } }, res: Response): Promise<void> => {
	try {
		const update = new CustomerUpdate();
		if (req.body.title) update.title = req.body.title;
		if (req.body.firstName) update.firstName = req.body.firstName;
		if (req.body.lastName) update.lastName = req.body.lastName;
		if (req.body.addressNumberName) update.addressNumberName = req.body.addressNumberName;
		if (req.body.addressStreet1) update.addressStreet1 = req.body.addressStreet1;
		if (req.body.addressStreet2) update.addressStreet2 = req.body.addressStreet2;
		if (req.body.addressCity) update.addressCity = req.body.addressCity;
		if (req.body.email && validator.isEmail(req.body.email)) update.email = req.body.email;
		if (req.body.mobilePhone && validator.isMobilePhone(req.body.mobilePhone, 'en-GB')) update.mobilePhone = req.body.mobilePhone;
		if (req.body.addressPostcode && validator.isPostalCode(req.body.addressPostcode, 'GB')) update.addressPostcode = req.body.addressPostcode;
		if (req.body.password) update.password = await hash(req.body.password, 10);
		if (Object.keys(update).length === 0) res.sendStatus(400);
		else Customer.findOneAndUpdate({ customerNumber: req.params.customer }, { '$set': update }, { runValidators: true, new: true }).then((doc: CustomerResponse | null) => {
			if (!doc) res.sendStatus(404);
			else {
				doc.password = undefined;
				res.send(doc);
			}
		}, (error: Error & { name: string }) => {
			if (error.name === 'ValidationError') res.sendStatus(400);
			else if (error.name === 'CastError') res.sendStatus(404);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteCustomer = async (req: Request & { params: { customer: number } }, res: Response): Promise<void> => {
	try {
		Customer.findOne({ customerNumber: req.params.customer }).then(async (doc: ICustomer | null) => {
			if (doc) {
				await doc.deleteOne();
				res.sendStatus(204);
			}
			else res.sendStatus(404);
		}, (error: Error & { name: string }) => {
			if (error.name === 'CastError') res.sendStatus(404);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};