import { Router } from 'express';
import * as auditLogController from '../controllers/auditLogController';
import { isUser, isManager } from '../middleware/auth';
import { getSite } from '../middleware/getSite';
import { send405 } from '../helpers/responses';

const router = Router();

router.route('/logs/:site')
	.post(isUser, getSite, auditLogController.addLog)
	.get(isManager, getSite, auditLogController.getLog)
	.all(send405);

export const logRoutes = router;