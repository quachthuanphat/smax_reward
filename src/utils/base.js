import crypto from 'crypto';

export const isArray = (data) => {
    return Array.isArray(data) && data.length;
};

export const random = function (len, chars, unique = false) {
    switch (chars) {
        case 1:
            chars = '0123456789';
            break;
        case 2:
            chars = 'ABCDEFGHIJKLMNOPQRSTUWXYZ';
            break;
        case 3:
            chars = 'abcdefghijklmnopqrstuwxyz';
            break;
        case 4:
            chars = 'ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuwxyz';
            break;
        case 5:
            chars = '0123456789ABCDEFGHIJKLMNOPQRSTUWXYZ';
            break;
        case 6:
            chars = '0123456789abcdefghijklmnopqrstuwxyz';
            break;
        default:
            chars = typeof chars == 'string' ? chars : 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
    }
    if (unique) {
        //remove char duplicate
        chars = this.arrayUnique(chars.split('')).join('');
        if (len > chars.length) {
            return false;
        }
    }

    var rnd = crypto.randomBytes(len);
    var value = new Array(len);
    var d = 256 / Math.min(256, chars.length);

    for (let i = 0; i < len; i++) {
        let pos = Math.floor(rnd[i] / d);
        value[i] = chars[pos];

        if (unique) {
            //remove char[pos]
            chars = chars.replace(chars[pos], '');
            d = 256 / Math.min(256, chars.length);
        }
    }
    return value.join('');
};
