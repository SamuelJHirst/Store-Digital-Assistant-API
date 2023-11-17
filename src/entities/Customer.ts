import { Document, Schema, model } from 'mongoose';
import { config } from '../helpers/config';
import { Collection, ICollection } from './Collection';
import { Counter, ICounter } from './Counter';
import { IReview, Review } from './Review';

export interface ICustomer extends Document {
	customerNumber: ICounter['seq'];
	title: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	addressNumberName: string;
	addressStreet1: string;
	addressStreet2: string;
	addressCity: string;
	addressPostcode: string;
	mobilePhone: string;
}

const customerSchema = new Schema({
	customerNumber: { type: Number, min: 1000000000, max: 1999999999, required: true, unique: true },
	title: { type: String, required: true, enum: ['Mr', 'Miss', 'Ms', 'Mrs', 'Mx'] },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	addressNumberName: { type: String, required: true },
	addressStreet1: { type: String, required: true },
	addressStreet2: { type: String },
	addressCity: { type: String, required: true },
	addressPostcode: { type: String, required: true },
	mobilePhone: { type: String, required: true }
}, { versionKey: false });

customerSchema.pre('validate', async function() {
	if (this.isNew) {
		const doc = this as ICustomer;
		const counter = await Counter.findByIdAndUpdate(config.customerCounter, { $inc: { seq: 1 } }) as ICounter;
		doc.customerNumber = counter.seq;
	}
});

customerSchema.post('deleteOne', (doc) => {
	Collection.find({ customer: doc._id }, async (err: Error, collections: ICollection[]) => {
		collections.forEach(async collection => {
			collection.deleteOne();
		});
	});
	Review.find({ customer: doc._id }, async (err: Error, reviews: IReview[]) => {
		reviews.forEach(async review => {
			review.deleteOne();
		});
	});
});

export const Customer = model <ICustomer>('Customer', customerSchema);