import { Request, response, Response } from 'express';
import { Module, IModule, ModuleProduct } from '../entities/Module';
import { send500 } from '../helpers/responses';

class ModuleUpdate {
	name?: string;
	startDate?: Date;
	endDate?: Date;
}

export const addModule = async (req: Request, res: Response): Promise<void> => {
	try {
		const newModule = new Module(req.body);
		req.body.parts = [];
		newModule.save().then((doc: IModule) => {
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

export const getModule = async (req: Request, res: Response): Promise<void> => {
	try {
		Module.findOne({ discriminator: req.params.module }).populate({ path: 'products.product', model: 'Product' }).then((doc: IModule | null) => {
			if (!doc) res.sendStatus(404);
			else res.send(doc);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getAllModules = async (req: Request, res: Response): Promise<void> => {
	try {
		Module.find({}, { _id: 0, __v: 0, 'products._id': 0 }).populate({ path: 'products.product', model: 'Product' }).then((docs: IModule[]) => {
			res.send(docs);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const updateModule = async (req: Request, res: Response): Promise<void> => {
	try {
		const update = new ModuleUpdate();
		if (req.body.name) update.name = req.body.name;
		if (!isNaN(Date.parse(req.body.startDate))) update.startDate = req.body.startDate;
		if (!isNaN(Date.parse(req.body.endDate))) update.endDate = req.body.endDate;
		if (Object.keys(update).length === 0) res.sendStatus(400);
		else Module.findOneAndUpdate({ discriminator: req.params.module }, { '$set': update }, { runValidators: true, new: true }).then(async (doc: IModule | null) => {
			if (!doc) res.sendStatus(404);
			else {
				await doc.populate({ path: 'products.product', model: 'Product' });
				res.send(doc);
			}
		}, (error: Error & { name: string }) => {
			if (error.name === 'ValidationError') res.sendStatus(400);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteModule = async (req: Request, res: Response): Promise<void> => {
	try {
		const doc = await Module.findOne({ discriminator: req.params.module });
		if (doc) {
			await doc.deleteOne();
			res.sendStatus(204);
		}
		else response.sendStatus(404);
	} catch (error) {
		send500(res, error);
	}
};

export const addModuleProduct = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.body.product || !req.body.facings || !Number.isInteger(req.body.facings) || req.body.facings < 1) res.sendStatus(400);
		else if (req.body.sequence && (!Number.isInteger(req.body.sequence) || req.body.sequence < 1)) res.sendStatus(400);
		else {
			const newModuleProduct = new ModuleProduct({ product: res.locals.product._id, facings: req.body.facings });
			if (req.body.sequence) req.body.sequence -= 1;
			Module.findOneAndUpdate({ discriminator: req.params.module }, { '$push': { products: { '$each': [newModuleProduct], '$position': req.body.sequence } } }, { new: true }).then(async (doc: IModule | null) => {
				if (!doc) res.sendStatus(404);
				else {
					await doc.populate({ path: 'products.product', model: 'Product' });
					res.send(doc);
				}
			}, (error: Error) => {
				send500(res, error);
			});
		}
	} catch (error) {
		send500(res, error);
	}
};

export const deleteModuleProduct = async (req: Request, res: Response): Promise<void> => {
	try {
		const key = `products.${parseInt(req.params.sequence) - 1}`;
		Module.updateOne({ discriminator: req.params.module }, { '$unset': { [key]: 1 } }).then((docs) => {
			if (docs.matchedCount === 0) res.sendStatus(404);
			else if (docs.modifiedCount === 0) res.sendStatus(422);
			else Module.findOneAndUpdate({ discriminator: req.params.module }, { '$pull': { products: null } }, { new: true }).then(async (doc: IModule | null) => {
				if (!doc) res.sendStatus(404);
				else {
					await doc.populate({ path: 'products.product', model: 'Product' });
					res.send(doc);
				}
			}, (error: Error) => {
				send500(res, error);
			});
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};