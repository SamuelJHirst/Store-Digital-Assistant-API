import { Document, Schema, model } from 'mongoose';
import { config } from '../helpers/config';
import { Counter, ICounter } from './Counter';
import { IProduct } from './Product';
import { ISite } from './Site';

export interface IDeliveryProduct extends Document {
	product: IProduct['_id'];
	quantity: number;
}

export interface IDelivery extends Document {
	deliveryNumber: number;
	outbound: ISite['_id'];
	inbound: ISite['_id'];
	status: string;
	products: IDeliveryProduct[];
	arrivesAt: Date;
}

const deliveryProductSchema = new Schema({
	product: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
	quantity: { type: Number, required: true }
}, { versionKey: false });

const deliverySchema = new Schema({
	deliveryNumber: { type: Number, min: 3000000000, max: 3999999999, required: true },
	outbound: { type: Schema.Types.ObjectId, required: true, ref: 'Site' },
	inbound: { type: Schema.Types.ObjectId, required: true, ref: 'Site' },
	status: { type: String, required: true, enum: ['Booked', 'In Transit', 'Completed'] },
	products: [deliveryProductSchema],
	arrivesAt: { type: Date, required: true }
}, { versionKey: false });

deliverySchema.pre('validate', async function() {
	if (this.isNew) {
		const doc = this as IDelivery;
		const counter = await Counter.findByIdAndUpdate(config.deliveryCounter, { $inc: { seq: 1 } }) as ICounter;
		doc.deliveryNumber = counter.seq;
	}
});

export const Delivery = model <IDelivery>('Delivery', deliverySchema);
export const DeliveryProduct = model <IDeliveryProduct>('DeliveryProduct', deliveryProductSchema);