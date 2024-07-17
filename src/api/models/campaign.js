import mongoose, { Schema } from 'mongoose';

const campaignSchema = new Schema({
    biz_alias: { type: String, required: true },
    biz_id: { type: String, required: true },
    name: { type: String, required: true },
    thumbnail: { type: String, required: true },
    description: { type: String },
    is_rotating: { type: Boolean, default: false },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    rewards: [
        {
            information: { type: Schema.Types.ObjectId, ref: 'Reward' },
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
    is_rotating: model.schema.tree.is_rotating,
};

export default model;
