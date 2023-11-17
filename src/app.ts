import express, { Router, Request, Response } from 'express';
import { config } from './helpers/config';
import { makeConnection } from './helpers/makeConnection';

import { collectionRoutes } from './routes/collections';
import { customerRoutes } from './routes/customers';
import { deliveryRoutes } from './routes/deliveries';
import { locationRoutes } from './routes/locations';
import { logRoutes } from './routes/logs';
import { moduleRoutes } from './routes/modules';
import { productRoutes } from './routes/products';
import { userRoutes } from './routes/users';

const app = express();
const router = Router();
app.use(express.json());
app.use('/api', router);
makeConnection();

router.head('/', async (req: Request, res: Response) => {
	res.sendStatus(204);
});

app.all('*', async (req: Request, res: Response) => {
	res.sendStatus(404);	
});

router.use(collectionRoutes);
router.use(customerRoutes);
router.use(deliveryRoutes);
router.use(locationRoutes);
router.use(logRoutes);
router.use(moduleRoutes);
router.use(productRoutes);
router.use(userRoutes);

app.listen(config.port, () => {
	console.log(`Listening on Port ${config.port}`);
});