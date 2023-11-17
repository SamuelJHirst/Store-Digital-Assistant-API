import { Document, Schema, model } from 'mongoose';
import { Product } from './Product';
import { Aisle } from './Location';
import { AuditLog } from './AuditLog';
import { Collection } from './Collection';
import { Delivery } from './Delivery';
import { ModuleInstance } from './ModuleInstance';
import { ProductQuantity } from './ProductQuantity';
import { User } from './User';

export interface ISite extends Document {
	name: string;
	code: string;
}

const siteSchema = new Schema({
	name: { type: String, required: true },
	code: { type: Number, required: true, min: 1000, max: 9999, unique: true },
	type: { type: String, required: true, enum: ['Store', 'Supplier', 'Distribution Centre'] }
}, { versionKey: false });

siteSchema.post('save', (doc) => {
	Product.find({}, async (err, products) => {
		products.forEach(async product => {
			const newProductQuantity = new ProductQuantity({
				product: product._id,
				site: doc._id,
				quantity: 0
			});
			await newProductQuantity.save();
		});
	});
});

siteSchema.post('remove', (doc) => {
	Aisle.find({ site: doc._id }, async (err, aisles) => {
		aisles.forEach(async aisle => {
			aisle.remove();
		});
	});
	AuditLog.find({ site: doc._id }, async (err, logs) => {
		logs.forEach(async log => {
			log.remove();
		});
	});
	Collection.find({ site: doc._id }, async (err, collections) => {
		collections.forEach(async collection => {
			collection.remove();
		});
	});
	Delivery.find({ '$or': [ { inbound: doc._id }, { outbound: doc._id } ] }, async (err, deliveries) => {
		deliveries.forEach(async delivery => {
			delivery.remove();
		});
	});
	ModuleInstance.find({ site: doc._id }, async (err, instances) => {
		instances.forEach(async instance => {
			instance.remove();
		});
	});
	ProductQuantity.find({ site: doc._id }, async (err, quantities) => {
		quantities.forEach(async quantity => {
			quantity.remove();
		});
	});
	User.find({ site: doc._id }, async (err, users) => {
		users.forEach(async user => {
			user.remove();
		});
	});
});

export const Site = model<ISite>('Site', siteSchema);