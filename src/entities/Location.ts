import { Document, Schema, model } from 'mongoose';
import { Assignment, IAssignment } from './Assignment';
import { IModuleInstance, ModuleInstance } from './ModuleInstance';
import { ISite } from './Site';

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

aisleSchema.post('deleteOne', (doc) => {
	Bay.find({ aisle: doc._id }, async (err: Error, bays: IBay[]) => {
		bays.forEach(async bay => {
			bay.deleteOne();
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

baySchema.post('deleteOne', (doc) => {
	Assignment.find({ bay: doc._id }, async (err: Error, assignments: IAssignment[]) => {
		assignments.forEach(async assignment => {
			assignment.deleteOne();
		});
	});
	ModuleInstance.find({ bay: doc._id }, async (err: Error, instances: IModuleInstance[]) => {
		instances.forEach(async instance => {
			instance.deleteOne();
		});
	});
});

export const Bay = model<IBay>('Bay', baySchema);