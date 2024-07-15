import { success, notFound } from '../../../services/response';
import Coupon from '../../models/coupon';

export const create = (req, res, next) => {
    const { biz, viewer, bodymen } = req;
    console.log('biz, viewer, bodymen :>> ', biz, viewer, bodymen);
    return res.send('123');
};
