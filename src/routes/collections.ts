import { Router } from 'express';
import * as collectionController from '../controllers/collectionController';
import { isUser } from '../middleware/auth';
import { getSite } from '../middleware/getSite';
import { getCustomer } from '../middleware/getCustomer';
import { send405 } from '../helpers/responses';

const router = Router();

router.route('/collections')
	.post(isUser, getSite, getCustomer, collectionController.addCollection)
	.all(send405);
router.route('/collections/:collection')
	.get(isUser, collectionController.getCollection)
	.patch(isUser, collectionController.updateCollection)
	.delete(isUser, collectionController.deleteCollection)
	.all(send405);

export const collectionRoutes = router;