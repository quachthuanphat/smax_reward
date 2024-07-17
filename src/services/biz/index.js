import { $get } from '../axios';
import { invalidDataRequest } from '../response';
import { service, env } from '../../config';
import { getCache, setCache } from '../cache';

export const getBiz = async ({ token, bizAlias }) => {
    let biz = null;
    try {
        const bufToken = token.split('.')[1];
        const dataToken = JSON.parse(Buffer.from(bufToken, 'base64').toString());

        biz = await getCache({ model: 'biz', alias: bizAlias, queryParams: { authorization: dataToken.id } });
        if (biz) {
            biz = JSON.parse(biz);
        } else {
            biz = await $get(['bizs', bizAlias, 'modules', service], {
                headers: {
                    Authorization: token.toString().trim(),
                },
            });
            await setCache({
                model: 'biz',
                expire: 100,
                data: biz,
                alias: bizAlias,
                queryParams: { authorization: dataToken.id },
            });
        }
        biz = biz.data;
    } catch (error) {
        console.log('getBiz', error);
    }
    return biz;
};

export const getBizAlias = (req, res, next) => {
    req.bizAlias = req.params.bizAlias;
    if (!req.bizAlias) return invalidDataRequest(res, 'Missing bizLias');
    return next();
};

export const bizToken =
    ({ required, roles = [] } = {}) =>
    (req, res, next) => {
        return new Promise(async (resolve, reject) => {
            if (!req.headers.authorization)
                return reject(new Error(JSON.stringify({ status: 401, message: 'Unauthorized' })));
            try {
                const token = req.headers.authorization;

                let biz = await getCache({
                    model: 'biz-public',
                    alias: req.params.bizAlias,
                    queryParams: { authorization: token },
                });
                if (biz) {
                    biz = JSON.parse(biz);
                } else {
                    biz = await $get(['public', 'bizs', req.params.bizAlias], {
                        params: {},
                        headers: {
                            authorization: token,
                        },
                    });
                    await setCache({
                        model: 'biz-public',
                        expire: 100,
                        data: biz,
                        alias: req.params.bizAlias,
                        queryParams: { authorization: token },
                    });
                }

                if (!biz?.data || biz?.status !== 200)
                    return reject(new Error(JSON.stringify({ status: 401, message: 'Unauthorized' })));
                req.biz = biz.data;
                next();
            } catch (error) {
                console.log('token error', error);
                return reject(
                    new Error(
                        JSON.stringify({
                            status: error.response?.data?.status || 401,
                            statusText: error.response?.data?.statusText || 'ERROR',
                            message: error.response?.data?.message || 'Unauthorized',
                        })
                    )
                );
            }
        }).catch(next);
    };
export const token =
    ({ required, roles = [] } = {}) =>
    (req, res, next) => {
        return new Promise(async (resolve, reject) => {
            if (!req.headers.authorization)
                return reject(new Error(JSON.stringify({ status: 401, message: 'Unauthorized' })));
            try {
                const token = req.headers.authorization;

                console.log('token :>> ', token);

                const refToken = req.headers['ref-token'] || null;
                const bufToken = token.split('.')[1];
                const dataToken = JSON.parse(Buffer.from(bufToken, 'base64').toString());

                let biz = await getCache({
                    model: 'biz',
                    alias: req.params.bizId,
                    queryParams: { authorization: dataToken.id },
                });
                if (biz) {
                    biz = JSON.parse(biz);
                } else {
                    // biz = await $getMockapi('https://62284d269fd6174ca81fbf13.mockapi.io/bizs/1');
                    // console.log('biz', biz)
                    biz = await $get(['bizs', req.params.bizId, 'modules', service], {
                        headers: {
                            authorization: token,
                            'ref-token': refToken,
                        },
                    });
                    await setCache({
                        model: 'biz',
                        expire: 100,
                        data: biz,
                        alias: req.params.bizId,
                        queryParams: { authorization: dataToken.id },
                    });
                }
                // console.log('biz', biz);
                if (!biz?.data || biz?.status !== 200)
                    return reject(new Error(JSON.stringify({ status: 401, message: 'Unauthorized' })));
                req.biz = biz.data;
                req.viewer = biz.viewer;
                next();
            } catch (error) {
                console.log('token error', error);
                return reject(
                    new Error(
                        JSON.stringify({
                            status: error.response?.data?.status || 401,
                            statusText: error.response?.data?.statusText || 'ERROR',
                            message: error.response?.data?.message || 'Unauthorized',
                        })
                    )
                );
            }
        }).catch(next);
    };

