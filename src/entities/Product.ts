import { Document, Schema, model } from 'mongoose';
import { Site } from './Site';
import { Assignment } from './Assignment';
import { Collection, ICollectionProduct } from './Collection';
import { Delivery, IDeliveryProduct } from './Delivery';
import { Module, IModuleProduct } from './Module';
import { ProductQuantity } from './ProductQuantity';
import { Review } from './Review';

export interface IProductInfo {
	name: string;
	value: string;
}

export interface IProduct extends Document {
	name: string;
	ean: string;
	price: number;
	status: string;
	description: string;
	ageRestricted: boolean;
	info: Array<IProductInfo>;
}

const productSchema = new Schema({
	name: { type: String, required: true },
	ean: { type: String, required: true, unique: true },
	price: { type: Number, required: true, min: 0 },
	status: { type: String, required: true, enum: ['Live', 'Orders Blocked', 'Discontinued'], default: 'Live' },
	description: { type: String },
	ageRestricted: { type: Boolean, required: true },
	info: [{
		name: { type: String, required: true },
		value: { type: String, required: true } 
	}]
}, { versionKey: false });

productSchema.post('save', (doc) => {
	Site.find({}, async (err, sites) => {
		sites.forEach(async site => {
			const newProductQuantity = new ProductQuantity({
				product: doc._id,
				site: site._id,
				quantity: 0
			});
			await newProductQuantity.save();
		});
	});
});

productSchema.post('remove', (doc) => {
	Assignment.find({ product: doc._id }, async (err, assignments) => {
		assignments.forEach(async assignment => {
			assignment.remove();
		});
	});
	Collection.find({ 'products.product': doc._id }, async (err, collections) => {
		collections.forEach(async collection => {
			if (collection.products) {
				collection.products = collection.products.filter((x: ICollectionProduct) => x.product.toString() !== doc._id.toString());
				collection.save();
			}
		});
	});
	Delivery.find({ 'products.product': doc._id }, async (err, deliveries) => {
		deliveries.forEach(async delivery => {
			if (delivery.products) {
				delivery.products = delivery.products.filter((x: IDeliveryProduct) => x.product.toString() !== doc._id.toString());
				delivery.save();
			}
		});
	});
	Module.find({ 'products.product': doc._id }, async (err, modules) => {
		modules.forEach(async module => {
			if (module.products) {
				module.products = module.products.filter((x: IModuleProduct) => x.product.toString() !== doc._id.toString());
				module.save();
			}
		});
	});
	ProductQuantity.find({ product: doc._id }, async (err, quantities) => {
		quantities.forEach(async quantity => {
			quantity.remove();
		});
	});
	Review.find({ product: doc._id }, async (err, reviews) => {
		reviews.forEach(async review => {
			review.remove();
		});
	});
});

export const Product = model <IProduct>('Product', productSchema);