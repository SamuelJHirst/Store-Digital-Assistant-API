import { Document, Schema, model } from 'mongoose';
import { ISite } from './Site';
import { IUser } from './User';

export interface IAuditLog extends Document {
	site: ISite['_id'];
	user: IUser['_id'];
	action: string;
	timestamp: Date;
}

const auditLogSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	site: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
	action: { type: String, required: true },
	timestamp: { type: Date, required: true }
}, { versionKey: false });

export const AuditLog = model <IAuditLog>('AuditLog', auditLogSchema);