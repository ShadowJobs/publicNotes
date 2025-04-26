// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    name?: string;
    avatar_path?: string;
    userid?: string;
    email?: string;
    title?: string;
    group?: string;
    gender?:string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    role?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
    refreshT: number;
  };

  type LoginResult = {
    code?: number;
    type?: string;
    currentAuthority?: string;
    msg?:string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar_path?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar_path?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
