/* eslint-disable no-unused-vars */
import path from 'path'
import merge from 'lodash/merge'

/* istanbul ignore next */
const requireProcessEnv = (name) => {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable')
  }
  return process.env[name]
}

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv-safe')
  dotenv.config({
    path: path.join(__dirname, '../.env'),
    example: path.join(__dirname, '../.env.example')
  })
}

console.log('process.env.PORT', process.env.PORT);

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '..'),
    port: process.env.PORT || 8000,
    ip: process.env.IP || '0.0.0.0',
    apiRoot: process.env.API_ROOT || '',
    service: requireProcessEnv('SERVICE'),
    serviceToken: requireProcessEnv('SERVICE_TOKEN'),
    masterKey: requireProcessEnv('MASTER_KEY'),
    apiEndpoint: requireProcessEnv('API_ENDPOINT'),
    jwtSecret: requireProcessEnv('JWT_SECRET'),
    mongo: {
      options: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
      }
    },
    redis: {
      uri: process.env.REDIS_URI || "redis://localhost:6379",                 // redis://root:<password>@<url>:<port>
      adapterUri: process.env.REDIS_ADAPTER_URI || "redis://localhost:6379",  // redis://<password>@<url>:<port>
    },
  },
  test: {},
  development: {
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/backend',
      options: {
        debug: true
      }
    }
  },
  beta: {
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/backend',
    }
  },
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/backend'
    }
  }
}

module.exports = merge(config.all, config[config.all.env])
export default module.exports