export const admin =
    ({ required, roles = ['DEV', 'MOD', 'ADMIN'] } = {}) =>
    (req, res, next) => {
        return new Promise(async (resolve, reject) => {
            if (!req.headers.authorization)
                return reject(new Error(JSON.stringify({ status: 401, message: 'Unauthorized' })));
            try {
                const token = req.headers.authorization;
                const bufToken = token.split('.')[1];
                const dataToken = JSON.parse(Buffer.from(bufToken, 'base64').toString());

                let me = await getCache({ model: 'user', alias: 'me', queryParams: { authorization: dataToken.id } });
                if (me) {
                    me = JSON.parse(me);
                } else {
                    me = await $get(['users', 'me'], {
                        headers: {
                            authorization: token,
                        },
                    });
                    await setCache({
                        model: 'user',
                        expire: 100,
                        data: me,
                        alias: 'me',
                        queryParams: { authorization: dataToken.id },
                    });
                }
                if (!me?.data || me?.status !== 200 || !roles.includes(me.data.role))
                    return reject(new Error(JSON.stringify({ status: 401, message: 'Unauthorized' })));

                // Nếu k phải MOD,ADMIN thì check xem có quyền dev k mới cho update
                if (!['MOD', 'ADMIN'].includes(me.data.role) && !me.data.devScopes?.includes(service))
                    return reject(new Error(JSON.stringify({ status: 401, message: 'Unauthorized' })));

                req.viewer = me.data;
                next();
            } catch (error) {
                return reject(
                    new Error(
                        JSON.stringify({
                            status: error.response?.data?.status || 401,
                            statusText: error.response?.data?.statusText || 'ERROR',
                            message: error.response?.data?.message || 'Unauthorized',
                        })
                    )
                );
            }
        }).catch(next);
    };

export const backdoor =
    ({ required, roles = [] } = {}) =>
    (req, res, next) => {
        console.log('backdoor');
        return new Promise(async (resolve, reject) => {
            if (!req.headers.authorization)
                return reject(new Error(JSON.stringify({ status: 401, message: 'Unauthorized' })));

            try {
                // Chạy thật mới check
                if (env === 'production') {
                    let verify = await getCache({
                        model: 'backdoors',
                        alias: 'verify',
                        queryParams: { authorization: req.headers.authorization },
                    });
                    if (verify) {
                        verify = JSON.parse(verify);
                    } else {
                        verify = await $get(['backdoors', 'verify'], {
                            headers: {
                                authorization: req.headers.authorization,
                            },
                        });
                        await setCache({
                            model: 'backdoors',
                            expire: 100,
                            data: verify,
                            alias: 'verify',
                            queryParams: { authorization: req.headers.authorization },
                        });
                    }
                    // console.log('verify', verify);
                    if (!verify?.data || verify?.status !== 200 || !verify?.data?.scopes?.includes(service))
                        return reject(new Error(JSON.stringify({ status: 401, message: 'Unauthorized' })));
                }
                next();
            } catch (error) {
                // console.log('token error', error);
                return reject(
                    new Error(
                        JSON.stringify({
                            status: error.response?.data?.status || 401,
                            statusText: error.response?.data?.statusText || 'ERROR',
                            message: error.response?.data?.message || 'Unauthorized',
                        })
                    )
                );
            }
        }).catch(next);
    };
