import { Router } from 'express';
import { middleware as query } from 'querymen';
import { middleware as body } from 'bodymen';
import { create, index, show, update, destroy, showCode, createCode } from './controller';
import { rewardModel } from '../../models/reward';

const rewardRouter = new Router();

rewardRouter.post('/', body(rewardModel), create);
