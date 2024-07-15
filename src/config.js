/* eslint-disable no-unused-vars */
import path from 'path';
import merge from 'lodash/merge';
const dotenv = require('dotenv-safe');

/* istanbul ignore next */
const requireProcessEnv = (name) => {
    if (!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable');
    }
    return process.env[name];
};

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv-safe');
    dotenv.config({
        path: path.join(__dirname, '../.env'),
        example: path.join(__dirname, '../.env.example'),
    });
}

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
        baseUrl: requireProcessEnv('BASE_URL'),
        mongo: {
            options: {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true,
            },
        },
        redis: {
            uri: process.env.REDIS_URI || 'redis://localhost:6379', // redis://root:<password>@<url>:<port>
            adapterUri: process.env.REDIS_ADAPTER_URI || 'redis://localhost:6379', // redis://<password>@<url>:<port>
        },
        file: {
            thumbnail_maximum: 1048576 * 10, //10MB
            thumbnail_mimetype: ['image/png', 'image/jpg', 'image/jpeg'],
            maximum_photo: 1048576 * 10, //10MB
            acceptType: {
                png: 'image/png',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
            },
            acceptTypeValues: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'jpg', 'gif'],
        },
    },
    test: {},
    development: {
        mongo: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost/backend',
            options: {
                debug: true,
            },
        },
    },
    beta: {
        mongo: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost/backend',
        },
    },
    production: {
        ip: process.env.IP || undefined,
        port: process.env.PORT || 8080,
        mongo: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost/backend',
        },
    },
};

// console.log('MY_CONFIG :>> ', merge(config.all, config[config.all.env]));

module.exports = merge(config.all, config[config.all.env]);
export default module.exports;
