import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';

export interface DebounceSelectProps<ValueType = any>
    extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
    fetchOptions: (params: { query?: string, offset: number, size: number }) => Promise<ValueType[]>;
    debounceTimeout?: number;
}

function DebounceSelect<
    ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps<ValueType>) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<ValueType[]>([]);
    const [searcWord, setSearcWord] = useState<string>("")
    const [page, setPage] = useState<number>(1)
    const pageSize = 10
    const fetchRef = useRef(0);
    useEffect(() => {
        fetchOptions({ offset: 0, size: pageSize }).then((newOptions) => {
            setOptions(newOptions);
            setFetching(false);
        });
    }, [])

    const debounceFetcher = useMemo(() => {
        const loadOptions = (value: string) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            setSearcWord(value)
            fetchOptions({ query: value, offset: pageSize * (page - 1), size: pageSize }).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }
                setOptions(newOptions);
                setFetching(false);
                setPage(1)
            });
        };

        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    return (
        <Select loading={fetching} onPopupScroll={
            (e) => {
                e.persist();
                setFetching(true);
                const target = e.target;
                if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
                    fetchOptions({ query: searcWord, offset: pageSize * (page), size: pageSize }).
                        then((newOptions) => {
                            setFetching(false);
                            setOptions(pre => ([...pre, ...newOptions]));
                            newOptions.length <= pageSize && setPage(page + 1)
                        });
                }
            }}
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            options={options}
        />
    );
}

export default DebounceSelect