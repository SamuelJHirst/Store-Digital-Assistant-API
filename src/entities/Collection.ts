import { Document, Schema, model } from 'mongoose';
import { config } from '../helpers/config';
import { Counter, ICounter } from './Counter';
import { ICustomer } from './Customer';
import { IProduct } from './Product';
import { ISite } from './Site';

export interface ICollectionProduct extends Document {
	product: IProduct['_id'];
	quantityOrdered: number;
	quantityPicked: number;
}

export interface ICollection extends Document {
	collectionNumber: number;
	customer: ICustomer['_id'];
	status: string;
	site: ISite['_id'];
	products: ICollectionProduct[];
	placedAt: Date;
}

const collectionProductSchema = new Schema({
	product: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
	quantityOrdered: { type: Number, required: true },
	quantityPicked: { type: Number, required: true }
}, { versionKey: false });

const collectionSchema = new Schema({
	collectionNumber: { type: Number, min: 2000000000, max: 2999999999, required: true },
	customer: { type: Schema.Types.ObjectId, required: true, ref: 'Customer' },
	status: { type: String, required: true, enum: ['Not Started', 'In Progress', 'Awaiting Collection', 'Collected'] },
	site: { type: Schema.Types.ObjectId, required: true, ref: 'Site' },
	products: [collectionProductSchema],
	placedAt: { type: Date, required: true }
}, { versionKey: false });

collectionSchema.pre('validate', async function() {
	if (this.isNew) {
		const doc = this as ICollection;
		const counter = await Counter.findByIdAndUpdate(config.collectionCounter, { $inc: { seq: 1 } }) as ICounter;
		doc.collectionNumber = counter.seq;
	}
});

export const Collection = model <ICollection>('Collection', collectionSchema);
export const CollectionProduct = model <ICollectionProduct>('CollectionProduct', collectionProductSchema);