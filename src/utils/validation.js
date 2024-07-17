import moment from 'moment';

import { isArray } from '../utils/base';
import RewardLogInstant from '../api/models/reward_log';

export const checkCampaignReward = async ({ customerId, campaign, bizAlias, bizId }) => {
    try {
        if (!isArray(campaign.rewards)) return campaign;

        const today = moment();

        let rewards = [...campaign.rewards].filter((reward) => {
            const expiredTime = reward?.information?.expried_date;
            return today.isBefore(moment(expiredTime));
        });

        if (!isArray(rewards)) return { ...campaign._doc, rewards: [] };

        // Truong hop khong phai tuan tu
        if (!campaign?.is_rotating) {
            rewards = rewards.map((reward) => {
                return { ...reward._doc, status: 'ACTIVE' };
            });
            return { ...campaign._doc, rewards };
        }
        // Truong hop tuan tu

        const findLastedPayload = {
            biz_alias: bizAlias,
            biz_id: bizId,
            campaign: campaign._id,
            customer_id: customerId,
        };

        const lastedLog = await RewardLogInstant.findOne(findLastedPayload).sort({ createdAt: -1 });

        const lastedLevel = lastedLog.level;

        const nextActiveReward = rewards.sort((a, b) => a.level - b.level).find((reward) => reward.level > lastedLevel);

        rewards = rewards.map((reward, rewardIndex) => {
            if (!lastedLog) return { ...reward._doc, status: rewardIndex ? 'INACTIVE' : 'ACTIVE' };
            const conditionActive = nextActiveReward._id === reward._id || reward.level <= lastedLevel;
            return { ...reward._doc, status: conditionActive ? 'ACTIVE' : 'INACTIVE' };
        });

        return { ...campaign._doc, rewards };
    } catch (error) {
        console.log('error :>> ', error);
        return { ...campaign._doc, rewards };
    }
};
