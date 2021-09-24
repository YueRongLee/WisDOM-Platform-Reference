/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Form, Tag, List, Result, Spin, message } from 'antd';
import { TableOutlined, LockOutlined } from '@ant-design/icons';
import { Bar } from '@ant-design/charts';
import moment from 'moment';
import { WKC_MESSAGE } from '~~constants/index';
import { AtlasApi } from '~~apis/';
import * as Style from './style';

// const formItemLayout = {
//   labelCol: {
//     xs: { span: 24 },
//     sm: { span: 6 },
//   },
//   wrapperCol: {
//     xs: { span: 24 },
//     sm: { span: 18 },
//   },
// };

const COLORS = [
  '#9B90C2',
  '#6E75A4',
  '#B5CAA0',
  '#FFC408',
  '#FB9966',
  '#F8C3CD',
];

// const NewNodeMenu = ({ selectItem, setSelectItem, setRecordHeader }) => {
const WKCHealthData = ({ data }) => {
  const [wkcData, setWKCData] = useState();
  const [wkcLoading, setWKCLoading] = useState(false);
  const [wkcHasData, setWKCHasData] = useState(false);
  const [form] = Form.useForm();

  // 時間轉換
  const timestampToTime = timestamp => {
    if (timestamp && timestamp !== '' && timestamp !== null) {
      return moment(timestamp).format('YYYY/MM/DD HH:mm:ss');
    }
    return null;
  };

  const getWKCData = async () => {
    try {
      setWKCLoading(true);
      const sendData = data.infosFromWkc.data;
      const result = await AtlasApi.getWKCDataDetail(sendData);
      if (result.code !== undefined) {
        switch (result.code) {
          case 0: // error
            message.error(WKC_MESSAGE.error, 5);
            console.log('error');
            break;
          case 1: // success
            setWKCData(result.data);
            setWKCHasData(true);
            break;
          case 2: // 系統維護
            message.info(WKC_MESSAGE.info, 5);
            break;
          default:
            break;
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setWKCLoading(false);
    }
  };

  useEffect(() => {
    if (data.infosFromWkc) {
      if (data.infosFromWkc.code !== undefined) {
        switch (data.infosFromWkc.code) {
          case 0: // error
            message.error(WKC_MESSAGE.error, 5);
            break;
          case 1: // success
            getWKCData();
            break;
          case 2: // 系統維護
            message.info(WKC_MESSAGE.info, 5);
            break;
          default:
            break;
        }
      }
    }
  }, []);

  const configField = data => ({
    data: data.slice(0, data.length >= 6 ? 6 : data.length),
    xField: 'value',
    yField: 'name',
    color: COLORS,
    seriesField: 'name',
    legend: { position: 'top-left' },
  });

  const changeFormate = num => {
    if (num !== undefined) {
      return parseFloat(num.toFixed(2)); // 到小數第2位
    }
    return num;
  };

  return (
    <>
      <Spin spinning={wkcLoading}>
        {(data && data.infosFromWkc && data.infosFromWkc !== '') ||
        wkcHasData === true ? (
          <Style.WKCForm
            form={form}
            name="healthData"
            scrollToFirstError
            destroyOnClose
          >
            <>
              <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ width: '50%' }}>
                  <Form.Item label="Table Name">
                    {wkcData && wkcData.tableName}
                  </Form.Item>
                  <Form.Item label="Description">
                    {wkcData && wkcData.description}
                  </Form.Item>
                  <Form.Item label="Classifications">
                    {(wkcData &&
                    wkcData.classifications &&
                    wkcData.classifications.length
                      ? wkcData.classifications
                      : []
                    ).map(c => (
                      <Tag className="listTag2">{c}</Tag>
                    ))}
                  </Form.Item>
                  <Form.Item label="State">
                    {wkcData && wkcData.state}
                  </Form.Item>
                  <Form.Item label="Tags">
                    {(wkcData && wkcData.tags && wkcData.tags.length
                      ? wkcData.tags
                      : []
                    ).map(tag => (
                      <Tag className="listTag2">{tag}</Tag>
                    ))}
                  </Form.Item>
                </div>
                <div style={{ width: '50%' }}>
                  <Form.Item label="Modified By">
                    {wkcData && wkcData.modifiedBy}
                  </Form.Item>
                  <Form.Item label="Update Time">
                    {timestampToTime(wkcData && wkcData.updateTime)}
                  </Form.Item>
                  <Form.Item label="Source">
                    {wkcData && wkcData.source}
                  </Form.Item>
                  <Form.Item label="Catalog">
                    {wkcData && wkcData.catalog}
                  </Form.Item>
                  <Form.Item label="Steward">
                    {wkcData && wkcData.steward}
                  </Form.Item>
                </div>
              </div>
              <hr />
              <div style={{ width: '100%', display: 'flex' }}>
                <p style={{ fontSize: '18px', width: '35%' }}>
                  <TableOutlined style={{ color: '#20a7c994' }} />
                  Column Information
                </p>
                <p style={{ fontSize: '18px', width: '65%' }}>
                  <TableOutlined style={{ color: '#20a7c994' }} />
                  Profile of Sample
                </p>
              </div>
              <Style.WKCListWapper
                grid={{ gutter: 4, column: 1 }}
                size="large"
                dataSource={
                  wkcData &&
                  wkcData.columnsFromWkc.length > 0 &&
                  wkcData.columnsFromWkc
                }
                pagination={false}
                renderItem={item => (
                  <List.Item key={item.guid}>
                    <Style.WKCColumnList>
                      <div style={{ width: '35%' }}>
                        <b style={{ fontSize: '16px', color: '#8d8d8d' }}>
                          {item.signed === true ? (
                            <span>
                              <LockOutlined
                                style={{ color: '#20a7c9', margin: '8px' }}
                              />
                              {item.name}({item.type})
                            </span>
                          ) : (
                            `${item.name}(${item.type})`
                          )}
                        </b>
                        <p style={{ fontSize: '14px', color: '#8d8d8d' }}>
                          {item.displayName}
                        </p>
                        <p style={{ fontSize: '14px', color: '#8d8d8d' }}>
                          {item.description}
                        </p>
                      </div>

                      {item.signed === true ? (
                        <div style={{ width: '65%', marginBottom: '10px' }}>
                          <div
                            style={{
                              fontSize: '16px',
                              color: '#8d8d8d',
                            }}
                          >
                            <LockOutlined />
                            Profile unavaliable
                          </div>
                          <div>
                            The profile is unavaliable because the data in this
                            column is anonymized.
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Frequency */}
                          <div
                            style={{
                              width: '40%',
                              margin: '0 20px 10px 5px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bolder',
                                marginBottom: '10px',
                                color: '#8d8d8d',
                              }}
                            >
                              Frequency
                            </div>
                            <Bar
                              style={{ height: '21vh' }}
                              {...configField(item.frequency)}
                            />
                            <div
                              style={{
                                fontSize: '9px',
                                color: '#8d8d8d',
                              }}
                            >
                              Showing{' '}
                              {item.frequency.length >= 6
                                ? 6
                                : item.frequency.length}{' '}
                              of {item.frequency.length}
                            </div>
                          </div>

                          {/* Statistic */}
                          <div style={{ width: '25%' }}>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bolder',
                                marginBottom: '10px',
                                color: '#8d8d8d',
                              }}
                            >
                              Statistic
                            </div>
                            <div style={{ color: '#8d8d8d' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div>Unque</div>
                                <div>
                                  {changeFormate(item.statistics.unque)}
                                </div>
                              </div>
                              <hr />
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div>
                                  {item.statistics.hasLengthPostfix === true
                                    ? 'Maximum Length'
                                    : 'Maximum'}
                                </div>
                                <div>
                                  {changeFormate(item.statistics.maximum)}
                                </div>
                              </div>
                              <hr />
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div>
                                  {item.statistics.hasLengthPostfix === true
                                    ? 'Minimum Length'
                                    : 'Minimum'}
                                </div>
                                <div>
                                  {changeFormate(item.statistics.minimum)}
                                </div>
                              </div>
                              <hr />
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div>
                                  {item.statistics.hasLengthPostfix === true
                                    ? 'Mean Length'
                                    : 'Mean'}
                                </div>
                                <div>{changeFormate(item.statistics.mean)}</div>
                              </div>
                              <hr />
                            </div>
                          </div>
                        </>
                      )}
                    </Style.WKCColumnList>
                    <hr />
                  </List.Item>
                )}
              />
            </>
          </Style.WKCForm>
        ) : (
          <Result
            status="warning"
            title="Oops! The metadata is not found in wkc."
          />
        )}
      </Spin>
    </>
  );
};

export default WKCHealthData;
