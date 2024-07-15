import { success, notFound } from '../../../services/response'
import Coupon from '../../models/coupon'
import Customer from '../../../services/axios/customer'
// import Collaborator from '../collaborator/model'
import { sign } from '../../../services/jwt'
import { mongo_includes } from '../../../services/mongoose/util'
import { generateCode } from '../../../utils/nanoid'
import brokerCustomer from '../../../services/axios/customer'
// import { removeServiceCache, setServiceCache } from '../../../services/cache'

// Customer.findOne({bizId, id});

export const checkCouponAcceptOrder = ({ order, coupon, products }) => {
  if (!coupon.conditions?.length) { return { status: true }; }
  let isAccept = true;
  let message = '';
  for (const ctd of coupon.conditions) {
    // Theo tổng số lượng SP trên đơn
    if (ctd.type === 'FOLLOW_QUANTITY_PRODUCT') {
      const totalQuantity = order.cart.reduce((sum, c) => sum + c.quantity, 0);
      if (totalQuantity < ctd.totalQuantity) {
        isAccept = false;
        message = `Số lượng sản phẩm chưa đủ điều kiện để sử dụng mã ${coupon.code || coupon.name}`
        break;
      }
    }
    // Theo số tiền đơn hàng
    if (ctd.type === 'FOLLOW_AMOUNT_ORDER') {
      if (order.amount < ctd.totalAmount) {
        isAccept = false;
        message = `Tổng tiền hàng chưa đủ điều kiện để sử dụng mã ${coupon.code || coupon.name}`
        break;
      }
    }
    // Theo nhóm sản phẩm
    if (ctd.type === 'FOLLOW_GROUP_PRODUCT') {
      const hasGroup = products.some(product => product.groups.some(cate => mongo_includes(ctd.groups, cate)));
      if (!hasGroup) {
        isAccept = false;
        message = `Nhóm sản phẩm chưa đủ điều kiện để sử dụng mã ${coupon.code || coupon.name}`
        break;
      }
    }
    // Theo danh mục sản phẩm
    if (ctd.type === 'FOLLOW_COUPON_PRODUCT') {
      const hasCoupon = products.some(product => product.categories.some(cate => mongo_includes(ctd.categories, cate)));
      if (!hasCoupon) {
        isAccept = false;
        message = `Danh mục sản phẩm chưa đủ điều kiện để sử dụng mã ${coupon.code || coupon.name}`
        break;
      }
    }
    // THeo sản phẩm
    if (ctd.type === 'FOLLOW_PRODUCT') {
      const hasProd = order.cart.some(c => mongo_includes(ctd.products, c.product));
      if (!hasProd) {
        isAccept = false;
        message = `Sản phẩm chưa đủ điều kiện để sử dụng mã ${coupon.code || coupon.name}`
        break;
      }
    }
  }
  return { status: isAccept, message };
}
export const getInfoCoupon = ({ coupon, order }) => {
  // this.form.controls.totalProduct.patchValue(this.formCart.value.reduce((sum, c) => sum + c.quantity), 0);
  if (coupon.formPromotion.type === 'DISCOUNT_NUMBER') {
    let promotion = coupon.formPromotion.discountAmount;
    if (order.amount < promotion) {
      promotion = order.amount;
    }
    return { couponType: 'DISCOUNT_NUMBER', discount: promotion };
  }
  if (coupon.formPromotion.type === 'PERCENT_MAX_AMOUNT') {
    let promotion = order.amount * coupon.formPromotion.discountPercent / 100;
    // console.log('order', order);
    if (promotion > coupon.formPromotion.discountMax) {
      promotion = coupon.formPromotion.discountMax;
    }
    return { couponType: 'PERCENT_MAX_AMOUNT', discount: promotion };
  }
  if (coupon.formPromotion.type === 'FREE_DELIVERY') {
    return { couponType: 'FREE_DELIVERY', discount: coupon.formPromotion.discountMax };
  }
  if (coupon.formPromotion.type === 'GIVE_POINT') {
    return { couponType: 'GIVE_POINT', discount: 0, point: coupon.formPromotion.givePoint };
  }
  if (coupon.formPromotion.type === 'GIVE_PRODUCT') {
    return { couponType: 'GIVE_PRODUCT', discount: 0, point: coupon.formPromotion.givePoint };
  }
  return null;
}

