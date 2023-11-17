import { Document, Schema, model } from 'mongoose';
import { ICustomer } from './Customer';
import { IProduct } from './Product';

export interface IReview extends Document {
	customer: ICustomer['_id'];
	product: IProduct['_id'];
	rating: number;
	review: string;
	timestamp: Date;
}

const reviewSchema = new Schema({
	customer: { type: Schema.Types.ObjectId, required: true, ref: 'Customer' },
	product: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
	rating: { type: Number, required: true, min: 1, max: 5 },
	review: { type: String },
	timestamp: { type: Date, required: true }
}, { versionKey: false });

export const Review = model <IReview>('Review', reviewSchema);