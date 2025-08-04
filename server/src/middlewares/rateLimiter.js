import {RedisStore} from 'rate-limit-redis'
import redisClient from '../helper/redisClient.js'
import rateLimit from 'express-rate-limit'


export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});

export const authLimiter = rateLimit({
    limit:100,
    windowMs:10 * 60 * 1000,
    legacyHeaders:false,
    standardHeaders:true,
    message:"Too many signup/login requests. Try again later!",
    store:new RedisStore({
        sendCommand:(...args)=>redisClient.sendCommand(args),
    })
})

export const searchLimiter = rateLimit({
  windowMs: 8 * 60 * 1000,
  max: 100,
  message: "Too many searches. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});