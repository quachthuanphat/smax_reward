import mongoose, { Schema } from 'mongoose'

const couponSchema = new Schema({
  author: { type: Schema.ObjectId, ref: 'User' },
  bizId: { type: Schema.ObjectId, ref: "Shop" },
  coupon: { type: Schema.ObjectId, ref: 'Coupon' },
  name: { type: String, required: true },
  // EVENT_GLOBAL:  Sự kiện chung cho toàn bộ cửa hàng
  // RENDER_CODE:   Sự kiện phát mã ( Sinh ra API để lấy mã )
  // CODE:          Mã tự sinh
  type: { type: String, enum: ['EVENT_GLOBAL', 'RENDER_CODE', 'CODE'] },
  code: { type: String },
  codeSize: { type: Number, default: 10 },
  // codeFormat:
  // 0:Chữ hoa, chữ thường và số
  // 1:Chữ hoa và số
  // 2:Chữ thường và số
  // 3:Chỉ chữ hoa
  // 4:Chỉ chữ thường
  // 5:Chỉ số
  codeFormat: { type: Number, default: 0 },
  typeCode: { type: String },
  description: { type: String },
  start: { type: Date },
  end: { type: Date },
  conditions: [{
    type: { type: String },
    categories: [{ type: Schema.ObjectId, ref: "Category" }],
    totalQuantity: { type: Number, min: 0 },
    totalAmount: { type: Number, min: 0 },
    products: [{ type: Schema.ObjectId, ref: "Product" }],
    groups: [{ type: Schema.ObjectId, ref: "ProductGroup" }],
  }],
  formPromotion: {
    type: { type: String },
    giveProducts: [{ type: Schema.ObjectId, ref: "Product" }],
    givePoint: { type: Number, min: 0 },
    discountAmount: { type: Number, min: 0 },
    discountMax: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100 },
  },
  customer: {
    id: { type: Schema.ObjectId, ref: 'Customer' },
    picture: { type: String },
    code: { type: String },
    phone: { type: String },
    name: { type: String },
    fbid: { type: String },
  },
  customerLoyalty: {
    id: { type: Schema.ObjectId, ref: 'Customer' },
    picture: { type: String },
    code: { type: String },
    phone: { type: String },
    name: { type: String },
    fbid: { type: String },
  },
  collaborator: {
    id: { type: Schema.ObjectId, ref: 'Collaborator' },
    picture: { type: String },
    code: { type: String },
    phone: { type: String },
    name: { type: String },
    fbmessid: { type: String },
  },
  numUseCode: { type: String },                             // Số lần sử dụng trên mỗi mã
  totalCodeProvide: { type: Number, default: 0, min: 0 },   // Tổng số lượng mã cung cấp
  totalCodeCreate: { type: Number, default: 0, min: 0 },    // Tổng số lượng đã tạo
  totalCodeUsed: { type: Number, default: 0, min: 0 },      // Tổng số lượng đã sử dụng
  durationCode: { type: Number, default: 0 },               // Số ngày có hiệu lực của code
  expiredCode: { type: Date },                // Thời gian hết hạn mã code
  isGeneral: { type: Boolean, default: false },             // Sử dụng chung
  isActive: { type: Boolean, default: true },               // Trạng thái
  token: { type: String },                                  // Tự sinh khi trường hợp là RENDER_CODE
  endpoint: { type: String },                               // Tự sinh khi trường hợp là RENDER_CODE
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

couponSchema.index({ bizId: 1, createdAt: -1, type: 1 })
couponSchema.index({ bizId: 1, code: 1 })


couponSchema.methods = {
  view(full) {
    const view = {
      // simple view
      id: this.id,
      author: this.author,
      bizId: this.bizId,
      coupon: this.coupon,
      name: this.name,
      code: this.code,
      codeSize: this.codeSize,
      codeFormat: this.codeFormat,
      typeCode: this.typeCode,
      description: this.description,
      type: this.type,
      start: this.start,
      end: this.end,
      conditions: this.conditions,
      customer: this.customer,
      customerLoyalty: this.customerLoyalty,
      collaborator: this.collaborator,
      formPromotion: this.formPromotion,
      totalCodeProvide: this.totalCodeProvide,
      totalCodeCreate: this.totalCodeCreate,
      totalCodeUsed: this.totalCodeUsed,
      durationCode: this.durationCode,
      expiredCode: this.expiredCode,
      numUseCode: this.numUseCode,
      isGeneral: this.isGeneral,
      isActive: this.isActive,
      token: this.token,
      endpoint: this.endpoint,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Coupon', couponSchema)

export const couponModel = {
  name: model.schema.tree.name,
  code: model.schema.tree.code,
  codeSize: model.schema.tree.codeSize,
  codeFormat: model.schema.tree.codeFormat,
  typeCode: model.schema.tree.typeCode,
  description: model.schema.tree.description,
  type: { type: String, enum: ['EVENT_GLOBAL', 'RENDER_CODE'], required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  conditions: model.schema.tree.conditions,
  formPromotion: model.schema.tree.formPromotion,
  totalCodeProvide: model.schema.tree.totalCodeProvide,
  numUseCode: model.schema.tree.numUseCode,
  durationCode: model.schema.tree.durationCode,
  isGeneral: model.schema.tree.isGeneral,
  isActive: model.schema.tree.isActive,
}

export default model
