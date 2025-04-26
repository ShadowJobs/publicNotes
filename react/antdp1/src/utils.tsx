import { message } from "antd";
import { GaodeKey } from "./global";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import _ from "lodash";
import SparkMD5 from 'spark-md5';
// import { Parser } from 'json2csv';
// import { saveAs } from 'file-saver';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const authorizationError = (response: any) => {
  switch (response.status) {
    case 401:
      message.error('401: The authentication information has expired. Please refresh the interface or log in again.');
      return true;
    case 403:
      message.error('403: No relevant authority, request rejected');
      return true;
    default:
      return false;
  }
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length);
}
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
export function toPercent(num: number, n = 2) { //转为%
  let ret = (Math.round(num * 1e7) / 1e5).toString()
  if (ret.indexOf(".") == -1) return ret + "%"
  ret = ret.slice(0, ret.indexOf(".") + n + 1) + "%";
  return ret
}
export function myTofix(num: number) { //保留2位小数
  let ret = (Math.round(num * 1e5) / 1e5).toString()
  if (ret.indexOf(".") == -1) return ret
  ret = ret.slice(0, ret.indexOf(".") + 3);
  return ret
}
export function strTofixed(num: string, n: number = 3) { //保留2位小数
  return num.indexOf(".") == -1 ? num : num.slice(0, num.indexOf(".") + n + 1);
}
export function toUrl(paramObj: any) {
  if (!paramObj) {
    return ''
  }
  let paramList: string[] = []
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

export function getMousePosInElement(e: any, element: any) {
  let rect = element.getBoundingClientRect()
  let x = e.clientX - rect.left
  let y = e.clientY - rect.top
  return { x, y }
}

//将长字符串折行显示
export function splitStr(str: string, len: number) {
  let strArr = str.split("")
  let strLen = strArr.length
  let strArr2 = []
  let str2 = ""
  for (let i = 0; i < strLen; i++) {
    if (i % len == 0 && i != 0) {
      strArr2.push(str2)
      str2 = ""
    }
    str2 += strArr[i]
  }
  strArr2.push(str2)
  return strArr2.join("\n")
}

export function deepCompareTwoObj(obj1: any, obj2: any) {
  if (typeof obj1 != "object" || typeof obj2 != "object") {
    return obj1 === obj2
  }
  if (Object.keys(obj1).length != Object.keys(obj2).length) {
    return false
  }
  for (let key in obj1) {
    if (!deepCompareTwoObj(obj1[key], obj2[key])) {
      return false
    }
  }
  return true
}

//去掉字符串里的\n
export function removeEnter(str: string) {
  return str.replace(/\n/g, "")
}

///颜色渐变生成
// 颜色#FF00FF格式转为Array(255,0,255)
function color2rgb(color) {
  var r = parseInt(color.substr(1, 2), 16);
  var g = parseInt(color.substr(3, 2), 16);
  var b = parseInt(color.substr(5, 2), 16);
  return new Array(r, g, b);
}

// 颜色Array(255,0,255)格式转为#FF00FF
function rgb2color(rgb) {
  var s = "#";
  for (var i = 0; i < 3; i++) {
    var c = Math.round(rgb[i]).toString(16);
    if (c.length == 1)
      c = '0' + c;
    s += c;
  }
  return s.toUpperCase();
}

// 生成渐变
export function gradient(startColor: string, endColor: string) {
  var result = [];
  var Step = 10;

  var Gradient = new Array(3);
  var A = color2rgb(startColor);
  var B = color2rgb(endColor);

  for (var N = 0; N <= Step; N++) {
    for (var c = 0; c < 3; c++) // RGB通道分别进行计算
    {
      Gradient[c] = A[c] + (B[c] - A[c]) / Step * N;
    }
    result.push(rgb2color(Gradient))
  }
  return result
}

export function getGradientColorByStep(startColor: string, endColor: string, step: number) {
  var Gradient = new Array(3);
  var A = color2rgb(startColor);
  var B = color2rgb(endColor);
  for (var N = 0; N <= step; N++) {
    for (var c = 0; c < 3; c++) // RGB通道分别进行计算
    {
      Gradient[c] = A[c] + (B[c] - A[c]) / step * N;
    }
  }
  return rgb2color(Gradient)
}
///颜色渐变生成

const safeReq = async (req: Function, callback?: Function, hideMsg?: boolean) => {
  try {
    const result = await req()
    if (result && result.code == 0) {
      callback?.(result)
      return result
    } else {
      if (!hideMsg) {
        message.error('Server status error')
        message.error(result.message + ",\ncode=" + result.code)
      }
      console.log(result)
      return result
    }
  } catch (error) {
    console.log(error);
    if (!hideMsg) {
      message.error('Response parse error')
    }
  }
}

const tryGetJson = (s: string) => {
  if (s.startsWith("json:"))
    return JSON.parse(s.slice(5, s.length))
  return s
}
const tableUnitRender = (d, row) => {
  const json = typeof row.precision == "string" ? tryGetJson(row.precision) : row.precision
  if (typeof json != "object")
    return d.toFixed ? d.toFixed(2) : d
  else return <div style={{ backgroundColor: json.bgColor }}>{json.value.toFixed ? json.value.toFixed(2) : json.value}</div>
}

export const sortByTime = (a, b) => {
  return new Date(a.time) - new Date(b.time);
}
export const sortByDate = (a, b) => {
  return new Date(a.date) - new Date(b.date);
}

export const apiTitles = ['SUCCESS_RATE', 'AVG_TIME', 'QPS']
export const getApiTitle = (selectType) => {
  switch (selectType) {
    case 'AVG_TIME':
      return "API Cost Time Average";
    case 'QPS':
      return "API QPS";
    case 'SUCCESS_RATE':
      return "API Request Success Ratio";
    default:
      return selectType
  }
}

export const addPreSum = (data) => {
  data?.body?.blocks.map(v => {
    if (v.type == 'table') {
      const preSum = v.table.tableStyle.tableColumnProperties.map(v2 => v2.width)
      for (let i = 1; i < preSum.length; ++i) preSum[i] = preSum[i - 1] + preSum[i]
      v.preSum = preSum
    }
  })
}

export const getHeadStyle = (fsStyle: any) => {
  const style: any = {}
  if (fsStyle?.headingLevel) {
    style.fontWeight = 500
    if (fsStyle.headingLevel == 1) {
      style.fontSize = 21
    } else if (fsStyle.headingLevel == 2) { style.fontSize = 18 }
    else if (fsStyle.headingLevel == 3) { style.fontSize = 16 }
    else if (fsStyle.headingLevel == 4) { style.fontSize = 14 }
    else if (fsStyle.headingLevel == 5) { style.fontSize = 12 }
    else if (fsStyle.headingLevel == 6) { style.fontSize = 10 }
  }
  return style
}

export const changeToTreeData = (d: any): any[] => {
  const result: any[] = []
  d.map((v, idx) => {
    const newV = { value: v.fft_node_key, title: v.node_name }
    if (v.children) {
      newV.children = changeToTreeData(v.children)
    }
    result.push(newV)
  })
  return result
}
export var tableToExcel = (function () {
  var uri = 'data:application/vnd.ms-excel;base64,',
    template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
    base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) },
    format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };
  return function (table: any, name: string, filename: string) {
    if (!table.nodeType) table = document.getElementById(table)
    var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
    document.getElementById("dlink").href = uri + base64(format(template, ctx));
    document.getElementById("dlink").download = filename;
    document.getElementById("dlink").click();
  }
})()

