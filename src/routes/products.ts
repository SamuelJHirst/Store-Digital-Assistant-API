import { Router } from 'express';
import * as assignmentController from '../controllers/assignmentController';
import * as deliveryController from '../controllers/deliveryController';
import * as productController from '../controllers/productController';
import * as reviewController from '../controllers/reviewController';
import { isAdmin, isUser } from '../middleware/auth';
import { getCustomer } from '../middleware/getCustomer';
import { getProduct } from '../middleware/getProduct';
import { getSite } from '../middleware/getSite';
import { send405 } from '../helpers/responses';

const router = Router();

router.route('/products')
	.post(isAdmin, productController.addProduct)
	.get(productController.getAllProducts)
	.all(send405);
router.route('/products/:product')
	.get(productController.getProduct)
	.patch(isAdmin, productController.updateProduct)
	.delete(isAdmin, productController.deleteProduct)
	.all(send405);
router.route('/products/:product/assignments/:site')
	.get(getSite, getProduct, assignmentController.getAssignmentsByProduct)
	.all(send405);
router.route('/products/:product/deliveries/:site')
	.get(getSite, getProduct, deliveryController.getProductDeliveriesForSite)
	.all(send405);
router.route('/products/:product/quantity/:site')
	.get(getSite, getProduct, productController.getQuantity)
	.put(isUser, getSite, getProduct, productController.setQuantity)
	.all(send405);
router.route('/products/:product/reviews')
	.post(getCustomer, getProduct, reviewController.addReview)
	.get(getProduct, reviewController.getProductReviews)
	.all(send405);
router.route('/products/:product/reviews/:customer')
	.delete(isAdmin, getCustomer, getProduct, reviewController.deleteReviews)
	.all(send405);

export const productRoutes = router;