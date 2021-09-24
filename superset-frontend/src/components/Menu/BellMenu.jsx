/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/**
 for Bell menual
 */
import React, { useState, useEffect } from 'react';
import NavDropdown from 'src/components/NavDropdown';
import { Button, List, message } from 'antd';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import moment from 'moment';
import { NotifyApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import './BellMenuStyle.less';

const CLICK_TYPE = {
  read: 'read',
  unread: 'unread',
};

// 時間轉換-只給日期
function timestampToTime(timestamp) {
  if (timestamp !== '' && timestamp !== null) {
    return moment(timestamp).format('MM/DD');
  }
  return null;
}

const BellMenu = ({ bellTimeOut, setBellTimeOut, setShowMessage }) => {
  const [showTotalCount, setShowTotalCount] = useState(true);
  const [clickType, setClickType] = useState(CLICK_TYPE.unread); // 預設unread
  const [loading, setLoading] = useState(false);
  const [unReadCount, setUnReadCount] = useState(0);
  const [unreadMessage, setUnreadMessage] = useState([]);
  const [readMessage, setReadMessage] = useState([]);
  let saveDate = ''; // for compare
  const getUnreadCountQuery = useQuery(NotifyApi.getUnreadCount);
  const getUnreadMsg = useQuery(NotifyApi.getMessage);
  const changeMsgStatus = useQuery(NotifyApi.changeMessageStatus);
  const setReadAll = useQuery(NotifyApi.setReadAll);
  const { trackEvent } = useMatomo();
  // const [timeCount, setTimeCount] = useState(0);
  const [bellNotifyCount, setBellNotifyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const getUnReadCount = async () => {
    const result = await getUnreadCountQuery.exec();
    if (result.result !== false && result.result !== true) {
      if (unReadCount !== 0 && unReadCount !== result.result) {
        setShowMessage(true);
      }
      setUnReadCount(result.result);
      setTotalCount(result.result);
    }
  };

  const getUnreadMessage = async () => {
    try {
      const req = {
        status: 0,
      };
      const result = await getUnreadMsg.exec(req);
      setUnreadMessage(result.results);
    } catch (e) {
      console.log(e);
    }
  };

  const getUnreadTotalCount = async () => {
    try {
      const req = {
        status: 0,
      };
      const result = await getUnreadMsg.exec(req);
      setTotalCount(result.pageInfo.total);
    } catch (e) {
      console.log(e);
    }
  };

  const getReadMessage = async () => {
    try {
      const req = {
        status: 1,
      };
      const result = await getUnreadMsg.exec(req);
      setReadMessage(result.results);
    } catch (e) {
      console.log(e);
    }
  };

  const updateList = () => {
    setLoading(true);
    getUnreadMessage();
    getReadMessage();
    setLoading(false);
  };

  const changeStatus = async data => {
    try {
      const req = {
        seqId: data.seqId,
        status: data.isReaded === 0 ? 1 : 0,
      };
      const result = await changeMsgStatus.exec(req);
      // update Count
      if (result.result !== false && result.result !== true) {
        setUnReadCount(result.result);
        setShowTotalCount(false);
      }
      updateList();
    } catch (e) {
      console.log(e);
    }
  };

  const handleBellClick = () => {
    setShowTotalCount(false);
    updateList();
    sessionStorage.removeItem('bellNotifyCount');
    getUnreadTotalCount();
    trackEvent({
      category: 'Bell',
      action: 'Bell Click',
    });
  };

  const handleUnread = () => {
    setClickType(CLICK_TYPE.unread);
  };

  const handleRead = () => {
    setClickType(CLICK_TYPE.read);
  };

  const handleMark = (row, e) => {
    changeStatus(row);
    e.stopPropagation();
  };

  const markAllAsRead = async () => {
    trackEvent({
      category: 'Bell',
      action: 'mark all as read click',
    });
    const result = await setReadAll.exec();
    // update total Count
    if (result) {
      setTotalCount(result.result);
      message.success('Mark all as read successfully!');
      updateList();
    }
  };

  const handleMarkAll = () => {
    if (totalCount !== 0 && totalCount) {
      markAllAsRead();
    } else {
      message.warning('There is no data to mark!');
    }
  };

  const compareDate = nowDate => {
    if (saveDate === '' || saveDate !== nowDate) {
      saveDate = nowDate;
      return nowDate;
    }
    return <div style={{ margin: '18px' }} />;
  };

  useEffect(() => {
    getUnReadCount();
  }, []);

  // useEffect(() => {
  //   const sessionBellNotifyCount = sessionStorage.getItem('bellNotifyCount');
  //   setTimeout(() => {
  //     const tempCount = timeCount + 1;
  //     setTimeCount(tempCount);
  //     setBellNotifyCount(sessionBellNotifyCount);
  //   }, 5000);
  // }, [timeCount]);

  // useEffect(() => {
  //   if (bellNotifyCount) {
  //     const tempTotalCount =
  //       parseInt(bellNotifyCount, 10) + parseInt(unReadCount, 10);
  //     setTotalCount(tempTotalCount);
  //     if (tempTotalCount !== 0) {
  //       setShowTotalCount(true);
  //     }
  //   }
  // }, [bellNotifyCount, unReadCount]);

  useEffect(() => {
    if (bellTimeOut && bellTimeOut !== 0) {
      getUnReadCount();
      setBellTimeOut(false);
    }
  }, [bellTimeOut]);

  return (
    <NavDropdown
      id="user-menu-dropwn"
      title={
        <>
          {totalCount !== 0 && showTotalCount ? (
            <span className="fa-stack" data-count={totalCount}>
              <i className="fa fa-bell fa-stack" />
            </span>
          ) : (
            <i className="fa fa-bell" />
          )}
        </>
      }
      onClick={() => handleBellClick()}
    >
      <h3 style={{ margin: '10px' }}>Notifications</h3>
      <div style={{ display: 'flex', width: '300px', margin: '5px' }}>
        <Button
          type="text"
          onClick={() => handleUnread()}
          className="bell-btn"
          style={
            clickType === CLICK_TYPE.unread
              ? { color: '#1A85A0', borderBottom: '2.5px solid #1A85A0' }
              : {}
          }
        >
          UnRead
        </Button>
        {/* read */}
        <Button
          type="text"
          onClick={() => handleRead()}
          className="bell-btn"
          style={
            clickType === CLICK_TYPE.read
              ? { color: '#1A85A0', borderBottom: '2.5px solid #1A85A0' }
              : {}
          }
        >
          Read
        </Button>
      </div>
      <div style={{ margin: '5px' }}>
        <div className="bell-markread">
          <div>Date</div>
          {clickType === CLICK_TYPE.unread ? (
            <Button
              className="mark-btn"
              type="text"
              onClick={() => handleMarkAll()}
            >
              Mark all as read
            </Button>
          ) : null}
        </div>
        <div
          style={{
            maxHeight: '60vh',
            overflow: 'auto',
          }} // 高度自動,超過螢幕的60％就scroll
        >
          <List
            loading={loading}
            itemLayout="vertical"
            dataSource={
              clickType === CLICK_TYPE.unread ? unreadMessage : readMessage
            }
            renderItem={item => (
              <List.Item
                id="menu-bell-listItem"
                style={{ display: 'flex', alignContent: 'center' }}
              >
                <div style={{ display: 'flex', alignContent: 'center' }}>
                  <div className="bell-msg-date">
                    {compareDate(timestampToTime(item.createAt))}
                  </div>
                  <div className="bell-msg-title">{item.message}</div>
                  {/* <div className="bell-msg-description">{item.message}</div> */}
                </div>
                <Button
                  size="small"
                  title={
                    item.isReaded === 0 ? 'mark as read' : 'mark as unread'
                  }
                  className="read-circle-btn"
                  style={{
                    borderRadius: '50%',
                    height: '16px',
                    background: item.isReaded === 0 ? '#3e86a0' : '#e6e6e6', // 未讀：藍色點點
                  }}
                  onClick={e => handleMark(item, e)}
                >
                  {' '}
                </Button>
              </List.Item>
            )}
          />
        </div>
      </div>
    </NavDropdown>
  );
};

BellMenu.propTypes = {};

BellMenu.defaultProps = {};

export default BellMenu;
