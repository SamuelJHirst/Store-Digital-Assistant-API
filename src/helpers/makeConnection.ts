import { connect } from 'mongoose';
import { config } from './config';
import { init } from './init';

export function makeConnection(): void {
	connect(config.dbURI, {}).then(() => {
		init();
		console.log('Successfully Connected to Database');
	}).catch((error) => {
		throw error;
	});
}