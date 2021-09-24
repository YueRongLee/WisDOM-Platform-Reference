import styled from 'styled-components';
import ReactQuill from 'react-quill';

export const NewReactQuill = styled(ReactQuill)`
  .ql-disabled {
    background: #f5f5f5;
    color: rgba(0, 0, 0, 0.25);
  }
  .ql-editor {
    min-height: 300px;
  }
`;

export const Container = styled.div`
  /* height: calc(90vh - 150px); */
  background-color: rgb(242, 242, 242);
  margin: 0 10px;
  min-height: 300px;
`;

export const QuillContainer = styled.div`
  margin: 0 10px;
  background: #fff;
`;
