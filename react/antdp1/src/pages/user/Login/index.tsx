import {
  AlipayCircleOutlined,
  LockOutlined,
  UserOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import { Alert, Button, message, Space, Tabs } from 'antd';
import React, { useState } from 'react';
import { ProFormCheckbox, ProFormText, LoginForm } from '@ant-design/pro-form';
import { useIntl, history, FormattedMessage, SelectLang, useModel, useLocation } from 'umi';
import Footer from '@/components/Footer';
import { login, registAccount } from '@/services/ant-design-pro/api';

import styles from './index.less';
import { useForm } from 'antd/lib/form/Form';
import ForgetPassword, { InputMail } from './ForgetPassword';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => <Alert style={{ marginBottom: 24, }} message={content} type="error" showIcon />

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const openforget = useLocation().query?.openforget;
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const [regist, setRegist] = useState(false)
  const [form] = useForm()

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const data = await (regist ? registAccount : login)({ ...values, type });
      if (data.code === 0) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        if (regist) {
          setRegist(false)
          message.success("注册成功")
          return;
        }
        message.success(defaultLoginSuccessMessage);
        localStorage.setItem('token', data.token)
        await fetchUserInfo();
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        history.push(redirect || '/');
        return;
      }
      console.log(data.msg);
      message.error(data.msg);
      // 如果失败去设置用户错误信息
      setUserLoginState(data);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div>
      <div className={styles.content}>
        <LoginForm form={form}
          submitter={{
            searchConfig: { submitText: (regist && type != 'email') ? "注册" : "登录" },
            render: (_, dom) => {
              if (type === 'email') {
                dom.push(
                  <Button type="primary" htmlType="submit" style={{ width: '100%', flexGrow: 1 }}>
                    登录
                  </Button>)
              } else {
                dom.push(
                  <Button type="primary" htmlType="submit" style={{ width: '100%', flexGrow: 1 }}>
                    {regist ? "注册" : "登录"}
                  </Button>)
                !regist && dom.push(
                  <Button type="primary" onClick={() => {
                    form.setFieldsValue({ username: 'guest', password: 'guest' })
                    form.submit()
                  }} style={{ width: '100%', flexGrow: 1 }}>
                    游客登录
                  </Button>)
              }
              return dom
            },
            submitButtonProps: { size: 'large', style: { width: '100%' } }
          }}
          logo={<img alt="logo" src="/a.jpg" />}
          title="登录"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{ autoLogin: true }}
          actions={[
            <FormattedMessage key="loginWith" id="pages.login.loginWith" defaultMessage="其他登录方式" />,
            <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.icon}
              style={{ marginLeft: 10, transform: "scale(1.4)", color: "#1677FF", cursor: "pointer" }}
              onClick={() => { message.error("暂不支持支付宝登录") }}
            />,
            <WechatOutlined key="AlipayCircleOutlined" className={styles.icon}
              style={{ marginLeft: 10, transform: "scale(1.4)", color: "#12C25F", cursor: "pointer" }}
              onClick={() => { message.error("暂不支持微信登录") }}
            />,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
          onReset={() => form.resetFields()}
        >
          <Tabs activeKey={type} onChange={e => {
            setType(e);
            if (e === 'email') setRegist(false)
          }}>
            <Tabs.TabPane key="account"
              tab={intl.formatMessage({ id: 'pages.login.accountLogin.tab', defaultMessage: '账户密码登录' })}
            />
            <Tabs.TabPane key="email" tab="邮箱登录" />
          </Tabs>

          {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误(admin/admin)',
              })}
            />
          )}
          {type === 'account' && (
            <>
              <ProFormText name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'用户名: admin'}
                rules={[{
                  required: true,
                  message: <FormattedMessage id="pages.login.username.required" defaultMessage="请输入用户名!" />
                }]}
              />
              <ProFormText.Password name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'密码: admin'}
                rules={[{
                  required: true,
                  message: <FormattedMessage id="pages.login.password.required" defaultMessage="请输入密码！" />
                }]}
              />
              {regist && <InputMail form={form} />}
            </>
          )}

          {status === 'error' && loginType === 'email' && <LoginMessage content="验证码错误" />}
          {type === 'email' && <InputMail form={form}/>}
          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
            </ProFormCheckbox>
            <Space style={{ float: 'right', }}>
              {type != 'email' && <ProFormCheckbox noStyle checked={regist} onChange={() => setRegist(pre => !pre)}>
                <FormattedMessage id="pages.login.register" defaultMessage="注册" />
              </ProFormCheckbox>}
              <ForgetPassword defaultOpen={openforget=='1'}/>
            </Space>
          </div>
        </LoginForm>
        <div>测试用户admin,用户名密码相同</div>
      </div >
      <Footer />
    </div >
  );
};

export default Login;
