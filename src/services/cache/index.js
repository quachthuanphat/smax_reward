import { getRedis, setRedis, removeRedis } from '../redis'
import { service, redis } from '../../config'

export const getCache = async ({ model, alias = '', userId = '', queryParams = {} }) => {
  try {
    let stringQueryParams = '';
    Object.keys(queryParams).forEach(key => {
      let val = queryParams[key];
      if (typeof val === 'object') val = JSON.stringify(val);
      stringQueryParams += `-${key}:${val}`
    })

    const key = `SMAXAPP_${service}:${model}-${alias}${userId}${stringQueryParams}`
    console.log('key', key);
    // const data = await getRedis('SMAXAPP_areas:test-location:VN')
    return await getRedis(key)
  } catch (error) { }
  return null
}

export const setCache = async ({ model, expire = 300, data, alias = '', userId = '', queryParams = {} }) => {
  try {
    let stringQueryParams = '';
    Object.keys(queryParams).forEach(key => {
      let val = queryParams[key];
      if (typeof val === 'object') val = JSON.stringify(val);
      stringQueryParams += `-${key}:${val}`
    })
    const key = `SMAXAPP_${service}:${model}-${alias}${userId}${stringQueryParams}`
    await setRedis(key, JSON.stringify({ ...data, _cache: true }), expire)
  } catch (error) {
    console.log('error', error);
  }
  return null;
}
export const delCache = async ({ model, alias = '', userId = '', queryParams = null }) => {
  try {
    let stringQueryParams = '';
    if (queryParams && typeof queryParams === 'object') {
      Object.keys(queryParams).forEach(key => {
        let val = queryParams[key];
        if (typeof val === 'object') val = JSON.stringify(val);
        stringQueryParams += `-${key}:${val}`
      })
    }
    const key = `SMAXAPP_${service}:${model}-${alias}${userId}${stringQueryParams}*`
    await removeRedis(key)
  } catch (error) {
    console.log('error', error);
  }
  return null;
}


/**
 *
 * @param {*} service: Tên API
 * @param {*} cacheForUser: Lưu cache thêm cho chính user
 * @param {*} cacheForBiz: Lưu cache cho cửa hàng
 * @param {*} cacheLocation: Lưu cache thêm bộ lọc địa điểm cửa hàng ( Thường áp dụng cho GET địa điểm )
 * @param {*} paramDefault: Thuộc tính mặc định
 */
export const serviceCache = ({ model = '', cacheForUser = false, cacheForBiz = true, cacheLocation = false, paramDefault = {} }) => {
  return async ({ biz, viewer, query, params }, res, next) => {
    try {
      // Xóa cache alias của biz
      delete params.bizId
      // delete query.alias
      const queryParams = Object.assign({}, params || {}, query || {}, paramDefault)
      if (cacheLocation && biz) {
        queryParams.location = biz.locate?.location || 'VN'
      }
      let alias = ''
      if (cacheForBiz)
        alias = biz?.id || ''
      let userId = ''
      if (cacheForUser)
        userId = viewer?.id || ''

      const data = await getCache({ model, alias, userId, queryParams })
      if (data) return res.status(200).json(JSON.parse(data))
    } catch (error) {
      console.log('serviceCache', error);
    }
    return next()
  }
}


/**
 *
 * @param {*} req: Tên API
 * @param {*} expire: Thời gian cache ( hết hạn ) 5p
 * @param {*} service: Tên API
 * @param {*} cacheForUser: Lưu cache thêm cho chính user
 * @param {*} cacheForBiz: Lưu cache cho cửa hàng
 * @param {*} cacheLocation: Lưu cache thêm bộ lọc địa điểm cửa hàng ( Thường áp dụng cho GET địa điểm )
 * @param {*} paramDefault: Thuộc tính mặc định
 */
export const setServiceCache = async ({ req, model, expire = 300, data, cacheForUser = false, cacheForBiz = true, cacheLocation = false, paramDefault = {} }) => {
  try {
    const { biz, viewer, query, params } = req
    // Xóa cache alias của biz
    delete params?.bizId
    const queryParams = Object.assign({}, params || {}, query || {}, paramDefault)
    if (cacheLocation && biz) {
      queryParams.location = biz.locate?.location || 'VN'
    }
    let alias = ''
    if (cacheForBiz)
      alias = biz?.id || ''
    let userId = ''
    if (cacheForUser)
      userId = viewer?.id || ''
    await setCache({ model, expire, data, alias, userId, queryParams })
  } catch (error) {
    console.log('setServiceCache', error);
  }
}

/**
 *
 * @param {*} req:
 * @param {*} service: Tên API
 * @param {*} cacheForUser: Lưu cache thêm cho chính user
 * @param {*} cacheForBiz: Lưu cache cho cửa hàng
 */
export const removeServiceCache = async ({ req, model, cacheForUser = false, alias = '', userId = '', cacheForBiz = true }) => {
  try {
    const { biz, viewer } = req
    if (cacheForBiz)
      alias = biz?.id || ''
    if (cacheForUser)
      userId = viewer?.id || ''
    await delCache({ model, alias, userId })
  } catch (error) {
    console.log('removeServiceCache', error);
  }
}