export const create = (req, res, next) => {
  const { biz, viewer, bodymen: { body } } = req;
  new Promise(async (resolve, reject) => {
    // valid
    if (new Date(body.start) > new Date(body.end)) {
      return reject(new Error(JSON.stringify({ status: 403, message: 'COUPON_START_THAN_END: Thời gian kết thúc cần lớn hơn thời gian bắt đầu !' })))
    }
    body.expiredCode = body.end;
    return resolve(Coupon.create({ ...body, author: viewer.id, bizId: biz.id }))
  })
    .then(async coupon => {
      if (body.type === 'RENDER_CODE') {
        body.token = await sign({ id: biz.id, alias: biz.alias, name: biz.name, createdAt: biz.createdAt });
        body.endpoint = `/bizs/${biz.alias}/coupons/${coupon._id}/code`
      }
      return await Object.assign(coupon, { endpoint: body.endpoint, token: body.token }).save()
    })
    .then((coupon) => ({ data: coupon.view(true) }))
    .then(success(res, 201))
    // .then(() => removeServiceCache({ req, service: 'coupons' }))
    .catch(next)
}

export const createCode = (req, res, next) => {
  const { biz, viewer, bodymen: { body }, params } = req;
  new Promise(async (resolve, reject) => {
    // console.log('body', body);
    const coupon = await Coupon.findOne({ _id: params.id, bizId: biz.id })
    if (!coupon) {
      return reject(new Error(JSON.stringify({ status: 404, message: 'COUPON_EVENT_NOT_FOUND: Không tìm thấy chương trình !' })))
    }
    if (body.customer?.id) {
      try {
        const customer = await brokerCustomer.findOne({ bizId: biz.id, id: body.customer.id })
        console.log('customer', customer);
        body.customer = {
          id: customer.id,
          code: customer.code,
          picture: customer.picture,
          phone: customer.phone,
          name: customer.name,
        }
      } catch (error) {
        console.log('query customer', error);
        return reject(new Error(JSON.stringify({ status: 404, message: 'CUSTOMER_NOT_FOUND: Không tìm thấy khách hàng!' })))
      }
    } else {
      delete body.customer
    }
    // if (body.customerLoyalty?.id) {
    //   const customerLoyalty = await Customer.findOne({ bizId: biz.id, _id: body.customerLoyalty.id }).select('picture code phone name fbid').lean()
    //   if (!customerLoyalty) {
    //     return reject(new Error(JSON.stringify({ status: 404, message: 'CUSTOMER_NOT_FOUND: Không tìm thấy khách hàng' })))
    //   }
    //   body.customerLoyalty = {
    //     id: customerLoyalty._id,
    //     code: customerLoyalty.code,
    //     picture: customerLoyalty.picture,
    //     phone: customerLoyalty.phone,
    //     name: customerLoyalty.name,
    //     fbid: customerLoyalty.fbid,
    //   }
    // } else {
    //   delete body.customerLoyalty
    // }
    // if (body.collaborator?.id) {
    //   const collaborator = await Collaborator.findOne({ bizId: biz.id, _id: body.collaborator.id }).select('picture code phone name fbmessid').lean()
    //   if (!collaborator) {
    //     return reject(new Error(JSON.stringify({ status: 404, message: 'COLLABORATOR_NOT_FOUND: Không tìm thấy cộng tác viên' })))
    //   }
    //   body.collaborator = {
    //     id: collaborator._id,
    //     code: collaborator.code,
    //     picture: collaborator.picture,
    //     phone: collaborator.phone,
    //     name: collaborator.name,
    //     fbmessid: collaborator.fbmessid,
    //   }
    // } else {
    //   delete body.collaborator
    // }
    // valid
    if (new Date() > new Date(coupon.end)) {
      return reject(new Error(JSON.stringify({ status: 403, message: 'COUPON_EVENT_EXPIRED: Chương trình đã hết hạn !' })))
    }
    if (coupon.type !== 'RENDER_CODE') {
      return reject(new Error(JSON.stringify({ status: 403, message: 'COUPON_NOT_RENDER_CODE: Chương trình này không hỗ trợ phát mã !' })))
    }
    let totalCodeCreate = body.codes?.legth || body.totalCode
    if (coupon.totalCodeProvide === coupon.totalCodeCreate || coupon.totalCodeProvide < coupon.totalCodeCreate + totalCodeCreate) {
      return reject(new Error(JSON.stringify({ status: 403, message: 'COUPON_RENDER_CODE_FULL: Chương trình đã phát hết số lượng mã cung cấp !' })))
    }
    let expiredCode = coupon.end;
    if (coupon.typeCode === 'FOLLOW_DURATION') {
      expiredCode = new Date(Date.now() + coupon.durationCode * 1000 * 60 * 60 * 24)
    }
    // check mã tồn tại chưa
    if (!body.isAutoCode) {
      body.codes = Array.from(new Set(body.codes));  // Loại bỏ mã trùng
      const coupons = await Coupon.find({ bizId: biz.id, code: { $in: body.codes }, type: 'CODE' }).select('name').lean().limit(body.codes.length)
      if (coupons.length) {
        return reject(new Error(JSON.stringify({ status: 403, message: 'COUPON_CODE_USED: Mã đã sử dụng trên cửa hàng !' })))
      }
    } else {
      body.codes = [];
      for (let i = 0; i < body.totalCode; i++) {
        body.codes.push(generateCode(body.codeSize, body.codeFormat));
      }
    }
    await Coupon.insertMany(body.codes.map(code => ({
      ...coupon.toObject(),
      _id: null,
      code: code,
      codeSize: body.codeSize,
      codeFormat: body.codeFormat,
      coupon: coupon._id,
      expiredCode,
      customer: body.customer,
      customerLoyalty: body.customerLoyalty,
      collaborator: body.collaborator,
      type: 'CODE',
      totalCodeProvide: 0,
      totalCodeCreate: 0,
      totalCodeUsed: 0,
      token: null,
      endpoint: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })))
    return resolve(true)
  })
    .then(success(res, 201))
    .then(async () => {
      const count = await Coupon.countDocuments({ bizId: biz.id, coupon: params.id }).lean()
      await Coupon.updateOne({ _id: params.id, bizId: biz.id }, { totalCodeCreate: count })
    })
    // .then(() => removeServiceCache({ req, service: 'coupons' }))
    .catch(next)
}

