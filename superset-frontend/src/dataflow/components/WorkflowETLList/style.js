/* eslint-disable no-restricted-imports */
import styled from 'styled-components';
import { Input } from 'antd';

export const ListTitle = styled.div`
  color: gray;
  padding: 20px 18px 0 18px;
  .ant-divider {
    border-color: gray;
    margin: 8px 0 12px 0;
  }
`;

export const ListTitleBlock = styled.div`
  display: flex;
  /* font-size: 14px; */
  justify-content: space-between;
`;

export const DataflowEtlList = styled.div`
  .ant-list {
    /* max-height: 70vh; */
    height: calc(69vh - 10vh);
    transition: color 0.3s ease;
    overflow-y: scroll;
    color: rgba(0, 0, 0, 0);
    overflow-x: hidden;
    max-width: 35vh;
    &:hover {
      color: rgba(0, 0, 0, 0.3);
    }
    &::-webkit-scrollbar-thumb {
      box-shadow: inset 0 0 0 10px;
    }
    &::-webkit-scrollbar,
    &::-webkit-scrollbar-thumb {
      width: 26px;
      border-radius: 13px;
      background-clip: padding-box;
      border: 10px solid transparent;
    }
  }
`;

// export const MemberCheckboxGroup = styled(Checkbox.Group)`
//   width: 100%;
//   overflow: auto;
//   border: 1px #b9b9b9 solid;
//   height: 260px;
//   &.ant-checkbox-group {
//     label,
//     span {
//       display: flex;
//       align-items: center;
//       font-size: 14px;
//       color: #333333;
//       /* line-height: 14px; */
//       /* height: 32px; */
//     }
//     label {
//       > span:nth-child(2) {
//         width: 100%;
//       }
//     }
//   }
//   .ant-checkbox-wrapper {
//     height: 32px;
//   }
//   .memberOptionBox {
//     height: 32px;
//     padding-left: 16px;
//     div:first-child {
//       width: 10%;
//     }
//   }
// `;

export const SearchBlock = styled(Input.Search)`
  .ant-input-search-button {
    background-color: #333333;
    color: white;
  }
  .ant-input {
    background-color: #333333;
    color: white;
  }
  .anticon-search {
    color: white;
  }
`;
