import { Request, Response } from 'express';
import { Product, IProduct, IProductInfo } from '../entities/Product';
import { ProductQuantity, IProductQuantity } from '../entities/ProductQuantity';
import { send500 } from '../helpers/responses';

class ProductUpdate {
	name?: string;
	price?: number;
	status?: string;
	description?: string;
	ageRestricted?: boolean;
	info?: Array<IProductInfo>;
}

class ProductQuantityUpdate {
	'$set'?: { quantity: number };
	'$inc'?: { quantity: number };
}

export const addProduct = async (req: Request, res: Response): Promise<void> => {
	try {
		const newProduct = new Product(req.body);
		newProduct.save().then((doc: IProduct) => {
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

export const getProduct = async (req: Request, res: Response): Promise<void> => {
	try {
		Product.findOne({ ean: req.params.product }).then((doc: IProduct | null) => {
			if (!doc) res.sendStatus(404);
			else res.send(doc);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
	try {
		Product.find({}).then((docs: IProduct[] | null) => {
			res.send(docs);
		}, (error: Error) => {
			send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
	try {
		const update = new ProductUpdate();
		if (req.body.name) update.name = req.body.name;
		if (req.body.price) update.price = req.body.price;
		if (req.body.status) update.status = req.body.status;
		if (req.body.description) update.description = req.body.description;
		if (req.body.ageRestricted) update.ageRestricted = req.body.ageRestricted;
		if (req.body.info) update.info = req.body.info;
		if (Object.keys(update).length === 0) res.sendStatus(400);
		else Product.findOneAndUpdate({ ean: req.params.product }, { '$set': update }, { new: true, runValidators: true }).then((doc: IProduct | null) => {
			if (!doc) res.sendStatus(404);
			else res.send(doc);
		}, (error: Error & { name: string }) => {
			if (error.name === 'ValidationError' || error.name === 'CastError') res.sendStatus(400);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
	try {
		const doc = await Product.findOne({ ean: req.params.product });
		if (doc) {
			await doc.remove();
			res.sendStatus(204);
		}
		else res.sendStatus(404);
	} catch (error) {
		send500(res, error);
	}
};

export const getQuantity = async (req: Request, res: Response): Promise<void> => {
	try {
		ProductQuantity.findOne({ site: res.locals.site._id, product: res.locals.product._id })
			.populate({ path: 'site'})
			.populate({ path: 'product'})
			.then((doc: IProductQuantity | null) => {
				if (!doc) res.sendStatus(404);
				else res.send(doc);
			}, (error: Error) => {
				send500(res, error);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const setQuantity = async (req: Request, res: Response): Promise<void> => {
	try {
		if (Object.keys(req.body).length === 0) res.sendStatus(400);
		else {
			const update = {} as ProductQuantityUpdate;
			if (req.body.method === 'increment') update['$inc'] = { quantity: req.body.quantity };
			else if (req.body.method === 'decrement') update['$inc'] = { quantity: (0 - req.body.quantity) };
			else update['$set'] = { quantity: req.body.quantity };
			ProductQuantity.findOneAndUpdate({ site: res.locals.site._id, product: res.locals.product._id }, update, { new: true })
				.populate({ path: 'site'})
				.populate({ path: 'product'})
				.then((doc: IProductQuantity | null) => {
					if (!doc) res.sendStatus(404);
					else res.send(doc);
				}, (error: Error & { name: string }) => {
					if (error.name === 'CastError') res.sendStatus(400);
					else send500(res, error);
				});
		}
	} catch (error) {
		send500(res, error);
	}
};