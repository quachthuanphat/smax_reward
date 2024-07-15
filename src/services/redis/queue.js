// import { redis } from '../../config'
// import Redis from 'ioredis'
import { redis, service } from '../../config'
import redisUrl from 'redis-url'
// export const createClient = new Redis(redis.port, redis.host);
const parseURI = redisUrl.parse(redis.uri)
const redisConfig = {
  host: parseURI.hostname,
  port: Number(parseURI.port),
}
if(parseURI.password) {
  redisConfig.password = parseURI.password
}
export const opts = {
  redis: redisConfig,
  prefix: 'bull-'+service
  // createClient: redisClient
}

// import Redis from 'redis'
// var client = new Redis(redis.port, redis.host);
// var subscriber = new Redis(redis.port, redis.host);

// client.on('error', function (err) {
//   console.log('client error', err.toString());
//   client.quit();
//   return (typeof cb == 'function') ? cb(false) : resolve(false);
// });
// subscriber.on('error', function (err) {
//   console.log('subscriber error', err.toString());
//   subscriber.quit();
//   return (typeof cb == 'function') ? cb(false) : resolve(false);
// });
// /**
//  * Notes:

//  * bclient connections cannot be re-used, so you should return a new connection each time this is called.
//  * client and subscriber connections can be shared and will not be closed when the queue is closed. When you are shutting down the process, first close the queues, then the shared connections (if they are shared).
//  * if you are not sharing connections but still using createClient to do some custom connection logic, you may still need to keep a list of all the connections you created so you can manually close them later when the queue shuts down, if you need a graceful shutdown for your process
//   do not set a keyPrefix on the connection you create, use bull's built-in prefix feature if you need a key prefix
//  */
// export const opts = {
//   createClient: function (type) {
//     // console.log('-----type redis:', type);
//     // return new Redis(redis.port, redis.host);
//     switch (type) {
//       case 'client':
//         return client;
//       case 'subscriber':
//         return subscriber;
//       case 'bclient':
//         return new Redis(redis.port, redis.host);
//       default:
//         throw new Error('Unexpected connection type: ', type);
//     }
//   }
// }
