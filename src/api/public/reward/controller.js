import { Types } from 'mongoose';

import { success, notFound, invalidDataRequest } from '../../../services/response';
import RewardInstant from '../../models/reward';

export const destroy = async (req, res) => {
    try {
        const id = req?.params?.id;
        if (!id) return invalidDataRequest(res);
        await RewardInstant.findOneAndDelete({ _id: Types.ObjectId(id) });
        return success(res)({});
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const create = async (req, res) => {
    try {
        const { bodymen } = req;
        const createSuccess = await RewardInstant.create({ ...bodymen.body, type: 'CREATE_MANUAL' });
        return success(res)({ data: createSuccess._doc });
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const update = async (req, res) => {
    try {
        const id = req?.params?.id;
        const { bodymen } = req;
        if (!id) return invalidDataRequest(res);
        const updateSuccess = await RewardInstant.findOneAndUpdate(
            { _id: Types.ObjectId(id) },
            { ...bodymen.body },
            { new: true }
        );
        return success(res)({ data: updateSuccess._doc });
    } catch (error) {
        console.log('error :>> ', error);
        return invalidDataRequest(res);
    }
};

export const list = async ({ querymen: { query, cursor } }, res) => {
    try {
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
