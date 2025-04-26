import { useEffect, useState } from 'react';
import { Button, notification } from 'antd';
import _ from 'lodash';

const announce = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    setAnnouncements([
      {id:1,content:"公告1",},
      {id:2,content:"公告2",},
    ]);
  }, []);

  useEffect(() => {

    announcements.forEach((announce) => {
      let annouceId = localStorage.getItem('annouceId');
      if (annouceId) {
        annouceId = JSON.parse(annouceId);
        if (annouceId.includes(announce.id)) {
          return;
        }
      }

      const close=() => {
        let annouceId = localStorage.getItem('annouceId');
        if (annouceId) {
          annouceId = JSON.parse(annouceId);
        } else {
          annouceId = [];
        }
        annouceId.push(announce.id);
        localStorage.setItem('annouceId', JSON.stringify(_.uniq(annouceId)))
        notification.close(announce.id) //函数关闭，这里不写的话，点右上角可以关闭，点COnfirm不会关闭

      }
      notification.info?.({
        message: `announce`,
        description: announce.content,
        duration: null, // Don't auto-close
        key: announce.id,
        btn:<Button type="primary" size="small" onClick={close}>
          Confirm
        </Button>,
        onClose: close
      });
    });
  }, [announcements]);

  return null;
}

export default announce;
