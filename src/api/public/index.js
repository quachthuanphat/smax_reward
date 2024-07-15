import { Router } from 'express';
import rewardRouter from './reward';
// import coupon from './coupon'

const router = new Router();

router.use('/reward', rewardRouter);

export default router;
