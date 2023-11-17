import { Router } from 'express';
import * as deliveryController from '../controllers/deliveryController';
import { isUser } from '../middleware/auth';
import { send405 } from '../helpers/responses';

const router = Router();

router.route('/deliveries')
	.post(isUser, deliveryController.addDelivery)
	.all(send405);
router.route('/deliveries/:delivery')
	.get(isUser, deliveryController.getDelivery)
	.patch(isUser, deliveryController.updateDelivery)
	.delete(isUser, deliveryController.deleteDelivery)
	.all(send405);

export const deliveryRoutes = router;