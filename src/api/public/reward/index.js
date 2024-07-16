import { Router } from 'express';
import { middleware as query } from 'querymen';
import { middleware as body } from 'bodymen';
import { create, update, list, destroy } from './controller';
import { rewardModel } from '../../models/reward';

const rewardRouter = new Router();

rewardRouter.get('/', query(), list);
rewardRouter.post('/', body(rewardModel), create);
rewardRouter.put('/:id', body(rewardModel), update);
rewardRouter.delete('/:id', destroy);

export default rewardRouter;
