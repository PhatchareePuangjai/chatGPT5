import { Router } from 'express';
import { addToCartHandler } from './handlers/addToCart.js';
import { updateItemQuantityHandler } from './handlers/updateItemQuantity.js';
import { saveForLaterHandler } from './handlers/saveForLater.js';
import { getCartHandler } from './handlers/getCart.js';

export const cartRouter = Router();

cartRouter.get('/', getCartHandler);
cartRouter.post('/items', addToCartHandler);
cartRouter.patch('/items/:sku', updateItemQuantityHandler);
cartRouter.post('/items/:sku/save', saveForLaterHandler);
