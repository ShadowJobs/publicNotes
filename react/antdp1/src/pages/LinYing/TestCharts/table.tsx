import { message } from 'antd';
import React from 'react';

////代码生成原生html表格
const uniqueHeaders = (tableResult) => {
  const headers: string[] = [];
  Object.keys(tableResult.values).map((indicator) => {
    Object.keys(tableResult.values[indicator]).map((header) => {
      headers.push(header);
    });
  });
  return [...new Set(headers)];
};

const isOutOfRange = (
  tableResult:any,
  indicator: string,
  header: string,
  val: number,
) => {
  if (
    tableResult.ranges === undefined ||
    tableResult.ranges[indicator] === undefined ||
    tableResult.ranges[indicator][header] === undefined ||
    tableResult.ranges[indicator][header]?.length != 2
  ) {
    return [false, null];
  }

  const range = tableResult.ranges[indicator][header] as (number | string)[];
  if (typeof range[0] == 'number' && typeof range[1] == 'number') {
    return [val < range[0] || val > range[1], range];
  } else if (typeof range[0] == 'string' && typeof range[1] == 'number') {
    return [val > range[1], range];
  } else if (typeof range[0] == 'number' && typeof range[1] == 'string') {
    return [val < range[0], range];
  }
  return [false, null];
};

const Table: React.FC<{ tableResult:any; isMerged: boolean,mID?:number }> = ({
  tableResult,
  isMerged,
  mID
}) => {
  if (!Array.isArray(tableResult.indicators)) {
    message.error('indicators should be an array');
    return <></>;
  }

  const indicators: string[] = tableResult.indicators;
  const headers: string[] = (tableResult.headers ? tableResult.headers : uniqueHeaders(tableResult)).filter(v=>v!="");

  const tableEl = document.createElement('table');
  tableEl.className = 'table table-hover rounded table-bordered';

  const theadEl = document.createElement('thead');
  theadEl.setAttribute('id', 'custom-header');

  const trEl = document.createElement('tr');

  ['', ...headers].map((indicator) => {
    const thEl = document.createElement('th');
    thEl.className = 'text-center mth';

    const pEl = document.createElement('p');
    pEl.className = 'mes-p-header';
    pEl.innerText = indicator;

    thEl.appendChild(pEl);

    trEl.appendChild(thEl);
  });

  theadEl.appendChild(trEl);
  tableEl.appendChild(theadEl);

  const tbodyEl = document.createElement('tbody');
  tbodyEl.setAttribute('id', 'custom-row');

  indicators.map((indicator, idx) => {
    const trEl = document.createElement('tr');
    trEl.setAttribute('data-rowid', idx.toString());

    const tdEl = document.createElement('td');
    tdEl.className = 'text-center mtd-t';
    tdEl.setAttribute('data-id', idx.toString());
    tdEl.setAttribute('rowspan', '1');

    const pEl = document.createElement('p');
    pEl.className = 'mes-p-tdtile';
    pEl.innerText = indicator;

    tdEl.appendChild(pEl);
    trEl.appendChild(tdEl);

    headers.map((header) => {
      const tdEl = document.createElement('td');
      tdEl.className = 'text-center mtd-r';
      tdEl.setAttribute('data-id', idx.toString());
      if(!tableResult.values || !tableResult.values[indicator]){
        console.log(tableResult)
        return 
      }
      let value=tableResult.values[indicator][header]
      if (value !== undefined && value !== null) {
        const pEl = document.createElement('p');
        pEl.className = 'mes-p-value';
        if (!isMerged || typeof value == 'number') {
          if(header=="url" && value.indexOf("http")==0){
            pEl.innerHTML=`<a href="${value}&metric_id=${mID}" target="_blank">${("前往")} </a>`
          }else
            pEl.innerText = value.toString();
          tdEl.appendChild(pEl);
        } else {
          const [val, delta] = (value as string).split('/DELTASPLIT/',);
          pEl.innerText = val;
          value=parseFloat(val)
          const pDeltaEl = document.createElement('p');
          if (delta !== undefined) {
            if (parseFloat(delta.substring(0, delta.length - 1)) == 0) {
              pDeltaEl.className = 'mes-p-value';
              pDeltaEl.innerText = delta;
            } else if (parseFloat(delta.substring(0, delta.length - 1)) > 0) {
              pDeltaEl.className = 'anttable-compare-up';
              pDeltaEl.innerText = '▲ ' + delta;
            } else {
              pDeltaEl.className = 'anttable-compare-down';
              pDeltaEl.innerText = '▼ ' + delta;
            }
          }

          tdEl.appendChild(pEl);
          tdEl.appendChild(pDeltaEl);
        }

        if (typeof value == 'number') {
          const val = value as number;
          const [isOOR, range] = isOutOfRange(tableResult, indicator, header, val);
          if (isOOR) {
            tdEl.classList.add('mes-value-out-of-range');
            tdEl.classList.add('tooltip');
            if (range) {
              const tooltipEl = document.createElement('span');
              tooltipEl.className = 'tooltiptext';
              tooltipEl.innerText = `范围: [${range[0]}, ${range[1]}]`;
              tdEl.appendChild(tooltipEl);
            }
          }
          if(tableResult.withColor && tableResult.withColor.length>0 && tableResult.withColor.indexOf(header)!=-1){
            if(value==100) tdEl.classList.add("mes-value-with-green")
            else if(value>=60) tdEl.classList.add("mes-value-with-yellow")
            else tdEl.classList.add("mes-value-with-red")
          }
        }
      }

      trEl.appendChild(tdEl);
    });

    tbodyEl.appendChild(trEl);
  });

  tableEl.appendChild(tbodyEl);

  return <div dangerouslySetInnerHTML={{ __html: tableEl.outerHTML }}></div>;
};

export default Table;
