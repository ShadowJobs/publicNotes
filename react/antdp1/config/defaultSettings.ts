import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: "ShadowJobs website", //坑：这里不用用shadowjobs' blog，否则会报错
  pwa: false,
  logo: '/a.jpg',
  iconfontUrl: '',
  // splitMenus:true,
};

export default Settings;
