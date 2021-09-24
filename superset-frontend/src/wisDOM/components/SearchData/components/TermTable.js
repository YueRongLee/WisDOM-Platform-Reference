/* eslint-disable no-restricted-imports */
import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, List, Table, message } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  StarFilled,
  CopyOutlined,
} from '@ant-design/icons';
import { AtlasApi } from '~~apis/';
import { TERM_SOURCE } from '~~constants/index';
import { useModal } from '~~hooks/';
import TermItem from './TermItem';

const columns = [
  {
    title: '',
    dataIndex: 'attribute_name',
    width: '40%',
  },
  {
    title: '',
    dataIndex: 'attribute_value',
  },
];

const TermTable = ({ termList, loading, setClickCard }) => {
  const [clickId, setClickId] = useState();
  const [tableLoading, setTableLoading] = useState();
  const [tables, setTables] = useState([]);
  const detailModal = useModal();
  const ref = useRef();

  const getWKCRelatedTable = async globalId => {
    try {
      setTableLoading(true);
      if (globalId) {
        const result = await AtlasApi.getWKCRelatedTables({
          globalId,
        });
        setTables(result);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    ref.current.scrollLeft = 0;
  }, [termList]);

  const handleCardClick = data => {
    if (data.sourceFrom === TERM_SOURCE.WKC.key) {
      if (clickId !== data.guid) {
        // false=>true
        setClickId(data.guid);
        setClickCard(data);
      } else {
        setClickId();
        setClickCard([]);
      }
    }
  };

  const scroll = scrollOffset => {
    ref.current.scrollLeft += scrollOffset;
  };

  const handleSeeAlso = item => {
    getWKCRelatedTable(item.globalId);
    if (item.sourceFrom === TERM_SOURCE.WKC.key) {
      detailModal.openModal(item);
    } else if (item.wikiUrls.length !== 0) {
      detailModal.openModal(item);
    }
  };

  const getData = extend => {
    const data = extend.map(e => ({
      attribute_name: e.attribute_name,
      attribute_value:
        e.attribute_value.length > 0 ? e.attribute_value[0] : e.attribute_value,
    }));
    return data;
  };

  const copyTableName = text => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    message.success('Copy successfully!');
  };

  return (
    <div className="subblock">
      <div
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex="0"
        className="toolicon"
        onClick={() => scroll(-200)}
      >
        <LeftOutlined />
      </div>
      <div className="termlist" ref={ref}>
        <List
          grid={{ gutter: 4 }}
          size="large"
          dataSource={termList}
          scroll={{ y: 300 }}
          pagination={false}
          renderItem={item => (
            <div
              style={{
                cursor: item.seeAlso !== '' ? 'pointer' : 'default',
              }}
            >
              <TermItem
                data={item}
                onSeeAlso={() => handleSeeAlso(item)}
                // setClickCard={setClickCard}
                handleCardClick={handleCardClick}
                clickId={clickId}
              />
            </div>
          )}
          loading={loading}
        />
      </div>
      <div
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex="0"
        className="toolicon"
        onClick={() => scroll(200)}
      >
        <RightOutlined />
      </div>
      <Modal
        width={900}
        visible={detailModal.visible}
        bodyStyle={{
          maxHeight: '70vh',
          overflow: 'auto',
        }} // 高度自動,超過螢幕的70％就scroll
        title={
          // Wiki-Prediction Daily IDL Overtime Expense(FIN Uncategorized)
          detailModal.modalData &&
          detailModal.modalData.sourceFrom === TERM_SOURCE.WKC.key
            ? `wkc-${detailModal.modalData && detailModal.modalData.name}`
            : `Wiki-
         ${detailModal.modalData && detailModal.modalData.name}
         (${detailModal.modalData && detailModal.modalData.qualifiedName})
         `
        }
        destroyOnClose
        onCancel={detailModal.closeModal}
        footer={
          <Button type="primary" onClick={detailModal.closeModal}>
            Ok
          </Button>
        }
      >
        {detailModal.modalData && (
          <>
            {detailModal.modalData &&
            detailModal.modalData.extend &&
            detailModal.modalData.sourceFrom === TERM_SOURCE.WKC.key ? (
              <>
                <Table
                  columns={columns}
                  // dataSource={detailModal.modalData.extend}
                  dataSource={getData(detailModal.modalData.extend)}
                  pagination={false}
                  rowKey="termGuid"
                />
                <div style={{ display: 'flex', padding: '15px' }}>
                  <div style={{ width: '40%' }}>Related Tables</div>
                  {tables ? (
                    <List
                      loading={tableLoading}
                      style={{ width: '60%', paddingLeft: '8px' }}
                      size="small"
                      // bordered
                      dataSource={tables}
                      renderItem={item => (
                        <List.Item>
                          {item}
                          <CopyOutlined
                            style={{ marginLeft: '5px', color: '#20a7c9' }}
                            onClick={() => copyTableName(item)}
                          />
                        </List.Item>
                      )}
                    />
                  ) : null}
                </div>
              </>
            ) : (
              <div>
                {detailModal.modalData.wikiUrls.map(url => (
                  <a href={url}>
                    <StarFilled /> {url}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

TermTable.propTypes = {
  termList: PropTypes.arrayOf(PropTypes.shape({})),
  loading: PropTypes.bool,
};

TermTable.defaultProps = {
  termList: [],
  loading: false,
};

export default TermTable;
