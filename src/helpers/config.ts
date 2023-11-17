import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
	base: process.env.BASE ?? '',
	port: process.env.PORT ?? 3000,
	dbURI: process.env.DB_URI ?? '',
	jwtSecret: process.env.JWT_SECRET ?? '',
	customerCounter: process.env.CUSTOMER_COUNTER,
	collectionCounter: process.env.COLLECTION_COUNTER,
	deliveryCounter: process.env.DELIVERY_COUNTER
};