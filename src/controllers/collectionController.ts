import { Request, Response } from 'express';
import axios from 'axios';
import { config } from '../helpers/config';
import { Collection, ICollection, CollectionProduct, } from '../entities/Collection';
import { Counter } from '../entities/Counter';
import { send500 } from '../helpers/responses';

export const addCollection = async (req: Request, res: Response): Promise<void> => {
	try {
		const newCollection = new Collection({
			site: res.locals.site._id,
			status: 'Not Started',
			customer: res.locals.customer._id,
			placedAt: new Date(),
			products: []
		});
		for (const product of req.body.products) {
			const response = await axios.get(`${config.base}/products/${product.product}`).catch(() => { return; });
			if (response && product.quantity > 0) {
				const newCollectionProduct = new CollectionProduct({
					product: response.data._id,
					quantityOrdered: product.quantity,
					quantityPicked: 0
				});
				newCollection.products.push(newCollectionProduct);
			}
		}
		if (newCollection.products.length === 0) res.sendStatus(400);
		else newCollection.save().then(async (doc: ICollection) => {
			await doc.populate('site products.product');
			await doc.populate({ path: 'customer', select: '_id title firstName lastName customerNumber'});
			res.status(201).send(doc);
		}, async (error: Error & { name: string, code: number }) => {
			await Counter.findByIdAndUpdate(config.collectionCounter, { $inc: { seq: -1 } });
			if (error.code === 11000) res.sendStatus(409);
			else if (error.name === 'ValidationError') res.sendStatus(400);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getCollection = async (req: Request & { params: { collection: number } }, res: Response): Promise<void> => {
	try {
		Collection.findOne({ collectionNumber: req.params.collection })
			.populate('site')
			.populate('customer', '_id title firstName lastName customerNumber')
			.populate('products.product')
			.then((doc: ICollection | null) => {
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

export const getCollectionsForCustomer = async (req: Request, res: Response): Promise<void> => {
	try {
		Collection.find({ customer: res.locals.customer._id })
			.populate('site')
			.populate('customer', '_id title firstName lastName customerNumber')
			.populate('products.product')
			.then((docs: ICollection[]) => {
				res.send(docs);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const getCollectionsAtSite = async (req: Request, res: Response): Promise<void> => {
	try {
		Collection.find({ site: res.locals.site._id })
			.populate('site')
			.populate('customer', '_id title firstName lastName customerNumber')
			.populate('products.product')
			.then((docs: ICollection[]) => {
				res.send(docs);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const updateCollection = async (req: Request & { params: { collection: number } }, res: Response): Promise<void> => {
	try {
		Collection.findOne({ collectionNumber: req.params.collection }).populate('products.product').then(async (doc: ICollection | null) => {
			if (!doc) res.sendStatus(400);
			else if (!req.body.products && !req.body.status) res.sendStatus(400);
			else {
				if (req.body.products && req.body.products.length > 0) {
					for (const product of req.body.products) {
						const response = await axios.get(`${config.base}/products/${product.product}`).catch(() => { return; });
						if (response && product.quantity >= 0) {
							const index = doc.products.map((x) => { return x.product._id; }).indexOf(response.data._id);
							if (product.quantity > doc.products[index].quantityOrdered) doc.products[index].quantityPicked = doc.products[index].quantityOrdered;
							else doc.products[index].quantityPicked = product.quantity;
						}
					}
				}
				if (['Not Started', 'In Progress', 'Awaiting Collection', 'Collected'].indexOf(req.body.status) > -1) doc.status = req.body.status;
				doc.save();
				await doc.populate('site products.product');
				await doc.populate({ path: 'customer', select: '_id title firstName lastName customerNumber'});
				res.send(doc);
			}
		});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteCollection = async (req: Request & { params: { collection: number } }, res: Response): Promise<void> => {
	try {
		Collection.findOne({ collectionNumber: req.params.collection }).then(async (doc: ICollection | null) => {
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