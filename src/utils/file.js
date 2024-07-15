import mime from 'mime-types';
import moment from 'moment';
import fs from 'fs';

import { file, baseUrl } from '../config';

const acceptType = file.acceptType;

const DEFAULT_OPTION = { uploadType: 'path', folder: 'media/uploads', ext: Object.keys(acceptType) };

const createFolder = (dir) => {
    console.log('dir :>> ', dir);
    return new Promise(function (resolve, reject) {
        fs.access(dir, fs.constants.F_OK, (err) => {
            console.log('err :>> ', err);
            if (err) {
                //no such file or folder
                if (err.code == 'ENOENT') {
                    fs.mkdir(dir, { recursive: true }, (err) => {
                        if (err) {
                            console.log('err 111 :>> ', err);
                            console.log('fs.mkdir', err);
                            return resolve(false);
                        } else {
                            return resolve(true);
                        }
                    });
                } else {
                    //not permitted or any reasons
                    console.log('fs.access', err);
                    return resolve(false);
                }
            } else {
                return resolve(true);
            }
        });
    });
};

export const uploadFile = async (file, options = null) => {
    try {
        if (!file) return null;

        const uploadOptions = options || { ...DEFAULT_OPTION };

        const fileSize = file.size;
        const applicationFileSize = file.maximum_photo;
        if (fileSize > applicationFileSize) return { error: 'Image was too big' };

        const fielType = mime.extension(file.mimetype);

        const conditionInvalidFile = Object.keys(acceptType).includes(fielType) && Object.values(acceptType).includes(file.mimetype);

        if (!conditionInvalidFile) return { error: 'Invalid file' };

        const dir = `${baseUrl}/${options.folder}/${moment(new Date()).format('YYYY/MM/DD')}`;

        await createFolder(dir);
    } catch (error) {
        console.log('error :>> ', error);
    }
};
