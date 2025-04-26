import { Space } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import React from 'react';
import { useModel, SelectLang } from 'umi';
import Avatar from './AvatarDropdown';
import styles from './index.less';
import Announcement from './Announcement';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      <Announcement/>
      <Avatar />
      <a href="https://github.com/ShadowJobs/publicNotes" target="_blank" rel="noopener noreferrer">
        <GithubOutlined/>
      </a>
      <SelectLang className={styles.action} />
    </Space>
  );
};
export default GlobalHeaderRight;
