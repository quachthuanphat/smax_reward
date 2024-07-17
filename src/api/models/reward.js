import mongoose, { Schema } from 'mongoose';

const rewardSchema = new Schema({
    thumbnail: { type: String, default: null, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['SYNC_FROM_SMAX', 'CREATE_MANUAL'], required: true },
    biz_alias: { type: String, required: true },
    biz_id: { type: String, required: true },
    expried_date: { type: Date, required: true },
});

const model = mongoose.model('Reward', rewardSchema);

export const rewardModel = {
    name: model.schema.tree.name,
    thumbnail: model.schema.tree.thumbnail,
    expried_date: model.schema.tree.expried_date,
};

export default model;