export const tableToExcelXlsx = (tableId: string, sheetName: string, fileName: string) => {
  var table = document.getElementById(tableId);
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${fileName}.xlsx`);
};

const clickHtmlList = async (html_list) => {
  document.getElementById("dlink").href = res.data.url?.replace("http:", "https:");
  document.getElementById("dlink").download = "download.csv";
  document.getElementById("dlink").click();
}

export const downloadData = (dataSource) => {
  // const parser = new Parser();
  // const csv = parser.parse(dataSource);
  // const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  // saveAs(blob, 'data.csv');
}

export async function savePageWithStyles() {
  const styles = await getStyles();
  const pageContent = '<html>' + document.head.outerHTML + styles + document.body.outerHTML + '</html>';
  const blob = new Blob([pageContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // 创建隐藏的下载链接元素
  const link = document.createElement('a');
  link.href = url;
  link.download = 'saved_page_with_styles.html';
  link.style.display = 'none';

  // 将链接添加到DOM中，触发点击事件进行下载，然后移除该链接
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 调用函数以保存页面
async function getStyles() {
  const styleSheets = Array.from(document.styleSheets);
  let styles = '';

  for (const sheet of styleSheets) {
    try {
      if (sheet.cssRules) { // 对于内联CSS样式
        styles += Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } else if (sheet.href) { // 对于外部CSS样式表
        const response = await fetch(sheet.href);
        if (response.ok) {
          const text = await response.text();
          styles += text;
        }
      }
    } catch (e) {
      console.warn(`无法加载样式表：${sheet.href}`, e);
    }
  }
  return `<style>${styles}</style>`;
}

export const loadGaode = (initMap: Function) => {
  if (window.AMap) {
    initMap()
  } else {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${GaodeKey}`;
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => { //loca组件依赖AMap
      const locScript = document.createElement("script");
      locScript.src = `https://webapi.amap.com/loca?key=${GaodeKey}&v=1.3.2`;
      locScript.async = true;
      document.head.appendChild(locScript);
      locScript.onload = () => initMap()
    }
  }
}
// 并行加载高德地图和定位插件，有问题，loca组件依赖AMap，如果先加载Loca会有报错，
const loadGaode_deprecated = (initMap: Function) => {
  const loadedHash = { map: false, loca: false }
  const afterLoad = (mapJsName) => {
    if (mapJsName == 'all') {
      initMap()
    } else if (mapJsName == 'map') {
      loadedHash.map = true
      if (loadedHash.loca) initMap()
    } else if (mapJsName == 'loca') {
      loadedHash.loca = true
      if (loadedHash.map) initMap()
    }
  }
  if (!window.Loca) {
    const locScript = document.createElement("script");
    locScript.src = `https://webapi.amap.com/loca?key=${GaodeKey}&v=1.3.2`;
    locScript.async = true;
    document.head.appendChild(locScript);
    locScript.onload = () => afterLoad('loca')
  }
  if (!window.AMap) {
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${GaodeKey}`;
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => afterLoad('map')
    // 经实测，css如果采用这种方式，会导致css样式失效，所以改用在document.ejs里引入
    // const locAmapCss = document.createElement("script");
    // locAmapCss.src = "https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css";
    // locAmapCss.async = true;
    // document.head.appendChild(locAmapCss);
  }
  if (window.AMap && window.Loca) {
    afterLoad('all');
  }
}

export const getMapInfoWinStr = (content: any) => {
  var trStr = '';
  for (var name in content) {
    var val = content[name];
    trStr +=
      '<tr>' +
      '<td class="label" style="font-weight:bold;">' + name + ': </td>' +
      '<td>&nbsp;</td>' +
      '<td class="content">' + (name == "link" ? `<a href="${val}" target="_blank">GO</a>` : val) + '</td>' +
      '</tr>'
  }
  return trStr
}
// 数字转为1000万，1亿格式
const formatNumber = (num) => {
  let absNum = Math.abs(num);
  if (absNum < 10000) {
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  } else if (absNum >= 10000 && absNum < 100000000) {
    return `${(num / 10000).toFixed(absNum % 10000 === 0 ? 0 : 2)}万`;
  } else {
    return `${(num / 100000000).toFixed(absNum % 100000000 === 0 ? 0 : 2)}亿`;
  }
}

const eliminateAsyncCall = (fn: Function) => {
  // 基本面思路：重写fetch，并使用缓存。
  // 在fetch里判断缓存的状态，success和error表示有缓存，success可以直接返回缓存不用请求，error则抛出缓存的错误也不用请求，
  // pendding表示没有缓存，需要请求，请求成功后，将缓存状态改为success，请求失败后，将缓存状态改为error。
  // pendding时需要抛出错误，错误就是catch里要等待执行的promise，也就是原来的fetch，
  // 传递给catch后，catch里面的promise执行完毕后，会执行finally，这里将fetch还原，否则后续的fetch都会使用缓存
  const oldFetch = window.fetch
  const cache = {
    status: "pendding", // pendding,success,error
    data: null,
  }
  window.fetch = (...args) => {
    if (cache.status == 'success') return cache.data
    else if (cache.status == 'error') throw cache.data
    const promise = oldFetch(...args).then(res => res.json()).then(res => {
      cache.status = 'success'
      cache.data = res
    }, err => {
      cache.status = 'error'
      cache.data = err
    })
    throw promise
  }
  try {
    fn()
  } catch (error) {
    console.log(error);
    if (error instanceof Promise) {
      error.then(fn, fn).finally(() => {
        window.fetch = oldFetch
      })
    }
  }
}
const deepClone2 = async (obj) => {
  new Promise((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = (e) => {
      console.log(e.data.c === obj.c);
      obj.c.a = 10
      console.log(e.data)
      console.log(obj)
      resolve(e.data) //做成异步，因为是在回调里才能拿到结果
    }
    port2.postMessage(obj);
  })
}
const deepCloneSelf = (obj) => {
  const objMap = new Map()
  const _deepClone = (obj) => {
    const type = typeof obj
    if (type != "object" || obj == null) return obj
    if (objMap.has(obj)) return objMap.get(obj)
    const newObj = Array.isArray(obj) ? [] : {}
    objMap.set(obj, newObj)
    for (let key in obj) {
      newObj[key] = _deepClone(obj[key])
    }
    return newObj
  }
  return _deepClone(obj)
}

export const deepClone = async (obj) => {
  // 方法1：JSON.stringify(obj) //报错
  // 方法2: messageChannel
  let result = await deepClone2(obj)
  console.log(result)
  // 方法3：worker?
  // 方法5：递归
  console.log(deepCloneSelf(obj))
  // 方法6：lodash
  console.log(_.cloneDeep(obj))
}
export const deepCopy = (obj) => {
  return _.cloneDeep(obj)
}

export function generateRandomWords(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.';
  for (let i = 0; i < length; i++) {
    Math.random() > 0.7 ?
      result += " " :
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const chars = '0123456789abcdefghijkl mnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
// 转换为62进制0-9,a-z,A-Z
function toBase62(n) {
  if (n === 0) return '0';
  let s = '';
  while (n > 0) {
    s = chars[n % 62] + s;
    n = Math.floor(n / 62);
  }
  return s;
}
// console.log(toBase62(123456789)); // 输出: '8M0kX'
export const downloadFile = (url, name) => {
  fetch(url).then(response => response.blob()).then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  })
    .catch(e => console.error(e));
}

export const delay = (ms: number): void => {
  let startTime = Date.now()
  let i = 1e9
  while (Date.now() - startTime < ms) {
    i *= 2; i /= 2
  }
}

export const getFileMd5 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
      chunkSize = 2097152,                             // Read in chunks of 2MB
      chunks = Math.ceil(file.size / chunkSize),
      currentChunk = 0,
      spark = new SparkMD5.ArrayBuffer(),
      fileReader = new FileReader();

    fileReader.onload = function (e) {
      // console.log('read chunk nr', currentChunk + 1, 'of', chunks);
      spark.append(e.target.result);                   // Append array buffer
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        console.log('finished loading');
        const hash=spark.end()
        console.info('computed hash', hash);  // Compute hash
        resolve(hash)
      }
    };

    fileReader.onerror = function () {
      console.warn('oops, something went wrong.');
    };

    function loadNext() {
      var start = currentChunk * chunkSize,
        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();
  });
}
export type Chunk={blob:Blob,progress:number,finished:boolean}
export const getFileChunks=(file:File,chunkSize:number):Chunk[]=>{
  const chunks:Chunk[] = [];
  if(!file) return chunks
  let i = 0;
  while (i < file.size) {
    chunks.push({ blob: file.slice(i, i + chunkSize), progress: 0, finished: false });
    i += chunkSize;
  }
  return chunks
}


export const downloadFromObs = async (getUrlFunc,fileName) => {
  const result = await getUrlFunc()
  const fileData = await fetch(result.data).then(r => r.text());
  const blob = new Blob([fileData], { type: 'text/plain' });
  const a = document.createElement('a');
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.style = 'display: none';
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
export { safeReq, tryGetJson, tableUnitRender, clickHtmlList, formatNumber, eliminateAsyncCall, toBase62 }

