import { Types } from 'mongoose';
import moment from 'moment';

import CustomerBackdoor from '../../services/axios/customer';
import CanpaignInstant from '../models/campaign';
import RewardLogInstant from '../models/reward_log';

import { checkCampaignReward } from '../../utils/validation';
import { success, invalidDataRequest } from '../../services/response';
import { isArray } from '../../utils/base';

export const getCampaignList = async (req, res) => {
    try {
        const customerId = req.body?.customer_id;
        const bizId = req.body.biz_id;
        const bizAlias = req.bizAlias;

        if (!customerId || !bizId) return invalidDataRequest(res, 'Không tìm thấy thông tin khách hàng');

        const customer = await CustomerBackdoor.findOne({ id: customerId, bizId });

        console.log('customer :>> ', customer);

        if (!customer?.id) return invalidDataRequest(res, 'Không tìm thấy thông tin khách hàng');

        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();

        const query = {
            biz_alias: bizAlias,
            biz_id: bizId,
            start: { $lte: startOfDay },
            end: { $gte: endOfDay },
        };

        const campaigns = await CanpaignInstant.find(query).populate('rewards.information');

        console.log('campaigns :>> ', campaigns);

        const result = [];

        if (!isArray(campaigns)) {
            return success(res)({ data: { campaigns: [] } });
        }

        for (const campaign of campaigns) {
            const checkResult = await checkCampaignReward({ customerId, campaign, bizAlias, bizId });
            if (checkResult) result.push(checkResult);
        }

        return success(res)({ data: { campaigns: result } });
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const useReward = async (req, res) => {
    try {
        const { bodymen } = req;

        const requestPayload = bodymen.body;

        const bizAlias = req.bizAlias;

        const campaignQuery = {
            _id: Types.ObjectId(requestPayload.campaign),
            biz_alias: bizAlias,
            biz_id: requestPayload.biz_id,
        };

        const [campaign, customer] = await Promise.all([
            CanpaignInstant.findOne(campaignQuery).populate('rewards.information'),
            CustomerBackdoor.findOne({ id: requestPayload.customer_id, bizId: requestPayload.biz_id }),
        ]);

        if (!customer || !campaign || !isArray(campaign?.rewards)) {
            return invalidDataRequest(res);
        }

        const legitCampaign = await checkCampaignReward({
            campaign,
            bizAlias,
            bizId: requestPayload.biz_id,
            customerId: customer.id,
        });

        console.log('legitCampaign :>> ', legitCampaign);

        const selectedReward = legitCampaign.rewards.find((reward) => {
            console.log('reward :>> ', reward);
            const firstCondition = reward.information._id.toString() === requestPayload.reward;
            const secondCondition = reward.status === 'ACTIVE';
            const thirdCondition = reward.level === requestPayload.level;

            console.log('firstCondition :>> ', firstCondition);
            console.log('secondCondition :>> ', secondCondition);
            console.log('thirdCondition :>> ', thirdCondition);

            return firstCondition && secondCondition && thirdCondition;
        });

        console.log('selectedReward :>> ', selectedReward);

        if (!selectedReward) {
            return invalidDataRequest(res, 'Dữ liệu lấy quà không phù hợp');
        }

        const createRewardLogPayload = {
            biz_alias: bizAlias,
            biz_id: requestPayload.biz_id,
            level: selectedReward.level,
            reward: selectedReward._id,
            campaign: requestPayload.campaign,
            customer_id: customer.id,
            customer_name: customer.name,
        };

        const createLogResult = await RewardLogInstant.create(createRewardLogPayload);
        return success(res)({ data: createLogResult });
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};
