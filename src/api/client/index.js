import express from 'express';
import { middleware as query } from 'querymen';
import { middleware as body } from 'bodymen';
import { getCampaignList, useReward } from './controller';
import { rewardLogModel } from '../models/reward_log';

const ClientRouter = express.Router();

ClientRouter.post('/campaign-list', getCampaignList);
ClientRouter.post('/use-reward', body(rewardLogModel), useReward);

module.exports = ClientRouter;
