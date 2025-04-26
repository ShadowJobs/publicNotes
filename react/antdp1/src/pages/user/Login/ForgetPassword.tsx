import { resetPassword, sendVerifyCodeToEmail } from "@/services/ant-design-pro/api";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useIntl } from "umi";
import { ProFormCaptcha, ProFormText } from "@ant-design/pro-form";
import { Button, Form, FormInstance, Input, message, Modal } from "antd";
import { useState, useEffect } from "react";
import { FormattedMessage } from "umi";
import styles from './index.less';
export const InputMail: React.FC<{form:FormInstance}> = ({form}) => {
  const intl = useIntl();
  return <>
    <ProFormText
      fieldProps={{ size: 'large', prefix: <MailOutlined className={styles.prefixIcon} /> }}
      name="email"
      placeholder={intl.formatMessage({
        id: 'inputmail',
        defaultMessage: '请输入邮箱',
      })}
      rules={[
        {
          required: true,
          message: <FormattedMessage id="pages.login.mailNumber.required" defaultMessage="请输入邮箱！" />
        }, {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: <FormattedMessage id="pages.login.email.invalid" defaultMessage="邮箱格式错误！" />
        },
      ]}
    />
    <ProFormCaptcha
      fieldProps={{ size: 'large', prefix: <LockOutlined className={styles.prefixIcon} /> }}
      captchaProps={{ size: 'large' }}
      placeholder={intl.formatMessage({
        id: 'pages.login.captcha.placeholder',
        defaultMessage: '请输入验证码',
      })}
      captchaTextRender={(timing, count) => {
        if (timing) {
          return `${count} ${intl.formatMessage({
            id: 'pages.getCaptchaSecondText',
            defaultMessage: '获取验证码',
          })}`;
        }
        return intl.formatMessage({
          id: 'pages.login.mailLogin.getVerificationCode',
          defaultMessage: '获取验证码',
        });
      }}
      name="captcha"
      rules={[{
        required: true,
        message: <FormattedMessage id="pages.login.captcha.required" defaultMessage="请输入验证码！" />
      }]}
      onGetCaptcha={async () => {
        const email = form.getFieldValue('email');
        const rsp = await sendVerifyCodeToEmail({ email });
        if (rsp.code !== 0) {
          message.error(rsp.msg);
        }
      }}
    />
  </>
}
const ForgetPassword: React.FC<{defaultOpen:boolean}> = ({defaultOpen}) => {
  const [forgetForm] = Form.useForm();
  const [forgetModalOpen, setForgetModalOpen] = useState(defaultOpen);

  const handleResetPassword = async (values: any) => {
    const { email, captcha, password } = values;
    // 调用重置密码的 API，这里假设 `resetPassword` 是已导入的 API 请求方法
    try {
      await resetPassword({ email, captcha, password });
      message.success("重置成功");
      setForgetModalOpen(false);
      forgetForm.resetFields();
    } catch (error) {
      message.error("重置失败，请重试");
    }
  };
  return (
    <>
      <Modal title="忘记密码" open={forgetModalOpen} onCancel={() => setForgetModalOpen(false)} footer={null}>
        <Form form={forgetForm} onFinish={handleResetPassword}>
          <InputMail form={forgetForm} />
          <Form.Item label="新密码" name="password" rules={[{ required: true, message: "请输入新密码" }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请输入确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">重置密码</Button>
          </Form.Item>
        </Form>
      </Modal>
      <a onClick={() => setForgetModalOpen(true)}>
        <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
      </a>
    </>
  );
};

export default ForgetPassword;