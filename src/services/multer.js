import multer from 'multer';
import mime from 'mime-types';
import moment from 'moment';
import { random } from '../utils/base';

const acceptType = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
};

const limit = {
    fields: 100, //Max number of non-file fields
    fileSize: 1000000 * 10, //the max file size (in bytes) (~20MB)
    parts: 1000, //the max number of parts (fields + files)
};

const validExtension = (file) => {
    try {
        const fielType = mime.extension(file.mimetype);
        return Object.keys(acceptType).includes(fielType) && Object.values(acceptType).includes(file.mimetype);
    } catch (e) {
        console.log(e);
        return false;
    }
};

/**
 * diskStorage: lưu vào folder /tmp hoặc /folder chỉ định, trả ra path file
 * Lưu ý: nhớ validate và remove những ký tự đặc biệt
 */
export const uploadDisk = multer({
    fileFilter: async (req, file, cb) => {
        if (validExtension(file)) {
            return cb(null, true);
        }
        return cb(new Error('File type is not allowed'));
    },
    limits: limit,
    storage: multer.diskStorage({
        //sau khi lưu vào tmp
        filename: (req, file, cb) => {
            const name = random(50);
            return cb(null, `${moment().format('YYYYMMDDHHmmss')}-${name}`);
        },
    }),
});

/**
 * memoryStorage: lưu vào bộ nhớ, trả ra file dạng <Buffer 89 50 4e 47 ....>
 * Lưu ý: không nên dùng cho upload public và những file lớn, dễ tràn bộ nhớ
 *
 */
export const uploadMemory = multer({
    fileFilter: async (req, file, cb) => {
        //tiền xử lý (chưa lưu vào memory storage)
        //clog(file)
        // if (validExtension(file)) {
        //     return cb(null, true);
        // }
        return cb(new Error('File type is not allowed'));
    },
    limits: limit,
    storage: multer.memoryStorage(),
});
