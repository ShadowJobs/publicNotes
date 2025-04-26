

function padLeftZero(str) {
  return ('00' + str).substr(str.length);
}
// formatDate(new Date(),"yy-MM-dd hh:mm:ss")日期格式化
export function formatDate(date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };

  // 遍历这个对象
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
};

//将数字转化为保留2位小数的百分比，且最后1位不进行四舍五入，且不带0。有效处理范围是1e10以内
export function toPercent(num) {
  let n = 2
  // let ret=(num*100).toString() //这么写有特殊情况，0.55在*100后会变成55.00000000000001,导致最终结果变成55.00
  let ret = (Math.round(num * 1e5) / 1e3).toString()
  //这么写可以保证0.55后面的 注意5和3的差是要保留的小数位数n
  //注意如果1e5写得过大，比如写成1e20/1e18,那么末尾的1还是会保留，所以够用就行

  if (ret.indexOf(".") == -1) return ret //结果为正数，直接返回
  ret = ret.slice(0, ret.indexOf(".") + n + 1);
  return ret
}

export function clamp(str, len) {
  var reg = /[\u4e00-\u9fa5]/g,    //专业匹配中文
    slice = str.substring(0, len),
    chineseCharNum = (~~(slice.match(reg) && slice.match(reg).length)),
    realen = slice.length * 2 - chineseCharNum;
  return str.substr(0, realen) + (realen < str.length ? "..." : "");
}

export function myTofix(num) { //保留2位小数
  let ret = (Math.round(num * 1e5) / 1e5).toString()
  if (ret.indexOf(".") == -1) return ret
  ret = ret.slice(0, ret.indexOf(".") + 3);
  return ret
}
console.log(myTofix(0)); console.log(myTofix(1.2));
console.log(myTofix(1.20000)); console.log(myTofix(1.25678));
console.log(myTofix(0.55));

console.log(1.2566.toFixed(2)); //原始的toFixed会四舍五入
console.log(1.0.toFixed(2)); //原始的toFixed会强制保留2位小数




////将obj转换为url
export function toUrl(paramObj) {
  if (!paramObj) {
    return ''
  }
  let paramList = []
  Object.keys(paramObj) && Object.keys(paramObj).forEach(key => {
    let val = paramObj[key]
    if (val instanceof Array) {
      val.forEach(_val => {
        paramList.push(key + '=' + _val)
      })
    } else if (val != undefined) {
      paramList.push(key + '=' + val)
    }
  })
  return paramList.join('&')
}  
