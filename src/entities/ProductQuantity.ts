import { Document, Schema, model } from 'mongoose';
import { IProduct } from './Product';
import { ISite } from './Site';

export interface IProductQuantity extends Document {
	module: IProduct['_id'];
	site: ISite['_id'];
	quantity: number;
}

const productQuantitySchema = new Schema({
	product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
	site: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
	quantity: { type: Number, required: true }
}, { versionKey: false });

export const ProductQuantity = model <IProductQuantity>('ProductQuantity', productQuantitySchema);