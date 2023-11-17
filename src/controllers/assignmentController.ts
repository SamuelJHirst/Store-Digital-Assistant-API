import { Request, Response } from 'express';
import { Assignment, IAssignment } from '../entities/Assignment';
import { send500 } from '../helpers/responses';

export const addAssignment = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.body.product || !req.body.type) res.sendStatus(400);
		else if (Array.isArray(res.locals.bay)) res.sendStatus(400);
		else if (
			(!res.locals.bay.allowsMultiLocation && req.body.type === 'Multi-Location') ||
			(!res.locals.bay.allowsClearance && req.body.type === 'Clearance') ||
			(!res.locals.bay.allowsDisplay && req.body.type === 'Display') ||
			(!res.locals.bay.allowsOverstock && req.body.type === 'Overstock') ||
			(!res.locals.bay.allowsTopstock && req.body.type === 'Topstock') ||
			(!res.locals.bay.allowsStockroom && req.body.type == 'Stockroom')	
		) res.sendStatus(422);
		else {
			const newAssignment = new Assignment({ bay: res.locals.bay._id, product: res.locals.product._id, type: req.body.type });
			newAssignment.save().then(async (doc: IAssignment) => {
				await newAssignment.populate({ path: 'bay', model: 'Bay', populate: { path: 'aisle', model: 'Aisle', populate: { path: 'site', model: 'Site' } } }).execPopulate();
				await newAssignment.populate('product').execPopulate();
				res.status(201).send(doc);
			}, (error: Error & { name: string }) => {
				if (error.name === 'ValidationError') res.sendStatus(400);
				else send500(res, error);
			});
		}
	} catch (error) {
		send500(res, error);
	}
};

export const getAssignmentsByLocation = async (req: Request, res: Response): Promise<void> => {
	try {
		if (['Multi-Location', 'Display', 'Clearance', 'Topstock', 'Overstock', 'Stockroom'].indexOf(req.params.type) === -1) res.sendStatus(400);
		else Assignment.find({ bay: res.locals.bay._id, type: req.params.type }).populate({ path: 'bay product', populate: { path: 'aisle', populate: { path: 'site' } } }).then((docs: IAssignment[]) => {
			res.send(docs);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getAssignmentsByProduct = async (req: Request, res: Response): Promise<void> => {
	try {
		Assignment.find({ product: res.locals.product._id })
			.populate('product')
			.populate({ path: 'bay', model: 'Bay', populate: { path: 'aisle', model: 'Aisle', populate: { path: 'site', model: 'Site', match: { _id: res.locals.site._id } } } })
			.then((docs: IAssignment[]) => {
				res.send(docs.filter((x: IAssignment) => x.bay.aisle.site !== null));
			}, (error: Error) => {
				send500(res, error);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
	try {
		const doc = await Assignment.findOne({ bay: res.locals.bay._id, product: res.locals.product._id, type: req.params.type });
		if (doc) {
			await doc.remove();
			res.sendStatus(204);
		}
		else res.sendStatus(422);
	} catch (error) {
		send500(res, error);
	}
};
