import { Router } from 'express';
import { checkoutApplyCouponRouter } from './routes/checkoutApplyCoupon';
import { checkoutTotalsRouter } from './routes/checkoutTotals';

export const apiRouter = Router();

apiRouter.use('/checkout', checkoutApplyCouponRouter);
apiRouter.use('/checkout', checkoutTotalsRouter);

