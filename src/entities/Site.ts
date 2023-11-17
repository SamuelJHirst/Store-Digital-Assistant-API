import { Document, Schema, model } from 'mongoose';
import { IProduct, Product } from './Product';
import { AuditLog, IAuditLog } from './AuditLog';
import { Collection, ICollection } from './Collection';
import { Delivery, IDelivery } from './Delivery';
import { Aisle, IAisle } from './Location';
import { IModuleInstance, ModuleInstance } from './ModuleInstance';
import { IProductQuantity, ProductQuantity } from './ProductQuantity';
import { IUser, User } from './User';

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
	Product.find({}, async (err: Error, products: IProduct[]) => {
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

siteSchema.post('deleteOne', (doc) => {
	Aisle.find({ site: doc._id }, async (err: Error, aisles: IAisle[]) => {
		aisles.forEach(async aisle => {
			aisle.deleteOne();
		});
	});
	AuditLog.find({ site: doc._id }, async (err: Error, logs: IAuditLog[]) => {
		logs.forEach(async log => {
			log.deleteOne();
		});
	});
	Collection.find({ site: doc._id }, async (err: Error, collections: ICollection[]) => {
		collections.forEach(async collection => {
			collection.deleteOne();
		});
	});
	Delivery.find({ '$or': [ { inbound: doc._id }, { outbound: doc._id } ] }, async (err: Error, deliveries: IDelivery[]) => {
		deliveries.forEach(async delivery => {
			delivery.deleteOne();
		});
	});
	ModuleInstance.find({ site: doc._id }, async (err: Error, instances: IModuleInstance[]) => {
		instances.forEach(async instance => {
			instance.deleteOne();
		});
	});
	ProductQuantity.find({ site: doc._id }, async (err: Error, quantities: IProductQuantity[]) => {
		quantities.forEach(async quantity => {
			quantity.deleteOne();
		});
	});
	User.find({ site: doc._id }, async (err: Error, users: IUser[]) => {
		users.forEach(async user => {
			user.deleteOne();
		});
	});
});

export const Site = model<ISite>('Site', siteSchema);