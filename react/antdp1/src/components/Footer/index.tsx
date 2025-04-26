import { useIntl } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';
import { useEffect } from 'react';

const Footer: React.FC = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '程序员ShadowJobs出品',
  });

  const currentYear = new Date().getFullYear();
  useEffect(() => {

// 监听hash路由变化
    window.addEventListener('hashchange', function(e) {
      console.log('hashchange', e)
      // console.log('hashchange', e.newURL, e.oldURL)
      // console.log('hashchange', location.hash)
      // console.log('hashchange', location.href)
      // console.log('hashchange', location.pathname)
      // console.log('hashchange', location.search)
      // console.log('hashchange', location.host)
      // console.log('hashchange', location.hostname)
      // console.log('hashchange', location.port)
      // console.log('hashchange', location.protocol)
      // console.log('hashchange', location.origin)
    })
    window.onhashchange = function(e) {
      console.log('onhashchange', e)
      // console.log('onhashchange', e.newURL, e.oldURL)
      // console.log('onhashchange', location.hash)
      // console.log('onhashchange', location.href)
      // console.log('onhashchange', location.pathname)
      // console.log('onhashchange', location.search)
      // console.log('onhashchange', location.host)
      // console.log('onhashchange', location.hostname)
      // console.log('onhashchange', location.port)
      // console.log('onhashchange', location.protocol)
      // console.log('onhashchange', location.origin)
    }

    // 监听history路由变化
    window.addEventListener('popstate', function(e) {
      console.log('popstate', e)
      // console.log('popstate', e.newURL, e.oldURL)
      // console.log('popstate', location.hash)
      // console.log('popstate', location.href)
      // console.log('popstate', location.pathname)
      // console.log('popstate', location.search)
      // console.log('popstate', location.host)
      // console.log('popstate', location.hostname)
      // console.log('popstate', location.port)
      // console.log('popstate', location.protocol)
      // console.log('popstate', location.origin)

      console.log("popstate 变化了")
    })
    const history = window.history;
    const rawPushState = history.pushState;
    history.pushState = function(state: any, title: string, url?: string | null) {
      console.log('pushState', state, title, url)
      rawPushState.apply(history, arguments as any);
      console.log("pushstate 变化了")
    }
    const rawReplaceState = history.replaceState;
    history.replaceState = function(state: any, title: string, url?: string | null) {
      console.log('replaceState', state, title, url)
      rawReplaceState.apply(history, arguments as any);
      console.log("replaceState 变化了")
    }
  }, []);
  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage} 津ICP备2023004690号-1`}
      // links={[
      //   {
      //     key: 'shadowjobs',
      //     title: 'ShadowJobs的git仓库',
      //     href: 'https://github.com/ShadowJobs/publicNotes',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'github',
      //     title: <GithubOutlined />,
      //     href: 'https://github.com/ShadowJobs/publicNotes',
      //     blankTarget: true,
      //   }
      // ]}
    />
  );
};

export default Footer;