export const index = (req, res, next) => {
  const { biz, querymen: { query, select, cursor } } = req;
  Coupon.countDocuments({ ...query, bizId: biz.id })
    .then((total) => {
      if (total === 0) { return { data: [], total } }
      return Coupon.find({ ...query, bizId: biz.id }, select, cursor)
        .then((coupons) => ({
          total,
          data: coupons.map((coupon) => coupon.view(false)),
        }))
    }
    )
    .then(success(res))
    // .then((coupons) => setServiceCache({ req, service: 'coupons', data: coupons }))
    .catch(next);
}

export const showCode = ({ biz, params }, res, next) => {
  Coupon.findOne({ bizId: biz.id, code: params.code })
    .then(notFound(res))
    .then((coupon) => ({ data: coupon ? coupon.view() : null }))
    .then(success(res))
    .catch(next)
}

export const update = (req, res, next) => {
  const { biz, viewer, bodymen: { body }, params } = req;
  new Promise(async (resolve, reject) => {
    const coupon = await Coupon.findOne({ _id: params.id, bizId: biz.id })
    if (!coupon) {
      return reject(new Error(JSON.stringify({ status: 404, message: 'COUPON_EVENT_NOT_FOUND: Không tìm thấy chương trình !' })))
    }
    // valid
    if (new Date(body.start) > new Date(body.end)) {
      return reject(new Error(JSON.stringify({ status: 403, message: 'COUPON_START_THAN_END: Thời gian kết thúc cần lớn hơn thời gian bắt đầu !' })))
    }
    body.expiredCode = body.end;
    return resolve(coupon)
  })
    .then((coupon) => coupon ? Object.assign(coupon, body).save() : null)
    .then((coupon) => ({ data: coupon ? coupon.view() : null }))
    .then(success(res))
    .then((coupon) => {
      return Coupon.updateMany({ bizId: biz.id, coupon: coupon.data.id }, {
        name: coupon.data.name,
        start: coupon.data.start,
        end: coupon.data.end,
        conditions: coupon.data.conditions,
        formPromotion: coupon.data.formPromotion,
        isGeneral: coupon.data.isGeneral,
      })
    })
    // .then(() => removeServiceCache({ req, service: 'coupons' }))
    .catch(next)
}

export const destroy = ({ biz, params }, res, next) =>
  new Promise(async (resolve, reject) => {
    try {
      const coupon = await Coupon.findOne({ _id: params.id, bizId: biz.id });
      if (!coupon) {
        return reject(new Error(JSON.stringify({ status: 404, message: 'COUPON_NOT_FOUND: Không tìm thấy danh mục!' })));
      }
      console.log('coupon', coupon);
      const hasCode = await Coupon.findOne({ coupon: params.id, bizId: biz.id }).lean();
      if (hasCode) {
        return reject(new Error(JSON.stringify({ status: 404, message: `COUPON_USED: Mã giảm giá đã được sử dụng` })));
      }

      const hasProduct = await Product.findOne({ categories: params.id, bizId: biz.id }).select("_id").lean()
      console.log('hasProduct', hasProduct);
      if (hasProduct) {
        return reject(new Error(JSON.stringify({ status: 403, message: 'COUPON_USED: Danh mục đã được gán vào sản phẩm nên không thể xóa!' })));
      }

      return resolve(coupon.remove());
    } catch (error) {
      return reject(new Error(JSON.stringify({ status: 500, message: error.toString() })));
    }
  })
    .then(coupon => ({ data: coupon.view(true) }))
    .then(success(res, 200))
    .catch(next)

