//安装依赖
// "dom-to-image": "^2.6.0",
// "jspdf": "^2.3.1",

//使用
//<AggregationShare
// node={document.getElementsByClassName('comparison-card')[0]} ，这个node是需要渲染的节点
// path={`这里传页面路径，用于截图整个页面`}
// />

import React, { useEffect, useState } from 'react';
import { Modal, Button, Image, message, Typography } from 'antd';

import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import { CopyOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

const ShareImgPdf: React.FC<{ node: Node; path?: string }> = ({ node, path }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imgData, setImgData] = useState<string>();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setImgData(undefined);
  };

  useEffect(() => {
    if (isModalVisible && node) {
      domtoimage
        .toPng(node)
        .then((dataUrl) => {
          setImgData(dataUrl);
        })
        .catch((error) => {
          message.error(`${("生成报告出错")}： ${error}`);
        });
    }
  }, [isModalVisible, node]);

  const handlePNGDownload = () => {
    try {
      if (!imgData) {
        throw Error(('生成报告出错')+'!');
      }
      const link = document.createElement('a');
      link.download = 'Report.png';
      link.href = imgData;
      link.click();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handlePDFDownload = () => {
    try {
      if (!imgData) {
        throw Error(('生成报告出错')+'!');
      }
      const doc = new jsPDF();
      const imgProps = doc.getImageProperties(imgData);

      const pdfHeight = doc.internal.pageSize.getHeight();
      const pdfWidth = (imgProps.width * pdfHeight) / imgProps.height;
      const marginX = Math.abs(doc.internal.pageSize.getWidth() - pdfWidth) / 2;

      doc.addImage(imgData, 'PNG', marginX, 0, pdfWidth, pdfHeight);
      doc.save('Report.pdf');
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        <ShareAltOutlined /> {("分享报告")}
      </Button>
      <Modal title={("报告预览")} visible={isModalVisible} onCancel={handleCancel} footer={null}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {path && (
            <Text
              copyable={{
                icon: (
                  <Link>
                    <CopyOutlined /> {("复制链接")}
                  </Link>
                ),
                text: window.location.origin + path,
              }}
              style={{ marginRight: '1rem' }}
            />
          )}
          <Button
            type="primary"
            style={{ margin: 8 }}
            onClick={() => handlePNGDownload()}
            disabled={!imgData}
          >
            <DownloadOutlined /> PNG
          </Button>
          <Button
            type="primary"
            style={{ margin: 8 }}
            onClick={() => handlePDFDownload()}
            disabled={!imgData}
          >
            <DownloadOutlined /> PDF
          </Button>
        </div>
        <Image src={imgData} />
      </Modal>
    </>
  );
};

export default ShareImgPdf;
