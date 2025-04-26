
import axios from "@/utils/axios";
type method = "get" | "post" | "put" | "delete";
export const safeReq = async (
  url: string,
  options: { method?: method, data?: any } = {},
  callback?: { resolve?: (res: any) => void, reject?: (err: any) => void }
) => {
  try {
    let params: any;
    let _method: method = (options.method?.toLowerCase() || 'get') as method;
    if (_method === 'get') {
      params = options.data;
    } else if (_method === 'post') {
      params = options.data;
    }
    const res = await axios[_method](url, params);
    callback?.resolve?.(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
    callback?.reject?.(err);
    return null;
  }
}

export const getWord = (cnStr: string) => {
  return cnStr
}

export var tableToExcel = (function () {
  var uri = 'data:application/vnd.ms-excel;base64,',
    template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
    base64 = function (s: string) { return window.btoa(unescape(encodeURIComponent(s))) },
    format = function (s: string, c: any) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };
  return function (table: any, name: string, filename: string) {
    if (!table.nodeType) table = document.getElementById(table)
    var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
    var aElement = document.getElementById("dlink") as HTMLAnchorElement;
    aElement.href = uri + base64(format(template, ctx));
    aElement.download = filename;
    aElement.click();
  }
})()