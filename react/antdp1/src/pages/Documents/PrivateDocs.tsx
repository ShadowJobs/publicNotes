import React, { useState } from "react";
import { Tree, Layout, Empty, Spin, Typography, message } from "antd";
import { FolderOutlined, FileOutlined } from "@ant-design/icons";
import { PythonUrl } from "@/global";
import { request } from "umi";
import { useQuery } from "react-query";
import './document.less'; // 假设创建了这个样式文件
import { MarkdownComp } from "../LinYing/SmallComps";

const { Sider, Content } = Layout;
const { Title } = Typography;

interface TreeNode {
  key: string;
  title: string;
  isLeaf?: boolean;
  type: 'dir' | 'file';
  path: string;
  children?: TreeNode[];
}

interface FileData {
  repo: string;
  tree: any[];
}

const PrivateDocs: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 获取文件列表数据
  const { data: fileListData, isLoading: isLoadingFileList } = useQuery<FileData>(
    ["githubFileList"],
    async () => {
      try {
        const r = await request(`${PythonUrl}/doc/github-file-list`, {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('token') || '',
          },
        });
        return r.data;
      } catch (error) {
        message.error('权限不够，管理员才可以查看');
        console.error(error);}
    },
    {
      staleTime: 1000 * 36000, // 10小时
      cacheTime: 1000 * 72000, // 20小时
      onError: (error) => {
        message.error('Failed to load file list');
      }
    }
  );

  // 转换数据为树形结构
  const convertToTreeData = (data: any[]): TreeNode[] => {
    if (!data) return [];

    return data.map(item => {
      const node: TreeNode = {
        key: item.path,
        title: item.name,
        type: item.type,
        path: item.path,
        isLeaf: item.type === 'file'
      };

      if (item.children && item.children.length > 0) {
        node.children = convertToTreeData(item.children);
      }

      return node;
    });
  };

  // 处理文件/目录点击事件
  const handleSelect = async (selectedKeys: React.Key[], info: any) => {
    const node = info.node;

    // 如果点击的是文件，加载文件内容
    if (node.type === 'file') {
      setSelectedFile(node.path);
      setLoading(true);

      try {
        const response = await request(`${PythonUrl}/doc/github-file-content`, {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('token') || '',
          },
          params: {
            path: node.path,
          },
        });

        setFileContent(response);
      } catch (error) {
        message.error('Failed to load file content');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 渲染文件图标
  const renderTreeIcon = (node: TreeNode) => {
    return node.isLeaf ? <FileOutlined /> : <FolderOutlined />;
  };

  // 渲染文件内容
  const renderFileContent = () => {
    if (loading) {
      return <Spin size="large" tip="Loading content..." />;
    }

    if (!selectedFile) {
      return <Empty description="Select a file to view its content" />;
    }

    // 简单判断是否为 Markdown 文件
    if (selectedFile.endsWith('.md')) {
      return (
        <div className="markdown-container">
          <MarkdownComp content={fileContent} />
        </div>
      );
    }

    // 其他类型文件以纯文本显示
    return (
      <div className="text-content">
        <pre>{fileContent}</pre>
      </div>
    );
  };

  const treeData = fileListData ? convertToTreeData(fileListData.tree) : [];

  return (
    <Layout className="private-docs-layout">
      <Sider width={300} theme="light" className="docs-sider">
        <div className="sider-header">
          <Title level={4}>Repository: {fileListData?.repo || 'Loading...'}</Title>
        </div>

        {isLoadingFileList ? (
          <div className="loading-container">
            <Spin tip="Loading directory..." />
          </div>
        ) : (
          <Tree
            showIcon
            defaultExpandAll={false}
            onSelect={handleSelect}
            treeData={treeData}
            icon={renderTreeIcon}
            className="file-tree"
          />
        )}
      </Sider>

      <Content className="docs-content">
        {renderFileContent()}
      </Content>
    </Layout>
  );
};

export default PrivateDocs;