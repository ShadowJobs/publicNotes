import React, { useState } from 'react';
import { Input, Card, Button, Drawer, List, Typography, Space, Badge } from 'antd';
import { SearchOutlined, BulbOutlined, LinkOutlined } from '@ant-design/icons';
import styles from './2025.less';
import { Markdown } from '@/components/markdown/markdown';
import CopyBtn from '@/components/markdown/copy-btn';

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  published_at?: number;
  site_name?: string;
  site_icon?: string;
}

interface SearchIndex {
  url: string;
  cite_index: number;
}

interface ParsedData {
  searchResults: SearchResult[];
  searchIndexes: SearchIndex[];
  thinking: string;
  thinkingElapsedSecs: number;
  text: string;
  searchCount: number;
}

const DeepseekParser: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [mdStr, setMdStr] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedData>({
    searchResults: [],
    searchIndexes: [],
    thinking: '',
    thinkingElapsedSecs: 0,
    text: '',
    searchCount: 0,
  });
  const [searchDrawerVisible, setSearchDrawerVisible] = useState<boolean>(false);
  const [thinkingVisible, setThinkingVisible] = useState<boolean>(true);

  const parseDeepseekOutput = (input: string) => {
    const lines = input.split('\n');
    let searchResults: SearchResult[] = [];
    let searchIndexes: SearchIndex[] = [];
    let thinking = '> ';
    let text = '\n\n\n\n\n';
    let thinkingElapsedSecs = 0;
    let searchCount = 0;

    lines.forEach(line => {
      if (!line.startsWith('data:')) return;

      try {
        // 提取JSON部分
        const jsonStr = line.substring(line.indexOf('{'));
        const data = JSON.parse(jsonStr);

        if (!data.choices || !data.choices[0] || !data.choices[0].delta) return;

        const delta = data.choices[0].delta;

        // 处理搜索结果
        if (delta.type === 'search_result' && delta.search_results) {
          searchResults = [...searchResults, ...delta.search_results];
          searchCount = searchResults.length;
        }

        // 处理搜索索引
        if (delta.type === 'search_index' && delta.search_indexes) {
          searchIndexes = [...searchIndexes, ...delta.search_indexes];
        }

        // 处理思考内容
        if (delta.type === 'thinking' && delta.content) {
          thinking += delta.content;
        }

        // 处理思考时间
        if (data.thinking_elapsed_secs) {
          thinkingElapsedSecs = data.thinking_elapsed_secs;
        }

        // 处理正式回答
        if (delta.type === 'text' && delta.content) {
          text += delta.content;
        }
      } catch (e) {
        if (line === 'data: [DONE]') {
          console.log('回答结束')
        } else
          console.error('解析行失败:', e);
      }
    });

    setParsedData({
      searchResults,
      searchIndexes,
      thinking,
      thinkingElapsedSecs,
      text,
      searchCount: searchCount || searchIndexes.length,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleParse = () => {
    parseDeepseekOutput(inputValue);
  };
  const [activeTabKey, setActiveTabKey] = useState('deepseek');

  return (
    <div className={styles.container}>

      <div style={{position:"absolute",right:10}}><CopyBtn className='mr-1' value={parsedData?.text} isPlain/></div>
      <Card
        tabList={[
          { key: 'deepseek', tab: 'Deepseek解析器' },
          { key: 'md', tab: 'MD解析器' },
        ]}
        activeTabKey={activeTabKey}
        onTabChange={key => setActiveTabKey(key)}
        className={styles.tabCard}
        bodyStyle={{ padding: 0 }}
      >
        {activeTabKey === 'deepseek' ? (
          <div className={styles.tabContent}>
            <TextArea
              rows={6}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="请粘贴Deepseek的输出内容..."
            />
            <Button
              type="primary"
              onClick={handleParse}
              style={{ marginTop: 16 }}
            >
              解析
            </Button>
          </div>
        ) : (
          <div className={styles.tabContent}>
            <TextArea
              rows={6}
              value={mdStr}
              onChange={e => setMdStr(e.target.value)}
              placeholder="请粘贴md的输出内容..."
            />
            <Button
              type="primary"
              onClick={() => {
                setParsedData({
                  searchResults: [],
                  searchIndexes: [],
                  thinking: '',
                  thinkingElapsedSecs: 0,
                  text: mdStr,
                  searchCount: 0,
                });
              }}
              style={{ marginTop: 16 }}
            >
              解析
            </Button>
          </div>
        )}
      </Card>
      {(parsedData.text || parsedData.thinking || parsedData.searchResults.length > 0) && (
        <Card className={styles.resultCard}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Badge count={parsedData.searchCount}>
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => setSearchDrawerVisible(true)}
                >
                  已搜索到 {parsedData.searchCount} 个网页
                </Button>
              </Badge>

              <Badge count={parsedData.thinking ? 1 : 0}>
                <Button
                  icon={<BulbOutlined />}
                  onClick={() => setThinkingVisible(!thinkingVisible)}
                >
                  已深度思考，{parsedData.thinkingElapsedSecs}秒
                </Button>
              </Badge>
            </Space>

            {thinkingVisible && (
              <Card type="inner" title="思考内容" className={styles.thinkingCard}>
                <pre>{parsedData.thinking}</pre>
              </Card>
            )}
            <Markdown content={parsedData.text} />
          </Space>
        </Card>
      )}

      <Drawer
        title="搜索结果"
        placement="right"
        onClose={() => setSearchDrawerVisible(false)}
        open={searchDrawerVisible}
        width={400}
      >
        <List
          itemLayout="vertical"
          dataSource={parsedData.searchResults}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Badge count={index + 1}>
                    {item.site_icon && (
                      <img
                        src={item.site_icon}
                        alt={item.site_name}
                        style={{ width: 20, height: 20 }}
                      />
                    )}
                  </Badge>
                }
                title={
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title} <LinkOutlined />
                  </a>
                }
                description={
                  <Space direction="vertical">
                    <Text type="secondary">{item.site_name} {item.published_at && new Date(item.published_at * 1000).toLocaleDateString()}</Text>
                  </Space>
                }
              />
              <Paragraph ellipsis={{ rows: 3 }}>{item.snippet}</Paragraph>
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};

export default DeepseekParser;