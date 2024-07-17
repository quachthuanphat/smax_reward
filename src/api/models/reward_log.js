import mongoose, { Schema } from 'mongoose';

const rewardLogSchema = new Schema({
    biz_alias: { type: String, required: true },
    biz_id: { type: String, required: true },
    level: { type: Number, required: true },
    reward: { type: Schema.Types.ObjectId, ref: 'Reward', required: true },
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    customer_id: { type: String, required: true },
    customer_name: { type: String, required: true },
});

const model = mongoose.model('Reward_log', rewardLogSchema);

export const rewardLogModel = {
    biz_id: model.schema.tree.biz_id,
    reward: model.schema.tree.reward,
    campaign: model.schema.tree.campaign,
    customer_id: model.schema.tree.customer_id,
    level: model.schema.tree.level,
};

export default model;
