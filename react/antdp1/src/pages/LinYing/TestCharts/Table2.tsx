import { message } from 'antd';
import React from 'react';

const uniqueHeaders = (tableResult: Mynote.ApiAggTableResult) => {
  const headers: string[] = [];
  Object.keys(tableResult.values).map((indicator) => {
    Object.keys(tableResult.values[indicator]).map((header) => {
      headers.push(header);
    });
  });
  return [...new Set(headers)];
};

const isOutOfRange = (
  tableResult: Mynote.ApiAggTableResult,
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

const Table2: React.FC<{ tableResult: Mynote.ApiAggTableResult; isMerged: boolean }> = ({
  tableResult,
  isMerged,
}) => {
  if (!Array.isArray(tableResult.indicators)) {
    message.error('indicators should be an array');
    return <></>;
  }

  const indicators: string[] = tableResult.indicators;
  const headers: string[] = (tableResult.headers ? tableResult.headers : uniqueHeaders(tableResult)).filter(v=>v!="");
  const firstColumnName=tableResult.external?.id_name || "Event 名称"

  return <div><table className='table table-hover rounded table-bordered'>
    <thead id="custom-header" style={{position:"sticky",top:40}}>
      <tr>
        <th className='text-center mth'><p className='mes-p-header'>{firstColumnName}</p></th>
        {
          headers.map((header,idx)=>{
            return <th className='text-center mth' key={idx}><p className='mes-p-header'>{header}</p></th>
          })
        }
      </tr>
    </thead>
    <tbody className='custom-row'>
      {indicators.map((indicator,idx)=>{
        return <tr key={idx}>
          <td className='text-center mtd-t'><p className='mes-p-tdtile'>{indicator}</p></td>
          {headers.map((header) => {
            let value=tableResult.values[indicator][header]
            if (value !== undefined && value !== null){
              let jsonValue
              if(typeof(value)=="string")
                if(value.startsWith("json:")){
                  jsonValue=JSON.parse(value.slice(5,value.length))
                }
              let pNode,deltaNode
              if (!isMerged || typeof value == 'number') {
                if(header=="url" && value.indexOf?.("http")==0){
                  pNode=<p className='mes-p-value'><a href={value} target="_blank">前往</a></p>
                }else if(jsonValue){
                  if(jsonValue.type=="node"){
                    pNode=<p className='mes-p-value'><div style={jsonValue.style}>{jsonValue.value}</div></p>
                  }else if(jsonValue.type='link'){
                    pNode=<p className='mes-p-value'><a href={jsonValue.url} target="_blank" style={{display:"block"}}>{jsonValue.name}</a></p>
                  }else
                    pNode=<p className='mes-p-value'><div></div></p>
                }else pNode=value.toString()
              } else {
                const [val, delta] = (value as string).split?((value as string).split('/DELTASPLIT/')):[value.toString()];
                pNode=<p className='mes-p-value'>{val}</p>
                value=parseFloat(val)
                if (delta !== undefined) {
                  if (parseFloat(delta.substring(0, delta.length - 1)) == 0) {
                    deltaNode=<p className='mes-p-value'>{delta}</p>
                  } else if (parseFloat(delta.substring(0, delta.length - 1)) > 0) {
                    deltaNode=<p className='anttable-compare-up'>{'▲ ' + delta}</p>
                  } else {
                    deltaNode=<p className='anttable-compare-down'>{'▼ ' + delta}</p>
                  }
                }
              }
      
              if (typeof value == 'number') {
                const val = value as number;
                const [isOOR, range] = isOutOfRange(tableResult, indicator, header, val);
                let className=`text-center mtd-r ${isOOR?'mes-value-out-of-range tooltip':""}`
                if(tableResult.withColor && tableResult.withColor.length>0 && tableResult.withColor.indexOf(header)!=-1){
                  if(value==100) className+=("mes-value-with-green")
                  else if(value>=60) className+=("mes-value-with-yellow")
                  else className+=("mes-value-with-red")
                }
                return <td className={className} key={header}>
                  {pNode}
                  {deltaNode}
                  {isOOR && range && <span className='tooltiptext'>{`范围: [${range[0]}, ${range[1]}]`}</span>}
                </td>
              }
              return <td className='text-center mtd-r' key={header}>{pNode}{deltaNode}</td>
            }
            return <td className='text-center mtd-r' key={header}></td>
          })}
        </tr>
      })}
    </tbody>
    </table></div>
};

export default Table2;
