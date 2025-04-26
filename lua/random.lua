-----线性同余法求随机数
RandomGenerator = {}

local q1 = 8039
local a1 = 113
local K = 4*q1 + 1
local C = 2*a1 + 1
local M = 2^16
local function random(lastseed)
    local seed = lastseed % M
    seed = K*seed + C
    seed = seed % M
    return seed / M, seed
end

--[[
    @desc ÉèÖÃËæ»úÖÖ×Ó¡£
]]
function RandomGenerator:randomseed(seed)
    if seed==nil then
        -- seed = os.time()
        seed = tonumber(tostring(os.time()):reverse():sub(1, 6))
    end
    self._seed = seed
end

function RandomGenerator:getRandomseed()
    return self._seed
end

function RandomGenerator:rand()
    local r = 0
    r, self._seed = random(self._seed)
    return r
end

--[[
    @desc ²úÉúÒ»¸öÌØ¶¨·¶Î§ÄÚµÄ°´Æ½¾ù·Ö²¼Ëæ»úÊý¡£
    @param n, m Ö¸¶¨Ëæ»úÊý·¶Î§¡£
        Èç¹ûn,m¶¼Îªnil£¬Ôò·µ»Ø0~1µÄ¸¡µãËæ»úÊý£»
        Èç¹û½ömÎªnil£¬Ôò·µ»Ø1~nµÄËæ»úÕûÊý£»
        Èç¹ûn,m¶¼²»Îªnil£¬Ôò·µ»Øn~mµÄËæ»úÕûÊý¡£
]]
function RandomGenerator:random(n, m)
    if n==nil then
        return self:rand()
    elseif m==nil then
        return math.floor(self:rand()*n) + 1
    else
        return math.floor(self:rand()*(m+1-n)) + n
    end
end

--[[
    @desc ¸ù¾ÝÌØ¶¨·Ö²¼²úÉúÒ»¸öÀëÉ¢Ëæ»ú±äÁ¿
    @param distribution ÀëÉ¢¸ÅÂÊ·Ö²¼º¯Êý£¬ÓÃÊý×é±íÊ¾£¬ÆäµÚi¸öÔªËØµÄÖµ
        P[i] = P(X in {X1,X2,...Xi})
        ·µ»ØXiµÄ¸ÅÂÊ
        P(X=Xi) = P[i]-P[i-1]
    @return ²úÉúµÄËæ»ú±äÁ¿µÄÏÂ±ê
]]
function RandomGenerator:discreteRandom(distribution)
    assert(distribution~=nil)
    local r = self:rand()
    local i = 1
    local n = #distribution
    while i<=n do
        local prob = distribution[i]
        if prob==nil or r<=prob then
            return i
        end
        i = i+1
    end
    return i
end
RandomGenerator:randomseed(os.time())
print(RandomGenerator:random())