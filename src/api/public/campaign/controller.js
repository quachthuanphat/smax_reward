import moment from 'moment';
import { Types } from 'mongoose';

import { success, invalidDataRequest } from '../../../services/response';
import CanpaignInstant from '../../models/campaign';

const isHasEmptyLevelRecord = (rewards) => {
    return rewards.find((reward) => !Number(reward?.level));
};

const isHasDuplicateLevel = (rewards) => {
    const levels = rewards.map((reward) => reward.level);
    return levels.some((level, index) => levels.indexOf(level) !== index);
};

export const list = async ({ querymen: { cursor }, biz }, res) => {
    try {
        const query = { biz_alias: biz.alias };

        let [campaigns, totalCampaign] = await Promise.all([
            CanpaignInstant.find(query).populate('rewards.infomation').skip(cursor.skip).limit(cursor.limit),
            CanpaignInstant.count(query),
        ]);
        const total_page = Math.ceil(totalCampaign / cursor.limit);
        return success(res)({ data: { campaigns, total_page } }); // const id = req?.params?.id;
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const create = async (req, res, next) => {
    try {
        const { biz, viewer, bodymen } = req;
        const { start, end } = bodymen.body;

        const requestStartDate = moment(start);
        const requestEndDate = moment(end);

        const rewards = req.body.rewards;

        if (!Array.isArray(rewards) || !rewards?.length) {
            return invalidDataRequest(res, 'Không có thông tin quà tặng !');
        }

        const hasAnyRewardMissingLevel = isHasEmptyLevelRecord(rewards);
        const hasDuplicateLevel = isHasDuplicateLevel(rewards);

        if (hasAnyRewardMissingLevel) {
            return invalidDataRequest(res, 'Vui lòng tạo cấp độ cho quà tặng !');
        }

        if (hasDuplicateLevel) {
            return invalidDataRequest(res, 'Quà tặng không được trùng cấp độ !');
        }

        if (requestStartDate.isAfter(requestEndDate)) {
            return invalidDataRequest(res, 'Thời gian kết thúc cần lớn hơn thời gian bắt đầu !');
        }

        const createCampaignPayload = {
            ...bodymen.body,
            biz_alias: biz.alias,
            rewards: rewards.map((reward) => ({
                level: reward.level,
                infomation: reward.id,
            })),
        };

        const createCampaignResult = await CanpaignInstant.create(createCampaignPayload);

        return success(res)({ data: createCampaignResult });
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const update = async (req, res, next) => {
    try {
        const id = req?.params?.id;

        if (!id) return invalidDataRequest(res);

        const { biz, bodymen } = req;
        const { start, end } = bodymen.body;

        const requestStartDate = moment(start);
        const requestEndDate = moment(end);

        const rewards = req.body.rewards;

        if (!Array.isArray(rewards) || !rewards?.length) {
            return invalidDataRequest(res, 'Không có thông tin quà tặng !');
        }

        const hasAnyRewardMissingLevel = isHasEmptyLevelRecord(rewards);
        const hasDuplicateLevel = isHasDuplicateLevel(rewards);

        if (hasAnyRewardMissingLevel) {
            return invalidDataRequest(res, 'Vui lòng tạo cấp độ cho quà tặng !');
        }

        if (hasDuplicateLevel) {
            return invalidDataRequest(res, 'Quà tặng không được trùng cấp độ !');
        }

        if (requestStartDate.isAfter(requestEndDate)) {
            return invalidDataRequest(res, 'Thời gian kết thúc cần lớn hơn thời gian bắt đầu !');
        }

        const createCampaignPayload = {
            ...bodymen.body,
            biz_alias: biz.alias,
            rewards: rewards.map((reward) => ({
                level: reward.level,
                infomation: reward.id,
            })),
        };

        const createCampaignResult = await CanpaignInstant.findOneAndUpdate(
            { _id: Types.ObjectId(id), biz_alias: biz.alias },
            createCampaignPayload,
            { new: true }
        );

        return success(res)({ data: createCampaignResult });
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const destroy = async (req, res) => {
    try {
        const { biz } = req;
        const id = req?.params?.id;
        if (!id) return invalidDataRequest(res);
        await CanpaignInstant.findOneAndDelete({ _id: Types.ObjectId(id), biz_alias: biz.alias });
        return success(res)({});
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};
