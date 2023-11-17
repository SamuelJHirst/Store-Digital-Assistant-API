import { Request, Response } from 'express';
import { Site, ISite } from '../entities/Site';
import { send500 } from '../helpers/responses';

class SiteUpdate {
	name?: string;
	type?: string;
}

export const addSite = async (req: Request, res: Response): Promise<void> => {
	try {
		const newSite = new Site(req.body);
		newSite.save().then((doc: ISite) => {
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

export const getSite = async (req: Request, res: Response): Promise<void> => {
	try {
		Site.findOne({ code: req.params.site }).then((doc: ISite | null) => {
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

export const getAllSites = async (req: Request, res: Response): Promise<void> => {
	try {
		Site.find({}).then((docs: ISite[] | null) => {
			res.send(docs);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const updateSite = async (req: Request, res: Response): Promise<void> => {
	try {
		const update = new SiteUpdate();
		if (req.body.name) update.name = req.body.name;
		if (req.body.type) update.type = req.body.type;
		if (Object.keys(update).length === 0) res.sendStatus(400);
		else Site.findOneAndUpdate({ code: req.params.site }, { '$set': update }, { new: true, runValidators: true }).then((doc: ISite | null) => {
			if (!doc) res.sendStatus(404);
			else res.send(doc);
		}, (error: Error & { name: string }) => {
			if (error.name === 'ValidationError') res.sendStatus(400);
			else if (error.name === 'CastError') res.sendStatus(404);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteSite = async (req: Request, res: Response): Promise<void> => {
	try {
		Site.findOne({ code: req.params.site }).then(async (doc: ISite | null) => {
			if (doc) {
				await doc.remove();
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