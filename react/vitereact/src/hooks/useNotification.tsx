import { App } from "antd";

export default function useNotification() {
  const { notification } = App.useApp();
  return notification;
}
