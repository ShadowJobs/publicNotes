import type { FormInstance } from "antd";
import { useEffect, useRef } from "react";

// keep search params in ProTable search form when browser refresh
type FieldsObject = {
  [dataIndex: string]: any;
};
/**
 * 可用于ProTable的搜索表单缓存hook
 * @param searchParams
 * @param searchColumnsDataIndex 需要对搜索表单数据做缓存的column的表单name，目前只支持value为字符串
 * @returns 需要将返回的formRef绑定到ProTable的formRef属性上
 */
export const useMemoSearch = <T extends Record<string, unknown>>(
  searchParams: T,
  searchColumnsDataIndex: string[] // If don't have dataIndex, You can also use the columns' key
) => {
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    const fieldsValue: FieldsObject = {};
    for (const dataIndex of searchColumnsDataIndex) {
      fieldsValue[dataIndex] = searchParams[dataIndex];
    }
    formRef.current?.setFieldsValue(fieldsValue);
  }, []);

  return formRef;
};
