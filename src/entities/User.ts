import { Document, Schema, model } from 'mongoose';
import { AuditLog, IAuditLog } from './AuditLog';
import { ISite } from './Site';

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	username: string;
	password: string;
	userType: string;
	site: ISite['_id'];
}

const userSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	userType: { type: String, required: true, enum: ['Admin', 'Manager', 'Salesperson'] },
	site: { type: Schema.Types.ObjectId, required: true, ref: 'Site' }
}, { versionKey: false });

userSchema.post('deleteOne', (doc) => {
	AuditLog.find({ user: doc._id }, async (err: Error, logs: IAuditLog[]) => {
		logs.forEach(async log => {
			log.deleteOne();
		});
	});
});

export const User = model<IUser>('User', userSchema);