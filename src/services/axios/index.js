import axios from 'axios';
import { apiEndpoint, env, port, apiRoot, masterKey, service } from '../../config';

// axios.interceptors.request.use(function (config) {
//   config.headers.Authorization = `Bearer ${serviceToken}`;
//   return config;
// })

function createUrl(paths) {
    return apiEndpoint + '/' + paths.join('/');
}
function createUrlMaster(paths, bizId) {
    let uri = `http://127.0.0.1:${port}${apiRoot}/bizs/${bizId}/${service}/master`;
    if (env !== 'development') {
        uri = `${apiEndpoint}/bizs/${bizId}/${service}/master`;
    }
    return uri + '/' + paths.join('/');
}

export const $get = (paths, queryParams) => {
    return axios.get(createUrl(paths), queryParams).then((res) => res.data);
};
export const $getMockapi = (path, queryParams) => {
    return axios.get(path, queryParams).then((res) => res.data);
};

export const $post = (paths, body, config) => {
    return axios.post(createUrl(paths), body, config).then((res) => res.data);
};

export const $postMockapi = (path, body, config) => {
    return axios.post(path, body, config).then((res) => res.data);
};

/**
 *
 * @param {*} path
 * @param {*} body: bizId is required
 * @param {*} config
 * @returns
 */
export const $putMaster = (paths, body, config = {}) => {
    if (!config.headers) {
        config.headers = {};
    }
    config.headers.authorization = `Bearer ${masterKey}`;
    console.log(createUrlMaster(paths, body.bizId), body, config);

    return axios.put(createUrlMaster(paths, body.bizId), body, config).then((res) => res.data);
};
