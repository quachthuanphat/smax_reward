import mongoose, { Schema } from 'mongoose';

const rewardSchema = new Schema({
    thumbnail: { type: String, default: null, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['SYNC_FROM_SMAX', 'CREATE_MANUAL'], required: true },
});

const model = mongoose.model('Reward', rewardSchema);

console.log('model.schema.tree.type :>> ', model.schema.tree.type);

export const rewardModel = {
    name: model.schema.tree.name,
    thumbnail: model.schema.tree.thumbnail,
};

export default model;
