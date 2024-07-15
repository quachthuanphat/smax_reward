import { Router } from 'express';
// import user from './user'
import apiBackdoor from './backdoor';
import apiPublic from './public';
import { token, backdoor } from '../services/biz';
import { service } from '../config';

const router = new Router();

/**
 * @apiDefine master Master access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine admin Admin access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine user User access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine listParams
 * @apiParam {String} [q] Query to search.
 * @apiParam {Number{1..30}} [page=1] Page number.
 * @apiParam {Number{1..100}} [limit=30] Amount of returned items.
 * @apiParam {String[]} [sort=-createdAt] Order of returned items.
 * @apiParam {String[]} [fields] Fields to be returned.
 */
// router.use('/users', user)
// router.use('/users', user)
router.use(`/${service}`, backdoor({ required: true }), apiBackdoor);

// router.use(`/bizs/:bizId/${service}`, token({ required: true }), apiPublic);
router.use(`/bizs/:bizId/${service}`, apiPublic);

export default router;
