import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { create, index, show, update, destroy, showCode, createCode } from './controller'
import { couponModel } from '../../models/coupon'
import { Types } from 'mongoose'

const router = new Router()
/**
 * @api {post} /coupons Create group
 * @apiName CreateOrder
 * @apiGroup Order
 * @apiParam name Order's name.
 * @apiParam desc Order's desc.
 * @apiParam picture Order's picture.
 * @apiParam group Order's group.
 * @apiSuccess {Object} group Order's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Order not found.
 */
router.post('/', body(couponModel), create)
/**
 * @api {post} /coupons/:id/code Create group
 * @apiName CreateOrder
 * @apiGroup Order
 * @apiParam name Order's name.
 * @apiParam desc Order's desc.
 * @apiParam picture Order's picture.
 * @apiParam group Order's group.
 * @apiSuccess {Object} group Order's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Order not found.
 */
router.post('/:id/code', body({
  codes: [String],
  customer: Object,
  customerLoyalty: Object,
  collaborator: Object,
  isAutoCode: Boolean,
  totalCode: { type: Number, min: 0, max: 100 },
  codeSize: { type: Number, min: 6, max: 36 },
  codeFormat: { type: Number, min: 0, max: 5 }
}), createCode)
/**
* @api {get} /coupons Retrieve coupons
* @apiName RetrieveOrders
* @apiGroup Order
* @apiUse listParams
* @apiSuccess {Object[]} coupons List of coupons.
* @apiError {Object} 400 Some parameters may contain invalid values.
*/
router.get('/', query({
  coupon: Types.ObjectId,
  isActive: Boolean,
  type: [String],
  start: { type: Date, paths: ["start"], operator: "$lte" },
  end: { type: Date, paths: ["end"], operator: "$gte" },
  type: [String],
}),
  // serviceCache({ service: 'coupons' }),
  index)

/**
* @api {get} /coupons/code/:code Retrieve group
* @apiName RetrieveOrder
* @apiGroup Order
* @apiSuccess {Object} group Order's data.
* @apiError {Object} 400 Some parameters may contain invalid values.
* @apiError 404 Order not found.
*/
router.get('/code/:code', showCode)


/**
* @api {put} /coupons/:id Update group
* @apiName UpdateOrder
* @apiGroup Order
* @apiParam name Order's name.
* @apiParam desc Order's desc.
* @apiParam picture Order's picture.
* @apiParam group Order's group.
* @apiSuccess {Object} group Order's data.
* @apiError {Object} 400 Some parameters may contain invalid values.
* @apiError 404 Order not found.
*/
router.put('/:id', body(couponModel), update)

/**
* @api {delete} /coupons/:id Delete group
* @apiName DeleteOrder
* @apiGroup Order
* @apiSuccess (Success 204) 204 No Content.
* @apiError 404 Order not found.
*/
// router.delete('/:id',
//   destroy)

export default router
