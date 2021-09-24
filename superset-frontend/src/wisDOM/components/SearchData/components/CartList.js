/* eslint-disable no-restricted-imports */
import React from 'react';
import PropTypes from 'prop-types';
import { Drawer, List, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
// import { AppContext } from 'src/store/appStore';
// import { ROLE_TYPE } from '~~constants/index';
import * as Style from './CartListStyle';

const CartList = ({
  cartlist,
  visible,
  onClose,
  Delete,
  // handleSubmit,
  // loading,
  handleDataflowNext,
}) => (
  //   const appStore = useContext(AppContext);

  <Drawer
    width="500px"
    title={<Style.CartListTitle>Selected Data List</Style.CartListTitle>}
    placement="right"
    closable
    onClose={onClose}
    visible={visible}
  >
    <List
      height="300px"
      grid={{ gutter: 4, column: 1 }}
      size="large"
      dataSource={cartlist}
      scroll={{ y: 300 }}
      pagination={false}
      renderItem={item => (
        <List.Item key={item.guid}>
          <Style.ListWrapper>
            <div>
              <div style={{ display: 'flex' }}>
                <Style.CartListText>
                  <div>{item.name}</div>
                  <hr />
                  <div style={{ fontSize: '14px', color: '#8d8d8d' }}>
                    {item.comment === 'null' ? '' : item.comment}
                  </div>
                </Style.CartListText>
                <Style.CartListIcon>
                  <CloseOutlined
                    type="primary"
                    onClick={() => Delete([item], false)}
                  />
                </Style.CartListIcon>
              </div>
            </div>
          </Style.ListWrapper>
        </List.Item>
      )}
    />
    <Style.FooterAction>
      <Button
        type="primary"
        htmlType="submit"
        disabled={!cartlist.length}
        style={{
          marginRight: '20px',
        }}
        onClick={handleDataflowNext}
      >
        Next
      </Button>
      {/* <Button
        type="primary"
        htmlType="submit"
        onClick={handleSubmit}
        disabled={!cartlist.length}
        loading={loading}
      >
        Next
      </Button> */}
    </Style.FooterAction>
  </Drawer>
);
CartList.propTypes = {
  cartlist: PropTypes.arrayOf(PropTypes.shape({})),
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  handleDataflowNext: PropTypes.func,
};

CartList.defaultProps = {
  cartlist: [],
  visible: false,
  onClose: () => null,
  handleDataflowNext: () => null,
};

export default CartList;
