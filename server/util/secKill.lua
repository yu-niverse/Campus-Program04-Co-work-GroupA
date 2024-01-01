local productId = KEYS[1]
local userId = KEYS[2]
local userKey = "user:" .. userId .. ":product:" .. productId
local quantity = tonumber(ARGV[1]) or 1 -- 默认为 1，如果传递了参数则使用传递的值

local inventory = tonumber(redis.call('get', 'product:' .. productId .. ':inventory') or 0)

if inventory >= quantity then
  redis.call('decrby', 'product:' .. productId .. ':inventory', quantity)
  redis.call('set', userKey, 'true')
  return quantity
else
  return 0
end




-- local product_id = KEYS[1]
-- local n = tonumber(ARGV[1])
-- -- local order_list = ARGV[2]
-- -- local user_name = ARGV[3]
-- redis.log(redis.LOG_NOTICE, "n:", n)
-- -- redis.log(redis.LOG_NOTICE, "order_list:", order_list)
-- -- redis.log(redis.LOG_NOTICE, "user_name:", user_name)

-- -- 添加额外的检查以确保 n 不是 nil 且不是 NaN
-- if n == nil or n ~= n then
--   redis.log(redis.LOG_NOTICE, "Invalid value for n:", n)
--   return 0
-- end

-- local vals = redis.call("HMGET", product_id, "Total", "Booked")
-- local total = tonumber(vals[1]) or 0
-- local booked = tonumber(vals[2]) or 0
-- redis.log(redis.LOG_NOTICE, "total:", total)
-- redis.log(redis.LOG_NOTICE, "booked:", booked)

-- if total == nil or booked == nil then
--   redis.log(redis.LOG_NOTICE, "total or booked is nil")
--   return 0
-- end

-- if booked + n <= total then
--   -- redis.call("HINCRBY", product_id, "Booked", n)
--   -- redis.call("LPUSH", order_list, user_name)
--   return n
-- else
--   redis.log(redis.LOG_NOTICE, "Booking failed due to insufficient availability")
-- end

-- return 0
