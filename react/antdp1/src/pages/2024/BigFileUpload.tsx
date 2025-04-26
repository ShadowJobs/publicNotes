import React, { useState, useRef, useCallback, useEffect } from 'react';
import './avarta.css';
import { Button, Divider, message, Progress, Radio, Space, Table } from 'antd';
import { DownloadOutlined, PauseCircleOutlined, PlayCircleOutlined, SyncOutlined, UploadOutlined, WarningOutlined } from '@ant-design/icons';
import { request, useModel } from 'umi';
import { PythonUrl } from '@/global';
import { Chunk, getFileChunks, getFileMd5 } from '@/utils';
import { indexedDBManager } from '@/utils/indexedDb';
import DownloadFile from './DownloadFile';

// const CHUNK_SIZE = 5 * 1024 * 1024; // 1MB chunks
const CHUNK_SIZE = 200000; // 1-5MB比较合适，但是测试的话，200kb比较合适

const UPLOAD_CHUNK_SIZE = 5 * 1025 * 1024;
type DownloadStatus = {
  finishedSize: number;
  s: "unstart" | "downloading" | "paused" | "finished";
};
const DownloadButtonName = {
  unstart: { txt: '下载', icon: <DownloadOutlined /> },
  downloading: { txt: '暂停', icon: <PauseCircleOutlined /> },
  paused: { txt: '继续', icon: <PlayCircleOutlined /> },
  finished: { txt: '重新下载', icon: <DownloadOutlined /> }
}
const DownloadButton: React.FC<{ fileId: number; fileName: string; fileSize: number }> = ({ fileId, fileName, fileSize }) => {
  const [status, setStatus] = useState<DownloadStatus>({ s: 'unstart', finishedSize: 0 });
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  useEffect(() => {
    const storedStatus = localStorage.getItem(`download_status_${fileId}`);
    if (storedStatus) setStatus(JSON.parse(storedStatus))
  }, [fileId]);
  useEffect(() => {
    localStorage.setItem(`download_status_${fileId}`, JSON.stringify(status));
  }, [status]);
  const continueDownload = async (startByte: number) => {
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    try {
      const response = await fetch(`${PythonUrl}/file-trans/bigfile/download/${fileId}`, {
        headers: {
          Range: `bytes=${startByte}-${startByte + CHUNK_SIZE - 1}`
        },
        signal: newAbortController.signal
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body!.getReader();
      let receivedLength = startByte;
      const readedArray = []
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 合并readedArray
          const blob = new Blob(readedArray);
          await indexedDBManager.saveChunk(fileId, startByte, blob);
          if (receivedLength === fileSize) {
            await completeDownload();
          } else {
            continueDownload(receivedLength);
            break;
          }

          break;
        }
        readedArray.push(value);
        receivedLength += value.length;
        setStatus(pre => ({ finishedSize: receivedLength, s: pre.s }));
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Download paused');
      } else {
        console.error('Download failed:', error);
        message.error('Download failed');
        setStatus({ finishedSize: rangeStart, s: 'paused' });
      }
    }
  };

  const completeDownload = async () => {
    const chunks = await indexedDBManager.getAllChunks(fileId);
    const blob = new Blob(chunks.map(v => v.value), { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    await indexedDBManager.clearFileChunks(fileId);
    setStatus({ finishedSize: fileSize, s: 'finished' });
    message.success('Download completed');
  };
  const clickHandler = () => {
    if (status.s == 'unstart' || status.s == 'finished') {
      continueDownload(0);
      setStatus({ finishedSize: 0, s: 'downloading' });
    } else if (status.s == 'downloading') {
      setStatus(pre => ({ ...pre, s: 'paused' }));
      abortController?.abort();
    } else if (status.s == 'paused') {
      continueDownload(status.finishedSize);
      setStatus(pre => ({ ...pre, s: 'downloading' }));
    }
  }
  return (
    <div>
      <Button type="primary" onClick={clickHandler} icon={DownloadButtonName[status.s].icon}>
        {DownloadButtonName[status.s].txt}
      </Button>
      {status.s !== 'unstart' && <Progress percent={Math.floor(status.finishedSize / fileSize * 100)} />}
    </div>
  );
};

const SingleFileUpload: React.FC<{ file: File, fChunks: Chunk[] }> = ({ file, fChunks }) => {
  const [localChunks, setLocalChunks] = useState<{ blob: Blob, progress: number, finished: boolean }[]>(fChunks);

  const { initialState } = useModel('@@initialState');
  const user_id = initialState?.currentUser?.userid;
  const uploadChunk = async (chunks: Chunk[], index: number, md5: string) => {
    const chunk: Chunk = chunks[index];
    const formData = new FormData();
    formData.append('file', chunk.blob, file!.name);
    formData.append('user_id', user_id!);
    formData.append('md5', md5);
    formData.append('index', index.toString());
    formData.append('chunk_num', chunks.length.toString());
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${PythonUrl}/file-trans/bigfile/upload-chunk`, true);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && localChunks[index]) {
          const percent = Math.round((e.loaded / e.total) * 100);
          const newChunks = [...localChunks];
          newChunks[index].progress = percent;
          setLocalChunks(newChunks);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200 && localChunks[index]) {

          // 返回如果有 finished==1，说明所有的片段都上传完了
          const res = JSON.parse(xhr.responseText);
          if (res?.finished) {
            message.success('上传成功');
            setLocalChunks([]);
          } else {
            const newChunks = [...localChunks];
            newChunks[index].finished = true;
            newChunks[index].progress = 100;
            setLocalChunks(newChunks);
          }
        }
      };
      xhr.send(formData);
    } catch (e) {
      console.error('Error uploading avatar:', e);
    }
  }
  useEffect(() => {
    const update = async () => {
      if (!file) {
        message.error('请选择文件');
        return;
      }

      let md5 = await getFileMd5(file);
      console.log(md5);
      for (let i = 0; i < localChunks.length; i++) {
        if (!localChunks[i].finished) uploadChunk(localChunks, i, md5);
      }
    }
    update()
  }, [])
  return <div>
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      {localChunks.map((v, idx) => <div style={{ margin: "0 auto" }} key={idx}>
        <span>片段{idx}</span>
        <span style={{ display: "inline-block", width: 300 }}><Progress type="line" percent={v.progress} width={80} /></span>
      </div>)}
    </div>

  </div>
}
const BigFileUpload: React.FC<{}> = ({ }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const { initialState } = useModel('@@initialState');
  const user_id = initialState?.currentUser?.userid;
  const [upedList, setUpedList] = useState<any[]>([]);
  const [uploadType, setuploadType] = useState<"multiple" | "single" | "dir">("multiple")
  const [upFiles, setUpFiles] = useState<File[]>([])
  const [preUpFiles, setPreUpFiles] = useState<File[]>([])
  // 已经上传的文件片段
  const [localChunks, setLocalChunks] = useState<{ blob: Blob, progress: number, finished: boolean }[]>([]);

  const syncChunks = async () => {
    const res = await request(`${PythonUrl}/file-trans/bigfile/lastuploadinfo`, {
      method: 'GET',
      params: { user_id }
    })
    if (res.data) {
      const { chunks, finished } = res.data;
      if (!finished) {
        const newChunks = chunks.map((v: any, index: number) => ({ blob: null, progress: v == 1 ? 100 : 0, finished: v == 1 }));
        setLocalChunks(newChunks);
      }
    }
  }

  const handleSingleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);

    const chunks: Chunk[] = getFileChunks(file, UPLOAD_CHUNK_SIZE);
    chunks.forEach((v, idx) => {
      v.progress = localChunks[idx]?.progress || 0;
      v.finished = localChunks[idx]?.finished || false;
    })
    setLocalChunks(chunks);
  };

  const traverseDirectory = (entry, allFiles) => {
    if (entry.isFile) {
      entry.file(file => {
        allFiles.push(file);
      });
    } else {
      const dirReader = entry.createReader();
      dirReader.readEntries(entries => {
        for (let entr of entries) {
          traverseDirectory(entr, allFiles);
        }
      });
    }
  };
  const handleMultiFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files);
    const allFiles: File[] = [];
    setSelectedFile(files[0])

    files.forEach(file => {
      if (file.webkitGetAsEntry) {
        const entry = file.webkitGetAsEntry();
        if (entry.isDirectory) {
          // 递归遍历文件夹
          traverseDirectory(entry, allFiles);
        } else {
          allFiles.push(file);
        }
      } else {
        allFiles.push(file);
      }
    });

    setPreUpFiles(allFiles);

  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadType == "multiple") handleMultiFileSelect(event)
    else if (uploadType == 'single') handleSingleFileSelect(event)
    else handleMultiFileSelect(event)
  }
  const getUploadedFileList = useCallback(async () => {
    const res = await request(`${PythonUrl}/file-trans/bigfile/uploaded-list`, {
      method: 'GET',
      params: { user_id }
    });
    if (res.data) {
      setUpedList(res.data);
    }
  }, [user_id]);
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    setSelectedFile(file)
  };

  const openFileDialog = () => fileInputRef.current?.click()

  useEffect(() => {
    syncChunks()
    getUploadedFileList()
  }, [])

  const Columns = [
    { dataIndex: "filename", title: "Name", width: 150 },
    { dataIndex: "size", title: "Size" },
    { dataIndex: "upload_time", title: "Upload Time", render: (d: any) => new Date(d).toLocaleString() },
    { dataIndex: "chunk_num", title: "Chunk Number" },
    { dataIndex: "md5", title: "MD5" },
    {
      dataIndex: "operation", title: "Operation",
      render: (d: any, row: any) => <div style={{ display: "flex" }}>
        <DownloadButton fileId={row.id} fileName={row.filename} fileSize={row.size} />
        <Button type="primary" style={{ marginLeft: 5 }} onClick={() => {
          request(`${PythonUrl}/file-trans/bigfile/${row.id}`, { method: "DELETE", data: {} }).then(res => {
            if (res.code == 1) {
              message.success("删除成功");
              getUploadedFileList();
            }
          })
        }}>Delete</Button>
      </div>
    }
  ]
  return (
    <div>
      <Radio.Group value={uploadType} onChange={e => setuploadType(e.target.value)} optionType="default">
        <Radio.Button value={"single"}>单个大文件</Radio.Button>
        <Radio.Button value={"multiple"}>多选大文件</Radio.Button>
        <Radio.Button value={"dir"}>文件夹</Radio.Button>
      </Radio.Group>
      <h1>{uploadType === 'multiple' ? "批量上传,支持多选" : uploadType === 'dir' ? "选择文件夹" : "单个大文件"}</h1>
      {uploadType !== "single" && <>
        <div style={{ color: "#101010" }}><WarningOutlined/>一个用户最多上传10个文件，每个文件最大500M</div>
      </>}
      <div style={{ margin: "0 auto ", width: 300, }}>
        <div className="drop-zone" ref={dropZoneRef} style={{ width: 300, height: 100 }}
          onClick={() => !selectedFile && openFileDialog()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {selectedFile ? <div>{selectedFile.name}</div> : <p>点击或拖拽文件到此处上传</p>}
          <input type="file" ref={fileInputRef} onChange={handleFileSelect}
            accept="*/*"
            webkitdirectory={uploadType === 'dir' ? "true" : false}
            multiple={uploadType === 'multiple' ? true : false}
            style={{ display: 'none' }}
          />
        </div>
        {preUpFiles?.length > 0 && <div>
          <div>已选择的文件</div>
          {preUpFiles.map((v,idx) => <div key={v.name} style={{wordWrap:"break-word",whiteSpace:"nowrap"}}>{idx}. {v.name}</div>)}
        </div>}

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Button icon={<SyncOutlined />} type="text" onClick={openFileDialog} disabled={!selectedFile}>
            重新选择
          </Button>
          <Button icon={<UploadOutlined />} type="primary" disabled={!selectedFile} onClick={() => {
            if (uploadType == 'single') setUpFiles([selectedFile!])
            else if (uploadType === 'multiple') setUpFiles(preUpFiles)
            else {
              setUpFiles(preUpFiles)
            }
          }}>上传</Button>
        </div>
      </div>
      {upFiles.map(v => {
        return <SingleFileUpload file={v} fChunks={getFileChunks(v, UPLOAD_CHUNK_SIZE).map(v => {
          v.progress = 0;
          v.finished = false;
          return v
        })} />
      })}

      <div style={{ height: 10, marginTop: 30 }}></div>
      <Divider />
      <h1>已上传文件列表</h1>
      <Table columns={Columns} dataSource={upedList} rowKey="id" scroll={{ x: "max-content" }} />
      <Divider>其他下载方法</Divider>
      <DownloadFile/>
    </div>
  );
};


export default BigFileUpload;