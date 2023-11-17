import { Router } from 'express';
import * as assignmentController from '../controllers/assignmentController';
import * as collectionController from '../controllers/collectionController';
import * as deliveryController from '../controllers/deliveryController';
import * as locationController from '../controllers/locationController';
import * as moduleInstanceController from '../controllers/moduleInstanceController';
import * as siteController from '../controllers/siteController';
import { isUser, isManager, isAdmin } from '../middleware/auth';
import { getAisle } from '../middleware/getAisle';
import { getBay } from '../middleware/getBay';
import { getModule } from '../middleware/getModule';
import { getProduct } from '../middleware/getProduct';
import { getSite } from '../middleware/getSite';
import { send405 } from '../helpers/responses';

const router = Router();

router.route('/locations')
	.post(isAdmin, siteController.addSite)
	.get(siteController.getAllSites)
	.all(send405);
router.route('/locations/:site')
	.get(siteController.getSite)
	.patch(isAdmin, siteController.updateSite)
	.delete(isAdmin, siteController.deleteSite)
	.all(send405);
router.route('/locations/:site/aisles')
	.post(isManager, getSite, locationController.addAisle)
	.get(getSite, locationController.getAllAislesAtSite)
	.all(send405);
router.route('/locations/:site/aisles/:aisle')
	.get(getSite, locationController.getAisle)
	.patch(isManager, getSite, locationController.updateAisle)
	.delete(isManager, getSite, locationController.deleteAisle)
	.all(send405);
router.route('/locations/:site/aisles/:aisle/bays')
	.post(isManager, getAisle, locationController.addBay)
	.get(getAisle, locationController.getAllBaysInAisle)
	.all(send405);
router.route('/locations/:site/aisles/:aisle/bays/:bay')
	.get(getAisle, locationController.getBay)
	.patch(isManager, getAisle, locationController.updateBay)
	.delete(isManager, getAisle, locationController.deleteBay)
	.all(send405);
router.route('/locations/:site/aisles/:aisle/bays/:bay/assignments')
	.post(isUser, getBay, getProduct, assignmentController.addAssignment)
	.all(send405);
router.route('/locations/:site/aisles/:aisle/bays/:bay/assignments/:type')
	.get(getBay, assignmentController.getAssignmentsByLocation)
	.all(send405);
router.route('/locations/:site/aisles/:aisle/bays/:bay/assignments/:type/:product')
	.delete(isUser, getBay, getProduct, assignmentController.deleteAssignment)
	.all(send405);
router.route('/locations/:site/aisles/:aisle/bays/:bay/modules')
	.post(isUser, getBay, getModule, moduleInstanceController.addModuleToBay)
	.get(getBay, moduleInstanceController.getModulesInBay)
	.all(send405);	  
router.route('/locations/:site/aisles/:aisle/bays/:bay/modules/:module')
	.delete(isUser, getSite, getModule, moduleInstanceController.deleteModuleFromBay)
	.all(send405);
router.route('/locations/:site/collections')
	.get(isUser, getSite, collectionController.getCollectionsAtSite)
	.all(send405);
router.route('/locations/:site/deliveries/:type(inbound|outbound)')
	.get(isUser, getSite, deliveryController.getDeliveriesForSite)
	.all(send405);
router.route('/locations/:site/modules/')
	.post(isAdmin, getSite, getModule, moduleInstanceController.addModuleToSite)
	.get(getSite, moduleInstanceController.getModulesAtSite)
	.all(send405);
router.route('/locations/:site/modules/:module')
	.get(getSite, getModule, moduleInstanceController.getModuleAtSite)
	.delete(isAdmin, getSite, getModule, moduleInstanceController.deleteModuleFromSite)
	.all(send405);

export const locationRoutes = router;