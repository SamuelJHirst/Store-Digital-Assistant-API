import { Document, Schema, model } from 'mongoose';
import { Assignment, IAssignment } from './Assignment';
import { Collection, ICollection, ICollectionProduct } from './Collection';
import { Delivery, IDelivery, IDeliveryProduct } from './Delivery';
import { Module, IModuleProduct, IModule } from './Module';
import { IProductQuantity, ProductQuantity } from './ProductQuantity';
import { IReview, Review } from './Review';
import { ISite, Site } from './Site';

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
	Site.find({}, async (err: Error, sites: ISite[]) => {
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

productSchema.post('deleteOne', (doc) => {
	Assignment.find({ product: doc._id }, async (err: Error, assignments: IAssignment[]) => {
		assignments.forEach(async assignment => {
			assignment.deleteOne();
		});
	});
	Collection.find({ 'products.product': doc._id }, async (err: Error, collections: ICollection[]) => {
		collections.forEach(async collection => {
			if (collection.products) {
				collection.products = collection.products.filter((x: ICollectionProduct) => x.product.toString() !== doc._id.toString());
				collection.save();
			}
		});
	});
	Delivery.find({ 'products.product': doc._id }, async (err: Error, deliveries: IDelivery[]) => {
		deliveries.forEach(async delivery => {
			if (delivery.products) {
				delivery.products = delivery.products.filter((x: IDeliveryProduct) => x.product.toString() !== doc._id.toString());
				delivery.save();
			}
		});
	});
	Module.find({ 'products.product': doc._id }, async (err: Error, modules: IModule[]) => {
		modules.forEach(async module => {
			if (module.products) {
				module.products = module.products.filter((x: IModuleProduct) => x.product.toString() !== doc._id.toString());
				module.save();
			}
		});
	});
	ProductQuantity.find({ product: doc._id }, async (err: Error, quantities: IProductQuantity[]) => {
		quantities.forEach(async quantity => {
			quantity.deleteOne();
		});
	});
	Review.find({ product: doc._id }, async (err: Error, reviews: IReview[]) => {
		reviews.forEach(async review => {
			review.deleteOne();
		});
	});
});

export const Product = model <IProduct>('Product', productSchema);