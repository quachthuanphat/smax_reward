
import { successBackdoor, notFoundBackdoor } from '../../../services/response'
import { Schema as bodySchema } from 'bodymen'
import { Schema as querySchema } from 'querymen'
import Category from '../../models/category'
import { getCache, setCache } from '../../../services/cache'



const queryValidator = (query, schema) => {
  return new Promise((resolve, reject) => {
    const _schema = new querySchema(schema);

    _schema.validate(query, function (err) {
      if (err) {
        return resolve(err)
      }
      return resolve({ valid: true, querymen: _schema.parse() })
    });
  })
}

export const findOneCategory = async (queryParams) => {
  let result = {}
  try {
    // Valid
    const queryModel = {
      bizId: { type: String, required: true },
      id: { type: String, paths: '_id', required: true }
    }

    const handlerValidator = await queryValidator(queryParams.query, queryModel);
    if (!handlerValidator.valid) {
      return notFoundBackdoor({ queryParams, status: 422, statusText: 'BAD_USER_INPUT', data: handlerValidator })
    }

    const { querymen: { query, select, cursor } } = handlerValidator;

    // getcache
    const cache = await getCache({ model: 'category', alias: query.bizId, queryParams: query });
    if (cache) return JSON.parse(cache);

    const item = await Category.findOne(query, select, cursor);
    if (!item) {
      return notFoundBackdoor({ queryParams, status: 404, statusText: 'CATEGORY_NOT_FOUND', message: 'Không tìm thấy danh mục' })
    }
    result.data = item.view(true);
    result = successBackdoor({ queryParams, data: result })
    // save cache
    await setCache({ model: 'category', data: result, alias: query.bizId, queryParams: query });

  } catch (error) {
    result.status = 500;
    result.message = error.toString()
    result = successBackdoor({ queryParams, data: result })
  }
  return result

}

export const findManyCategory = async (queryParams) => {
  let result = {}
  try {
    // Valid
    const queryModel = {
      bizId: { type: String, required: true },
      id: { type: String, paths: '_id' },
      ids: { type: [String], paths: '_id' }
    }

    const handlerValidator = await queryValidator(queryParams.query, queryModel);
    if (!handlerValidator.valid) {
      return notFoundBackdoor({ queryParams, status: 422, statusText: 'BAD_USER_INPUT', data: handlerValidator })
    }

    const { querymen: { query, select, cursor } } = handlerValidator;
    // getcache
    const cache = await getCache({ model: 'category', alias: query.bizId, queryParams: query });
    if (cache) return JSON.parse(cache);

    const items = await Category.find(query, select)
    result.data = items.map((item) => item.view(true));
    result.total = items.length;

    result = successBackdoor({ queryParams, data: result })
    // save cache
    await setCache({ model: 'category', data: result, alias: query.bizId, queryParams: query });

  } catch (error) {
    result.status = 500;
    result.message = error.toString()
    result = successBackdoor({ queryParams, data: result })
  }
  return result

}
