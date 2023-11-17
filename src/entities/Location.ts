import { Document, Schema, model } from 'mongoose';
import { ISite } from './Site';
import { Assignment } from './Assignment';
import { ModuleInstance } from './ModuleInstance';

export interface IAisle extends	Document {
	name: string;
	aisle: number;
	site: ISite['_id'];
}

const aisleSchema = new Schema({
	name: { type: String, required: true },
	aisle: { type: Number, required: true },
	site: { type: Schema.Types.ObjectId, required: true, ref: 'Site' }
}, { versionKey: false });

aisleSchema.post('remove', (doc) => {
	Bay.find({ aisle: doc._id }, async (err, bays) => {
		bays.forEach(async bay => {
			bay.remove();
		});
	});
});

export const Aisle = model<IAisle>('Aisle', aisleSchema);

export interface IBay extends Document {
	bay: number;
	aisle: IAisle['_id'];
	moduleLimit: number;
	allowsMultiLocation: boolean;
	allowsClearance: boolean;
	allowsDisplay: boolean;
	allowsOverstock: boolean;
	allowsTopstock: boolean;
	allowsStockroom: boolean;
}

const baySchema = new Schema({
	bay: { type: Number, required: true },
	aisle: { type: Schema.Types.ObjectId, required: true, ref: 'Aisle' },
	moduleLimit: { type: Number, min: -1, required: true },
	allowsMultiLocation: { type: Boolean, required: true },
	allowsClearance: { type: Boolean, required: true },
	allowsDisplay: { type: Boolean, required: true },
	allowsOverstock: { type: Boolean, required: true },
	allowsTopstock: { type: Boolean, required: true },
	allowsStockroom: { type: Boolean, required: true }
}, { versionKey: false });

baySchema.post('remove', (doc) => {
	Assignment.find({ bay: doc._id }, async (err, assignments) => {
		assignments.forEach(async assignment => {
			assignment.remove();
		});
	});
	ModuleInstance.find({ bay: doc._id }, async (err, instances) => {
		instances.forEach(async instance => {
			instance.remove();
		});
	});
});

export const Bay = model<IBay>('Bay', baySchema);