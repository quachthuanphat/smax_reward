import { Router } from 'express';
import rewardRouter from './reward';
import campaignRouter from './campaign';
// import coupon from './coupon'

const router = new Router();

router.use('/reward', rewardRouter);
router.use('/campaign', campaignRouter);

export default router;
