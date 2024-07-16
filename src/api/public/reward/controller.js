import { Types } from 'mongoose';
import moment from 'moment';

import { success, invalidDataRequest } from '../../../services/response';
import RewardInstant from '../../models/reward';

export const destroy = async (req, res) => {
    try {
        const { biz } = req;
        const id = req?.params?.id;
        if (!id) return invalidDataRequest(res);
        await RewardInstant.findOneAndDelete({ _id: Types.ObjectId(id), biz_alias: biz.alias });
        return success(res)({});
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const create = async (req, res) => {
    try {
        const { bodymen, biz } = req;
        const today = moment();
        const requestExpriedDate = moment(bodymen.body.expried_date);

        if (today.isAfter(requestExpriedDate)) {
            return invalidDataRequest(res, 'REWARD EXPRIED_DATE: Thời gian kết thúc cần lớn hơn thời gian hiện tại !');
        }

        const createSuccess = await RewardInstant.create({
            ...bodymen.body,
            biz_alias: biz.alias,
            type: 'CREATE_MANUAL',
        });
        return success(res)({ data: createSuccess });
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const update = async (req, res) => {
    try {
        const id = req?.params?.id;
        const { bodymen, biz } = req;
        if (!id) return invalidDataRequest(res);
        const updateSuccess = await RewardInstant.findOneAndUpdate(
            { _id: Types.ObjectId(id), biz_alias: biz.alias },
            { ...bodymen.body },
            { new: true }
        );
        return success(res)({ data: updateSuccess._doc });
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const list = async ({ querymen: { cursor }, biz }, res) => {
    try {
        const query = { biz_alias: biz.alias };

        let [rewards, totalReward] = await Promise.all([
            RewardInstant.find(query).skip(cursor.skip).limit(cursor.limit),
            RewardInstant.count(query),
        ]);
        const total_page = Math.ceil(totalReward / cursor.limit);
        return success(res)({ data: { rewards, total_page } }); // const id = req?.params?.id;
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};
