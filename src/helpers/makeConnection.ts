import { connect } from 'mongoose';
import { config } from './config';
import { init } from './init';

export function makeConnection(): void {
	connect(config.dbURI, {
		useNewUrlParser: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
		useCreateIndex: true
	}, (error: Error | null) => {
		if (error) throw error;
		init();
		console.log('Successfully Connected to Database');
	});
}