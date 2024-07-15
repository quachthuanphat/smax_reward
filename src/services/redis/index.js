import { redis } from '../../config'
import { createClient } from 'redis'
// export const createClient = new Redis(6379, 'localhost');

console.log('redis', redis)
export const redisClient = createClient({
  url: redis.uri,
  // prefix: redis.prefix
}); // ket noi local lai rat ngon ki ghe
// redisClient.connect();
// export const redisClient = createClient({ host: 'redis' });
// console.log('redisClient', redisClient);
// redisClient.connect();
// console.log('redisClient', redisClient);
// // process.env.REDIS_URL || "redis://localhost:6379"
// // redis://redis:6379

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connect success'));

/** GET value of KEY
 *
 * @param key string
 * @param cb function
 * @returns {Promise|any|Promise<T>} (value|false)
 */
export const getRedis = async (key) => {
  // try {
  //   const data = await redisClient.get(key);
  //   console.log('data', data)
  //   return data
  // } catch (error) {
  //   console.log('error', error)
  // }
  // return false;
  return new Promise(function (resolve) {
    // create client
    // const redisClient = createClient(redis.port, redis.host);
    // redisClient.on('ready', function () {
    redisClient.get(key, function (err, reply) {
      // redisClient.quit();
      let v = err ? false : reply;
      return (typeof cb == 'function') ? cb(v) : resolve(v);
    });
    // });
    //catch error
    // redisClient.on('error', function (err) {
    //   redisClient.quit();
    //   return (typeof cb == 'function') ? cb(false) : resolve(false);
    // });
  });
}

/** SET value into KEY
     * SET KEY VALUE [EX seconds|PX milliseconds] [NX|XX|null]
     * @param key
     * @param value
     * @param expire
     * @returns {Promise|any|Promise<T>} (true|false)
     */
export const setRedis = async (key, value, expire = 3600) => {
  // try {
  //   const data = await redisClient.set(key, value, 'EX', expire)
  //   return data;
  // } catch (error) {
  //   console.log('error setRedis', error);
  // }
  // return false
  return new Promise(function (resolve) {
    redisClient.set(key, value, 'EX', expire, function (err, rep) {
      // redisClient.quit();
      return (err) ? resolve(false) : resolve(true);
    });
  });
}

/** DEL key
*
* @param key string
* @param cb function
* @returns true|false
*/
export const removeRedis = (key, cb) => {
  return new Promise(function (resolve) {
    // get all tên từ khóa giống key => xóa
    redisClient.keys(key, async function (err, keys) {
      if (keys?.length) {
        await Promise.all(keys.map((key) => {
          return new Promise((resolve, reject) => {
            redisClient.del(key, function (err) {
              let v = err ? false : true;
              return (typeof cb == 'function') ? cb(v) : resolve(v);
            });
          })
        }))
      }
      return (typeof cb == 'function') ? cb(keys) : resolve(true);
    });
  });
}
