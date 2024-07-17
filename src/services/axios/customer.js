import { serviceToken } from '../../config';
import { $post } from '.';

const paths = ['customers'];

const headers = {
    Authorization: `Bearer ${serviceToken}`,
};

const findOne = (query) => {
    return $post(paths, [{ method: 'findOne', query }], { headers }).then((res) => {
        try {
            if (res.data.length && res.data[0].response?.status === 200 && res.data[0].response.data) {
                return res.data[0].response.data;
            }
            throw new Error('Truy vấn thất bại!');
        } catch (error) {
            console.log('findOne', error);
            throw new Error(error.toString());
        }
    });
};
const findMany = (query) => {
    return $post(paths, [{ method: 'findMany', query }], { headers });
};
const addOne = (data) => {
    return $post(paths, [{ method: 'addOne', data }], { headers });
};
const deleteOne = (query) => {
    return $post(paths, [{ method: 'deleteOne', query }], { headers });
};

export default {
    findOne,
    findMany,
    addOne,
    deleteOne,
};
