import { safeReq } from '@/utils';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { InputRef, message } from 'antd';
import { Input, Tag, Tooltip } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import React, { useEffect, useRef, useState } from 'react';
import { request } from 'umi';

const InputTag: React.FC<{ value?: string[], onChange?: Function }> = ({ value, onChange }) => {
    const [tags, setTags] = useState<string[]>(value || []);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [editInputIndex, setEditInputIndex] = useState(-1);
    const [editInputValue, setEditInputValue] = useState('');
    const inputRef = useRef<InputRef>(null);
    const editInputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);

    useEffect(() => {
        editInputRef.current?.focus();
    }, [inputValue]);

    const handleClose = (removedTag: string) => {
        const newTags = tags.filter(tag => tag !== removedTag);
        console.log(newTags);
        setTags(newTags);
        onChange(newTags)
    };

    const showInput = () => {
        setInputVisible(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && tags.indexOf(inputValue) === -1) {
            setTags([...tags, inputValue]);
            onChange([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditInputValue(e.target.value);
    };

    const handleEditInputConfirm = () => {
        const newTags = [...tags];
        newTags[editInputIndex] = editInputValue;
        setTags(newTags);
        onChange(newTags);
        setEditInputIndex(-1);
        setInputValue('');
    };

    return (
        <>
            {tags.map((tag, index) => {
                if (editInputIndex === index) {
                    return (
                        <Input style={{width:200,display:"inline-block"}}
                            ref={editInputRef}
                            key={tag}
                            size="small"
                            className="tag-input"
                            value={editInputValue}
                            onChange={handleEditInputChange}
                            onBlur={handleEditInputConfirm}
                            onPressEnter={handleEditInputConfirm}
                        />
                    );
                }

                const isLongTag = tag.length > 20;

                const tagElem = (
                    <Tag className="edit-tag" color='blue' key={tag} closable={true} onClose={() => handleClose(tag)}>
                        <span
                            onDoubleClick={e => {
                                setEditInputIndex(index);
                                setEditInputValue(tag);
                                e.preventDefault();
                            }}
                        >
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                        </span>
                    </Tag>
                );
                return isLongTag ? (
                    <Tooltip title={tag} key={tag}>
                        {tagElem}
                    </Tooltip>
                ) : (
                    tagElem
                );
            })}
            {inputVisible && (
                <Input style={{width:200,display:"inline-block"}}
                    ref={inputRef}
                    type="text"
                    size="small"
                    className="tag-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                />
            )}
            {!inputVisible && (
                <Tag className="site-tag-plus" onClick={showInput} color='blue'>
                    <PlusOutlined /> New Tag
                </Tag>
            )}
        </>
    );
};

const InputTagWithReq: React.FC<{ value: string[], onChange: Function, id: number }> = ({ value, onChange, id }) => {
    const [tags, setTags] = useState<string[]>(value);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [editInputIndex, setEditInputIndex] = useState(-1);
    const [editInputValue, setEditInputValue] = useState('');
    const inputRef = useRef<InputRef>(null);
    const editInputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);

    useEffect(() => {
        editInputRef.current?.focus();
    }, [inputValue]);
    useEffect(() => { setTags(value) }, [value])

    const handleClose = (removedTag: string) => {
        confirm({
            title: 'Confirm delete',
            icon: <ExclamationCircleOutlined />,
            content: `Delete ${removedTag} ?`,
            onOk: () => {

                const newTags = tags.filter(tag => tag !== removedTag);
                console.log(newTags);
                setTags(newTags);
                onChange(newTags)

                safeReq(async () => {
                    const record = { key: removedTag.split("=")[0]}
                    return await request(`/labels`, {
                        method: "DELETE",
                        data: { ...record },
                    });
                }, res => {
                    message.success("Delete Success")
                })
            },
            onCancel() { },
        });
    };

    const showInput = () => {
        setInputVisible(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && tags.indexOf(inputValue) === -1) {
          let label_data = {key: null, value: null}
          if (inputValue.split("=").length == 2) {
            label_data.key = inputValue.split("=")[0]
            label_data.value = inputValue.split("=")[1]
          }
          else {
            label_data.key = inputValue.split("=")[0]
          }
          safeReq(async () => {
              return await request(`/labels`, {
                  method: "POST",
                  data: label_data,
              });
          }, res => {
              message.success("Add Success")
              setTags([...tags, inputValue]);
              onChange([...tags, inputValue]);
          })
        }
        setInputVisible(false);
        setInputValue('');
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditInputValue(e.target.value);
    };

    const handleEditInputConfirm = () => {
        let label_data = {key: null, value: null}
        if (editInputValue.split("=").length == 2) {
          label_data.key = editInputValue.split("=")[0]
          label_data.value = editInputValue.split("=")[1]
        }
        else {
          label_data.key = editInputValue.split("=")[0]
        }
        safeReq(async () => {
            return await request(`/labels`, {
                method: "PUT",
                data: label_data,
            });
        }, res => {
            message.success("UPDATE Success")

            const newTags = [...tags];
            newTags[editInputIndex] = editInputValue;
            setTags(newTags);
            onChange(newTags);
            setEditInputIndex(-1);
            setInputValue('');
        })
    };

    return (
        <>
            {tags.map((tag, index) => {
                if (editInputIndex === index) {
                    return (
                        <Input
                            ref={editInputRef}
                            key={tag}
                            size="small"
                            className="tag-input"
                            value={editInputValue}
                            onChange={handleEditInputChange}
                            onBlur={handleEditInputConfirm}
                            onPressEnter={handleEditInputConfirm}
                        />
                    );
                }

                const isLongTag = tag.length > 20;

                const tagElem = (
                    <Tag className="edit-tag" color='blue' key={tag} closable={true} onClose={(e) => {
                        e.preventDefault()
                        handleClose(tag)
                    }}>
                        <span
                            onDoubleClick={e => {
                                setEditInputIndex(index);
                                setEditInputValue(tag);
                                e.preventDefault();
                            }}
                        >
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                        </span>
                    </Tag>
                );
                return isLongTag ? (
                    <Tooltip title={tag} key={tag}>
                        {tagElem}
                    </Tooltip>
                ) : (
                    tagElem
                );
            })}
            {inputVisible && (
                <Input
                    ref={inputRef}
                    type="text"
                    size="small"
                    className="tag-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                />
            )}
            {!inputVisible && (
                <Tag className="site-tag-plus" onClick={showInput}>
                    <PlusOutlined /> New Tag
                </Tag>
            )}
        </>
    );
};
export { InputTagWithReq }
export default InputTag;
