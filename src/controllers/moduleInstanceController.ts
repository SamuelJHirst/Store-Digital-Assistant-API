import { Request, Response } from 'express';
import { config } from '../helpers/config';
import axios, { AxiosResponse } from 'axios';
import { ModuleInstance, IModuleInstance } from '../entities/ModuleInstance';
import { send500 } from '../helpers/responses';

export const addModuleToSite = async (req: Request, res: Response): Promise<void> => {
	try {
		const newModuleInstance = new ModuleInstance({ module: res.locals.module._id, site: res.locals.site._id, bay: null });
		ModuleInstance.findOne({ module: res.locals.module._id, site: res.locals.site._id }).then((doc: IModuleInstance | null) => {
			if (doc) res.sendStatus(409);
			else newModuleInstance.save().then(async (doc: IModuleInstance) => {
				await doc.populate({ path: 'site' });
				await doc.populate({ path: 'module', populate: { path: 'products.product', model: 'Product' }});
				res.status(201).send(doc);
			}, (error: Error & { name: string }) => {
				if (error.name === 'ValidationError') res.sendStatus(400);
				else send500(res, error);
			});
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getModuleAtSite = async (req: Request, res: Response): Promise<void> => {
	try {
		ModuleInstance.findOne({ module: res.locals.module._id, site: res.locals.site._id })
			.populate({ path: 'site' })
			.populate({ path: 'module', populate: { path: 'products.product', model: 'Product' }})
			.populate({ path: 'bay', populate: { path: 'aisle', populate: { path: 'site' } } })
			.then((doc: IModuleInstance | null) => {
				if (!doc) res.sendStatus(404);
				else res.send(doc);
			}, (error: Error) => {
				send500(res, error);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const getModulesAtSite = async (req: Request, res: Response): Promise<void> => {
	try {
		ModuleInstance.find({ site: res.locals.site._id })
			.populate({ path: 'site' })
			.populate({ path: 'module', populate: { path: 'products.product', model: 'Product' }})
			.populate({ path: 'bay', populate: { path: 'aisle', populate: { path: 'site' } } })
			.then((docs: IModuleInstance[] | null) => {
				res.send(docs);
			}, (error: Error) => {
				send500(res, error);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteModuleFromSite = async (req: Request, res: Response): Promise<void> => {
	try {
		const doc = await ModuleInstance.findOne({ module: res.locals.module._id, site: res.locals.site._id });
		if (doc) {
			await doc.deleteOne();
			res.sendStatus(204);
		}
		else res.sendStatus(404);
	} catch (error) {
		send500(res, error);
	}
};

export const addModuleToBay = async (req: Request, res: Response): Promise<void> => {
	try {
		axios.get(`${config.base}/locations/${req.params.site}/aisles/${req.params.aisle}/bays/${req.params.bay}`).then((response: AxiosResponse) => {
			const bayModules = response.data;
			if (bayModules.length >= res.locals.bay.moduleLimit) res.sendStatus(422);
			else ModuleInstance.findOneAndUpdate({ site: res.locals.bay.aisle.site._id, module: res.locals.module._id }, { '$set': { bay: res.locals.bay._id } }, { new: true }).then(async (doc: IModuleInstance | null) => {
				if (!doc) res.sendStatus(404);
				else {
					await doc.populate({ path: 'site' });
					await doc.populate({ path: 'module', populate: { path: 'products.product', model: 'Product' }});
					await doc.populate({ path: 'bay', populate: { path: 'aisle', populate: { path: 'site' } } });
					res.send(doc);
				}
			}, (error: Error) => {
				send500(res, error);
			});
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getModulesInBay = async (req: Request, res: Response): Promise<void> => {
	try {
		ModuleInstance.find({ bay: res.locals.bay._id })
			.populate({ path: 'site' })
			.populate({ path: 'module', populate: { path: 'products.product', model: 'Product' }})
			.populate({ path: 'bay', populate: { path: 'aisle', populate: { path: 'site' } } })
			.then((docs: IModuleInstance[] | null) => {
				res.send(docs);
			}, (error: Error) => {
				send500(res, error);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteModuleFromBay = async (req: Request, res: Response): Promise<void> => {
	try {
		ModuleInstance.updateOne({ site: res.locals.site._id, module: res.locals.module._id }, { '$set': { bay: null } }).then((docs) => {
			if (docs.matchedCount === 0 || docs.modifiedCount === 0) res.sendStatus(422);
			else res.sendStatus(204);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getProductModulesAtSite = async (req: Request, res: Response): Promise<void> => {
	try {
		ModuleInstance.find({ site: res.locals.site._id })
			.populate({ path: 'site' })
			.populate({ path: 'module', populate: { path: 'products.product', model: 'Product' }})
			.populate({ path: 'bay', populate: { path: 'aisle', populate: { path: 'site' } } })
			.then((docs: IModuleInstance[] | null) => {
				docs = (docs ?? []).filter(x => { return x.module.products.map((y: & { product: { ean: string } }) => { return y.product.ean; } ).indexOf(req.params.product) > -1; });
				res.send(docs);
			}, (error: Error) => {
				send500(res, error);
			});
	} catch (error) {
		send500(res, error);
	}
};