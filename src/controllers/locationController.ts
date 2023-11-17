import { Request, Response } from 'express';
import { config } from '../helpers/config';
import axios, { AxiosResponse } from 'axios';
import { Aisle, IAisle, Bay, IBay } from '../entities/Location';
import { send500 } from '../helpers/responses';

class AisleUpdate {
	name?: string;
	aisle?: number;
}

class BayUpdate {
	bay?: number;
	moduleLimit?: number;
	allowsMultiLocation?: boolean;
	allowsClearance?: boolean;
	allowsDisplay?: boolean;
	allowsOverstock?: boolean;
	allowsTopstock?: boolean;
	allowsStockroom?: boolean;
}

export const addAisle = async (req: Request, res: Response): Promise<void> => {
	try {
		if (Object.keys(req.body).length === 0) res.sendStatus(400);
		else axios.get(`${config.base}/locations/${req.params.site}/aisles/${req.body.aisle}`).then(() => {
			res.sendStatus(409);
		}).catch((error: Error & { response: { status: number } }) => {
			if (error.response.status === 404 || error.response.status === 400) {
				const newAisle = new Aisle({ name: req.body.name, aisle: req.body.aisle, site: res.locals.site._id });
				newAisle.save().then(async (doc: IAisle) => {
					await newAisle.populate('site');
					res.status(201).send(doc);
				}, (error: Error & { name: string }) => {
					if (error.name === 'ValidationError' || error.name === 'CastError') res.sendStatus(400);
					else send500(res, error);
				});
			}
			else send500(res, error);
		});	
	} catch (error) {
		send500(res, error);
	}
};

export const getAisle = async (req: Request & { params: { aisle: number } }, res: Response): Promise<void> => {
	try {
		Aisle.findOne({ site: res.locals.site._id, aisle: req.params.aisle }).populate('site').then((doc: IAisle | null) => {
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

export const getAllAislesAtSite = async (req: Request, res: Response): Promise<void> => {
	try {
		Aisle.find({ site: res.locals.site._id }).populate('site').then((docs: IAisle[] | null) => {
			res.send(docs);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const updateAisle = async (req: Request & { params: { aisle: number } }, res: Response): Promise<void> => {
	try {
		const update = new AisleUpdate();
		if (req.body.name) update.name = req.body.name;
		if (Number.isInteger(Number(req.body.aisle))) update.aisle = await axios.get(`${config.base}/locations/${req.params.site}/aisles/${req.body.aisle}`).then((response: AxiosResponse) => { return response.data; }).catch(() => { return req.body.aisle; });
		if (Object.keys(update).length === 0) res.sendStatus(400);
		else if (req.body.aisle && typeof update.aisle !== 'number') res.sendStatus(409);
		else Aisle.findOneAndUpdate({ site: res.locals.site._id, aisle: req.params.aisle }, { '$set': update }, { new: true, runValidators: true }).then(async (doc: IAisle | null) => {
			if (!doc) res.sendStatus(404);
			else { 
				await doc.populate('site');
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

export const deleteAisle = async (req: Request & { params: { aisle: number } }, res: Response): Promise<void> => {
	try {
		Aisle.findOne({ site: res.locals.site._id, aisle: req.params.aisle }).then(async (doc: IAisle | null) => {
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

export const addBay = async (req: Request, res: Response): Promise<void> => {
	try {
		if (Object.keys(req.body).length === 0) res.sendStatus(400);
		else axios.get(`${config.base}/bay/${req.params.site}/${req.params.aisle}/${req.body.bay}/`).then(() => {
			res.sendStatus(409);
		}).catch((error: Error & { response: { status: number } }) => {
			if (error.response.status === 404 || error.response.status === 400) {
				req.body.aisle = res.locals.aisle._id;
				const newBay = new Bay(req.body);
				newBay.save().then(async (doc: IBay) => {
					await doc.populate('aisle');
					await doc.populate('aisle.site');
					res.status(201).send(doc);
				}, (error: Error & { name: string }) => {
					if (error.name === 'ValidationError' || error.name === 'CastError') res.sendStatus(400);
					else send500(res, error);
				});
			}
			else send500(res, error);
		});	
	} catch (error) {
		send500(res, error);
	}
};

export const getBay = async (req: Request & { params: { bay: number } }, res: Response): Promise<void> => {
	try {
		Bay.findOne({ aisle: res.locals.aisle._id, bay: req.params.bay }).populate({ path: 'aisle', populate: { path: 'site' } }).then((doc: IBay | null) => {
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

export const getAllBaysInAisle = async (req: Request, res: Response): Promise<void> => {
	try {
		Bay.find({ aisle: res.locals.aisle._id }).populate({ path: 'aisle', populate: { path: 'site' }}).then((docs: IBay[] | null) => {
			res.send(docs);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const updateBay = async (req: Request & { params: { bay: number } }, res: Response): Promise<void> => {
	try {
		const update = new BayUpdate();
		if (Number.isInteger(Number(req.body.moduleLimit))) update.moduleLimit = req.body.moduleLimit;
		if (typeof req.body.allowsMultiLocation !== 'undefined') update.allowsMultiLocation = req.body.allowsMultiLocation;
		if (typeof req.body.allowsClearance !== 'undefined') update.allowsClearance = req.body.allowsClearance;
		if (typeof req.body.allowsDisplay !== 'undefined') update.allowsDisplay = req.body.allowsDisplay;
		if (typeof req.body.allowsOverstock !== 'undefined') update.allowsOverstock = req.body.allowsOverstock;
		if (typeof req.body.allowsTopstock !== 'undefined') update.allowsTopstock = req.body.allowsTopstock;
		if (typeof req.body.allowsStockroom !== 'undefined') update.allowsStockroom = req.body.allowsStockroom;
		if (Number.isInteger(Number(req.body.bay))) update.bay = await axios.get(`${config.base}/locations/${req.params.site}/aisles/${req.params.aisle}/bays/${req.body.bay}`).then((response: AxiosResponse) => { return response.data; }).catch(() => { return req.body.bay; });
		if (Object.keys(update).length === 0) res.sendStatus(400);
		else if (req.body.bay && typeof update.bay !== 'number') res.sendStatus(409);
		else Bay.findOneAndUpdate({ aisle: res.locals.aisle._id, bay: req.params.bay }, { '$set': update }, { new: true, runValidators: true }).then(async (doc: IBay | null) => {
			if (!doc) res.sendStatus(404);
			else {
				await doc.populate('aisle');
				await doc.populate('aisle.site');
				res.send(doc);
			}
		}, (error: Error & { name: string }) => {
			if (error.name === 'CastError') res.sendStatus(404);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteBay = async (req: Request & { params: { bay: number } }, res: Response): Promise<void> => {
	try {
		Bay.findOne({ aisle: res.locals.aisle._id, bay: req.params.bay }).then(async (doc: IBay | null) => {
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