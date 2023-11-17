import { Request, Response } from 'express';
import { Review, IReview } from '../entities/Review';
import { send500 } from '../helpers/responses';

export const addReview = async (req: Request, res: Response): Promise<void> => {
	try {
		const newReview = new Review({
			customer: res.locals.customer,
			product: res.locals.product,
			rating: req.body.rating,
			review: req.body.review,
			timestamp: Date.now()
		});
		newReview.populate('product').execPopulate();
		newReview.populate({ path: 'customer', select: '_id title firstName lastName customerNumber' }).execPopulate();
		newReview.save().then((doc: IReview) => {
			res.status(201).send(doc);
		}, (error: Error & { name: string, code: number }) => {
			if (error.name === 'ValidationError' || error.name === 'Cast Error') res.sendStatus(404);
			else send500(res, error);
		});
	} catch (error) {
		send500(res, error);
	}
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
	try {
		Review.find({ product: res.locals.product._id }, { _id: 0, __v: 0 })
			.populate('customer', '_ id title firstName lastName customerNumber')
			.populate('product')
			.then((docs: IReview[]) => {
				res.send(docs);
			}, (error: Error & { name: string }) => {
				if (error.name === 'CastError') res.sendStatus(404);
				else send500(res, error);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const getCustomerReviews = async (req: Request, res: Response): Promise<void> => {
	try {
		Review.find({ customer: res.locals.customer._id })
			.populate('customer', '_id title firstName lastName customerNumber')
			.populate('product')
			.then((docs: IReview[]) => {
				res.send(docs);
			}, (error: Error & { name: string }) => {
				if (error.name === 'CastError') res.sendStatus(404);
				else send500(res, error);
			});
	} catch (error) {
		send500(res, error);
	}
};

export const deleteReviews = async (req: Request, res: Response): Promise<void> => {
	try {
		Review.deleteMany({ customer: res.locals.customer._id, product: res.locals.product._id }).then(() => {
			res.sendStatus(204);
		});
	}
	catch (error) {
		send500(res, error);
	}
};