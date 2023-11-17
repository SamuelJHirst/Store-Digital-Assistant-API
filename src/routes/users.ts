import { Router } from 'express';
import * as userController from '../controllers/userController';
import { isAdmin, isUser } from '../middleware/auth';
import { getAuthUser } from '../middleware/getAuthUser';
import { getSite } from '../middleware/getSite';
import { send405 } from '../helpers/responses';

const router = Router();

router.route('/authenticate/')
	.post(userController.authenticate)
	.all(send405);
router.route('/user/')
	.get(getAuthUser, userController.getAuthUser)
	.all(send405);
router.route('/users')
	.post(isAdmin, getSite, userController.addUser)
	.all(send405);
router.route('/users/:username')
	.get(isUser, userController.getUser)
	.patch(isAdmin, userController.updateUser)
	.delete(isAdmin, userController.deleteUser)
	.all(send405);

export const userRoutes = router;