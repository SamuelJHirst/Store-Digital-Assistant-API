import { Router } from 'express';
import * as moduleController from '../controllers/moduleController';
import { isAdmin } from '../middleware/auth';
import { getProduct } from '../middleware/getProduct';
import { send405 } from '../helpers/responses';

const router = Router();

router.route('/modules')
	.post(isAdmin, moduleController.addModule)
	.get(moduleController.getAllModules)
	.all(send405);
router.route('/modules/:module')
	.get(moduleController.getModule)
	.patch(isAdmin, moduleController.updateModule)
	.delete(isAdmin, moduleController.deleteModule)
	.all(send405);
router.route('/modules/:module/products')
	.post(isAdmin, getProduct, moduleController.addModuleProduct)
	.all(send405);
router.route('/modules/:module/products/:sequence')
	.delete(isAdmin, moduleController.deleteModuleProduct)
	.all(send405);

export const moduleRoutes = router;