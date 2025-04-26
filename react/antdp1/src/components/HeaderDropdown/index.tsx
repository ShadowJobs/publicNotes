import type { DropDownProps } from 'antd/es/dropdown';
import { Dropdown } from 'antd';
import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  overlay: React.ReactNode | (() => React.ReactNode) | any;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & Omit<DropDownProps, 'overlay'>;

// classNames的用法：
// 1，如果直接用字符串拼接的写法：
// const extraClass = "some-extra-class";
// const isActive = true;
// const combinedClasses = 'base-class' + (isActive ? ' active-class' : '') + (extraClass ? ' ' + extraClass : '');
// 2,用classNames的写法：
// const extraClass = "some-extra-class";
// const isActive = true;
// const combinedClasses = classNames(
//   'base-class',
//   { 'active-class': isActive },
//   extraClass
// );


const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ overlayClassName: cls, ...restProps }) => (
  <Dropdown overlayClassName={classNames(styles.container, cls)} {...restProps} />
);

export default HeaderDropdown;
