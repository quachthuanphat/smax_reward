import { Router } from 'express';
import { middleware as query } from 'querymen';
import { middleware as body } from 'bodymen';
import { create, update, list, destroy } from './controller';
import { campaignModel } from '../../models/campaign';

const campaignRouter = new Router();

campaignRouter.get('/', query(), list);
campaignRouter.post('/', body(campaignModel), create);
campaignRouter.put('/:id', body(campaignModel), update);
campaignRouter.delete('/:id', destroy);

export default campaignRouter;
