import { Router } from 'express';
import * as collectionController from '../controllers/collectionController';
import * as customerController from '../controllers/customerController';
import * as reviewController from '../controllers/reviewController';
import { isUser } from '../middleware/auth';
import { getCustomer } from '../middleware/getCustomer';
import { send405 } from '../helpers/responses';

const router = Router();

router.route('/customers')
	.post(isUser, customerController.addCustomer)
	.all(send405);
router.route('/customers/:customer')
	.get(isUser, customerController.getCustomer)
	.patch(isUser, customerController.updateCustomer)
	.delete(isUser, customerController.deleteCustomer)
	.all(send405);
router.route('/customers/:customer/collections')
	.get(isUser, getCustomer, collectionController.getCollectionsForCustomer)
	.all(send405);
router.route('/customers/:customer/reviews')
	.get(getCustomer, reviewController.getCustomerReviews)
	.all(send405);

export const customerRoutes = router;