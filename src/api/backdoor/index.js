import { Router } from 'express'
import { success } from '../../services/response'
// import { findOneCategory, findManyCategory } from './category/controller'

const router = new Router()

// Các method hỗ trợ
const methodName = []
const method = {
  // findOneCategory, findManyCategory
}
router.post('/', (req, res, next) => {
  new Promise(async (resolve, reject) => {
    if (!Array.isArray(req.body)) {
      return reject(new Error(JSON.stringify({ status: 403, statusText: "BAD_USER_INPUT", message: "Bad User Input" })))
    }

    return resolve(Promise.all(
      req.body.map(async body => {
        if (!methodName.includes(body.method)) {
          return {
            ...body,
            response: {
              status: 403,
              statusText: "BAD_USER_INPUT",
              message: "Method is not support"
            }
          }
        }
        if (body.methodId) {
          const resp = await method[body.method](body);
          resp.methodId = body.methodId;
          return resp;
        }
        return method[body.method](body);
      })
    ))
  })
    .then(result => ({ data: result }))
    .then(success(res, 200))
    .catch(next)
})


export default router
