/* eslint-disable no-restricted-imports */
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Button, List, Card } from 'antd';
import { TERM_SOURCE } from '~~constants/index';
import './TermItem.less';

const TermItem = ({ data, onSeeAlso, handleCardClick, clickId }) => (
  // const [click, setClick] = useState(false);

  <List.Item key={data.guid}>
    <Card
      //   onClick={
      //     data.sourceFrom === TERM_SOURCE.WKC.key
      //       ? () => handleCardClick(data)
      //       : null
      //   }
      bordered={false}
      hoverable={data.sourceFrom === TERM_SOURCE.WKC.key}
      style={data.guid === clickId ? { background: '#c9c9c96e' } : null}
      bodyStyle={{
        display: 'flex',
        alignItems: 'center',
        height: '250px',
        width: '200px',
        padding: '10px 20px',
        cursor: data.sourceFrom === TERM_SOURCE.WKC.key ? 'pointer' : 'default',
      }}
    >
      <div className="itemWrapper">
        <span
          style={{ height: '100%' }}
          onClick={
            data.sourceFrom === TERM_SOURCE.WKC.key
              ? () => handleCardClick(data)
              : null
          }
        >
          <div className="itemTitle" title={data.name}>
            {data.name}
          </div>
          <div className="itemsubTitle" title={data.qualifiedName}>
            ({data.qualifiedName})
          </div>
          <div className="itemContent ellipsis">
            {data.sourceFrom === TERM_SOURCE.WKC.key ? (
              <div title={data.shortDescription}>
                <p>{data.shortDescription}</p>
              </div>
            ) : (
              <div title={data.longDescription}>
                <p>{data.longDescription}</p>
              </div>
            )}
          </div>
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p>
            Source:{' '}
            {data.sourceFrom === TERM_SOURCE.WKC.key
              ? data.sourceFrom.toLowerCase()
              : data.sourceFrom}
          </p>
          {data.seeAlso || data.sourceFrom === TERM_SOURCE.WKC.key ? (
            <Button
              size="small"
              type="link"
              // style={{ alignSelf: 'flex-end' }}
              // disabled={!data.seeAlso}
              onClick={() => (onSeeAlso ? onSeeAlso() : null)}
            >
              {/* See Also */}
              {data.sourceFrom === TERM_SOURCE.WKC.key ? 'Detail' : 'See Also'}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  </List.Item>
);
TermItem.propTypes = {
  data: PropTypes.shape({}).isRequired,
  onSeeAlso: PropTypes.func,
};

TermItem.defaultProps = {
  onSeeAlso: () => null,
};

export default TermItem;
