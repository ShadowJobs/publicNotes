import React, { useState, useRef, useCallback, useEffect } from 'react';
import './avarta.css';
import { Button, Divider, message, Progress } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useModel } from 'umi';
import { PythonUrl } from '@/global';

const AvatarUpload: React.FC<{}> = ({ }) => {
  const [avatar, setAvatar] = useState<string | ArrayBuffer | null>(null);
  const [crop, setCrop] = useState<Crop>({});
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { initialState, setInitialState } = useModel('@@initialState');
  const user_id = initialState?.currentUser?.userid;
  const [progress, setProgress] = useState(0);
  const previewRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result!);
        // 创建一个新的 Image 对象来获取图片尺寸
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // 设置画布大小为图片的大小
          canvas.width = img.width;
          canvas.height = img.height;

          // 绘制整个图片到画布上
          ctx.drawImage(img, 0, 0, img.width, img.height);

          // 将画布内容转换为 Blob
          canvas.toBlob((blob) => {
            if (blob) {
              setCroppedImage(URL.createObjectURL(blob));
            }
          }, 'image/jpeg', 1);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatar(e.target!.result);
      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = () => fileInputRef.current?.click()

  const onImageLoad = useCallback((img) => {
    imgRef.current = img;

    const containerWidth = 300;
    const containerHeight = 300;
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;

    let newWidth, newHeight;

    if (imageAspectRatio > 1) {
      // Image is wider than container
      newWidth = containerWidth;
      newHeight = containerWidth / imageAspectRatio;
    } else {
      // Image is taller than container
      newHeight = containerHeight;
      newWidth = containerHeight * imageAspectRatio;
    }

    setImageDimensions({ width: newWidth, height: newHeight });

    const cropSize = Math.min(newWidth, newHeight);
    setCrop({
      unit: 'px',
      width: cropSize,
      height: cropSize,
      x: (newWidth - cropSize) / 2,
      y: (newHeight - cropSize) / 2,
      aspect: 1
    });
  }, []);

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // 计算裁剪区域在原始图片上的位置和大小
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // 设置画布大小为裁剪后的大小
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');

    // 在画布上绘制裁剪后的图像
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // 将画布转换为Blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      setCroppedImage(URL.createObjectURL(blob));
    }, 'image/jpeg', 1); // 使用最高质量的JPEG格式
  }, [completedCrop]);

  useEffect(() => {
    if (completedCrop?.width && completedCrop?.height) {
      getCroppedImg();
    }
  }, [completedCrop, getCroppedImg]);

  useEffect(() => {
    fetch(`${PythonUrl}/file-trans/avatar/${user_id}`).then(res => {
      // 这里有可能是二进制，有可能文件不存在而返回一个404和json
      if (!res.ok) {
        return null;
      }
      return res.blob()
    }).then(blob => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
      }
      reader.readAsDataURL(blob);
    })
  }, [])
  const sendFile = (blob: Blob) => {

    const formData = new FormData();
    formData.append('file', blob, 'avatar.jpg');
    formData.append('user_id', user_id!);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${PythonUrl}/file-trans/avatar/upload`, true);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          setProgress(100);
        }
      };
      xhr.send(formData);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          message.success('上传成功');
          setAvatar(null);
          setInitialState({ ...initialState, currentUser: { ...initialState!.currentUser, refreshT: Date.now() } });
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  }
  const handleUpdate = async () => {
    if (!croppedImage) return;
    if (Math.random() > 0.5) {
      // 方法1：使用fetch得到blob对象
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      sendFile(blob);
    } else {
      // 方法2：直接使用preview里的数据,直接画到canvas上，在从canvas上获取blob
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = previewRef.current!.naturalWidth;
      canvas.height = previewRef.current!.naturalHeight;
      ctx?.drawImage(previewRef.current!, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        sendFile(blob);
      }, 'image/jpeg', 1);
    }
  };
  return (
    <div>
      <div className="avatar-upload">
        <div className="drop-zone-container">
          <div className="drop-zone" ref={dropZoneRef}
            onClick={() => !avatar && openFileDialog()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {avatar ? (
              <ReactCrop crop={crop} aspect={1} keepSelection
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img src={avatar} onLoad={(e) => onImageLoad(e.currentTarget)}
                  style={{
                    width: imageDimensions.width,
                    height: imageDimensions.height
                  }} />
              </ReactCrop>
            ) : (
              <p>点击或拖拽图片到此处上传</p>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect}
              accept="image/*" style={{ display: 'none' }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <Button icon={<SyncOutlined />} type="text" onClick={openFileDialog} disabled={!avatar}>
              重新选择
            </Button>
          </div>
        </div>
        <Divider type='vertical' style={{ height: 200 }} />
        <div className="preview">
          <img ref={previewRef} src={croppedImage || avatar || '/a.jpg'} alt="Avatar Preview" />
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <div style={{ color: "#b0b0b0f0" }}>请选择图片上传：大小180 * 180像素支持JPG、PNG等格式，图片需小于2M</div>
        <Button type="primary" disabled={!avatar} onClick={handleUpdate}>更新</Button>
        {progress > 0 && progress !== 100 && <div style={{ width: 300, margin: "0 auto" }}>
          <Progress type="line" percent={progress} width={80} />
        </div>}
      </div>
    </div>
  );
};

const AvatarUpdatePage = () => {
  return (
    <div>
      <h1>Update Avatar</h1>
      <AvatarUpload />
    </div>
  );
}

export default AvatarUpdatePage;