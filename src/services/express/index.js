import express from 'express'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { errorHandler as queryErrorHandler } from 'querymen'
import { errorHandler as bodyErrorHandler } from 'bodymen'
import { env } from '../../config'

export default (apiRoot, routes) => {
  const app = express()

  /* istanbul ignore next */
  if (['production', 'development', 'beta'].includes(env)) {
    app.use(cors())
    app.use(compression())
    app.use(morgan('dev'))
  }

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(apiRoot, routes)
  app.use(queryErrorHandler())
  app.use(bodyErrorHandler())

  app.use((err, req, res, next) => {
    console.log("err global", err);
    // res.headersSent: Check xem đã trả dữ liệu cho client chưa. Nếu chưa thì chạy tiếp
    if (!res.headersSent) {
      try {
        let error = JSON.parse(err.message);
        console.log('err', error);
        // if (error.statusCode) {
        //   resByCode(res, error.statusCode);
        // } else if (!isNaN(error.status)) {
        // }
        res.status(error.status).json({
          status: error.status,
          statusText: error.statusText || "ERROR",
          subStatus: err.status,
          subStatusText: "ERROR",
          message: error.message,
          data: {}
        });
      } catch (error) { }
      if (!res.headersSent) {
        res.status(400).send(err.message);
      }
    }
  });

  return app
}
