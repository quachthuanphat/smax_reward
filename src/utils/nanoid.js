import { customAlphabet } from 'nanoid';

/**
 * @param {number} size: Số lượng kí tự (Mặc định: 8)
 * @param {number} format: Định mạng mã (Mặc định: 0 - cả chữ hoa, thường và số)
 *  - 0: Chữ hoa, thường, số
 *  - 1: Chữ hoa và số
 *  - 2: Chũ thường và số
 *  - 3: Chỉ chữ hoa
 *  - 4: Chỉ chữ thường
 *  - 5: Chỉ số
 */
export const generateCode = (size = 10, format = 0) => {
  const objType = {
    0: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    1: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    2: "0123456789abcdefghijklmnopqrstuvwxyz",
    3: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    4: "abcdefghijklmnopqrstuvwxyz",
    5: "0123456789",
  }
  format = isNaN(Number(format)) || Number(format) < 0 || Number(format) > 5 ? 0 : format;
  const nanoid = customAlphabet(objType[format], size)
  return nanoid();
}
