import styled from 'styled-components';

export const DataflowExploreContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 150vh;
`;

export const DataflowListContainer = styled.div`
  // flex: 1 0 30vw;
  display: flex;
  flex-direction: column;
  // padding: 20px 20px 0 20px;
  font-size: 20px;
  overflow: hidden;
  max-height: 180px;
  .ant-tree-treenode {
    width: 100%;
  }
  .ant-tree-node-content-wrapper {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ant-form-item {
    margin-bottom: 5px;
  }
`;

export const DataflowContainer = styled.div`
  // height: 60vh;
  // flex: 3 1 60vw;
  display: flex;
  flex-direction: column;
  padding-left: 10px;
  overflow: hidden;
  max-height: 80vh;
`;
