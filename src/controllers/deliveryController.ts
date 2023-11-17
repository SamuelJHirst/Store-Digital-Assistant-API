import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { config } from '../helpers/config';
import { Delivery, IDelivery, DeliveryProduct, } from '../entities/Delivery';
import { Counter } from '../entities/Counter';
import { send500 } from '../helpers/responses';

class DeliveryQuery {
	inbound?: number;
	outbound?: number;
}

export const addDelivery = async (req: Request, res: Response): Promise<void> => {
	try {
		axios.get(`${config.base}/locations/${req.body.outbound}`).then((response: AxiosResponse) => {
			const outbound = response.data;
			axios.get(`${config.base}/locations/${req.body.inbound}`).then(async (response: AxiosResponse) => {
				const inbound = response.data;
				const newDelivery = new Delivery({
					status: 'Booked',
					inbound: inbound._id,
					outbound: outbound._id,
					arrivesAt: req.body.arrivesAt,
					products: []
				});
				for (const product of req.body.products) {
					const response = await axios.get(`${config.base}/products/${product.product}`).catch(() => { return; });
					if (response && product.quantity > 0) {
						const newDeliveryProduct = new DeliveryProduct({
							product: response.data._id,
							quantity: product.quantity
						});
						newDelivery.products.push(newDeliveryProduct);
					}
				}
				if (newDelivery.products.length === 0) res.sendStatus(400);
				else newDelivery.save().then(async (doc: IDelivery) => {
					await doc.populate('inbound outbound products.product').execPopulate();
					res.status(201).send(doc);
				}, async (error: Error & { name: string, code: number }) => {
					await Counter.findByIdAndUpdate(config.deliveryCounter, { $inc: { seq: -1 } });
					if (error.code === 11000) res.sendStatus(409);
					else if (error.name === 'ValidationError' || error.name === 'CastError') res.sendStatus(400);
					else send500(res, error);
				});
			}).catch((error: Error & { response: { status: number } }) => {
				if (error.response.status === 404 || error.response.status === 400) res.sendStatus(400);
				else send500(res, error);
			});
		}).catch((error: Error & { response: { status: number } }) => {
			if (error.response.status === 404 || error.response.status === 400) res.sendStatus(400);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getDelivery = async (req: Request & { params: { delivery: number } }, res: Response): Promise<void> => {
	try {
		Delivery.findOne({ deliveryNumber: req.params.delivery })
			.populate('inbound')
			.populate('outbound')
			.populate('products.product')
			.then((doc: IDelivery | null) => {
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

export const getDeliveriesForSite = async (req: Request, res: Response): Promise<void> => {
	try {
		const query = {} as DeliveryQuery;
		if (req.params.type === 'inbound') query.inbound = res.locals.site._id;
		else query.outbound = res.locals.site._id;
		Delivery.find(query)
			.populate('inbound')
			.populate('outbound')
			.populate('products.product')
			.then((docs: IDelivery[]) => {
				res.send(docs);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const getProductDeliveriesForSite = async (req: Request, res: Response): Promise<void> => {
	try {
		Delivery.find({ inbound: res.locals.site._id })
			.populate('inbound')
			.populate('outbound')
			.populate('products.product')
			.then((docs: IDelivery[]) => {
				docs = (docs ?? []).filter(x => { return x.products.map((y: & { product: { ean: string } }) => { return y.product.ean; }).indexOf(req.params.ean) > -1; });
				res.send(docs);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const updateDelivery = async (req: Request & { params: { delivery: number } }, res: Response): Promise<void> => {
	try {
		Delivery.findOneAndUpdate({ deliveryNumber: req.params.delivery }, { '$set': { status: req.body.status } }, { new: true }).then(async (doc: IDelivery | null) => {
			if (!doc) res.sendStatus(404);
			else {
				await doc.populate('inbound outbound products.product').execPopulate();
				res.send(doc);
			}
		}, (error: Error & { name: string }) => {
			if (error.name === 'ValidationError' || error.name === 'CastError') res.sendStatus(400);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteDelivery = async (req: Request & { params: { delivery: number } }, res: Response): Promise<void> => {
	try {
		Delivery.findOne({ deliveryNumber: req.params.delivery }).then(async (doc: IDelivery | null) => {
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