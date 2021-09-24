/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { Spin, Result } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { WorkFlowApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import { FUNCTIONS } from '~~constants/index';
import * as Style from './style';

// preview Chart
const SubPowerBiPoperties = ({ nodeData, data, seqId }) => {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState();
  const [errorMsg, setErrorMsg] = useState('Something is error.');
  const getPowerBiUrl = useQuery(WorkFlowApi.postPowerBiPreview);

  const getUrl = async id => {
    setLoading(true);
    const sendData = {
      seqId: id, // templateId
    };
    try {
      const result = await getPowerBiUrl.exec(sendData);
      setUrl(result);
      if (!result && result !== '') {
        setErrorMsg(undefined);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const initSet = () => {
    if (nodeData && data) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg = nodeFilter[0].args;

      if (setNewArg && setNewArg.templateId) {
        getUrl(setNewArg.templateId);
      } else {
        setUrl();
        setErrorMsg('Please Select PowerBi Setting!');
      }
    }
  };

  useEffect(() => {
    initSet();
  }, []);

  useEffect(() => {
    if (nodeData.id !== undefined && nodeData.id !== null) {
      initSet();
    }
  }, [nodeData]);

  return (
    <Style.PowerBiScroll className="node-wrapper">
      <Spin spinning={loading}>
        {url ? (
          //   URL:{url}
          <iframe
            title="Power bi"
            src={url}
            id="ifr1"
            name="ifr1"
            scrolling="yes"
            style={{ height: '58vh' }}
          />
        ) : (
          <Result
            style={{ flex: 1, paddingTop: 80 }}
            icon={<InfoCircleOutlined />}
            title="No Data"
            subTitle={!seqId ? 'Please click save and try again.' : errorMsg}
          />
        )}
      </Spin>
    </Style.PowerBiScroll>
  );
};

export default SubPowerBiPoperties;
