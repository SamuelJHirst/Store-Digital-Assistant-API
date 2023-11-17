import { Document, Schema, model } from 'mongoose';
import { IModule } from './Module';
import { ISite } from './Site';
import { IBay } from './Location';

export interface IModuleInstance extends Document {
	module: IModule['_id'];
	site: ISite['_id'];
	bay: IBay['_id'];
}

const moduleInstanceSchema = new Schema({
	module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
	site: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
	bay: { type: Schema.Types.ObjectId, ref: 'Bay' }
}, { versionKey: false });

export const ModuleInstance = model <IModuleInstance>('ModuleInstance', moduleInstanceSchema);