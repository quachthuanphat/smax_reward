import mongoose, { Schema } from 'mongoose';

const campaignSchema = new Schema({
    biz_alias: { type: String, required: true },
    name: { type: String, required: true },
    thumbnail: { type: String, default: null, required: true },
    description: { type: String },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    rewards: [
        {
            infomation: { type: Schema.Types.ObjectId, ref: 'Reward' },
            level: { type: Number, default: 1 },
        },
    ],
});

const model = mongoose.model('Campaign', campaignSchema);

export const campaignModel = {
    name: model.schema.tree.name,
    thumbnail: model.schema.tree.thumbnail,
    start: model.schema.tree.start,
    end: model.schema.tree.end,
};

export default model;
