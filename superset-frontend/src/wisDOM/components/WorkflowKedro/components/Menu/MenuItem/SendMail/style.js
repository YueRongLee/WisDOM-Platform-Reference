import styled from 'styled-components';
import ReactQuill from 'react-quill';

export const EmailScroll = styled.div`
  /* max-height: 54vh; */
  transition: color 0.3s ease;
  /* overflow-y: scroll; */
  // overflow-y: auto;
  color: rgba(0, 0, 0, 0);
  /* overflow-x: hidden; */
  overflow: auto;
  height: calc(70vh - 50px);
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
`;

export const NewReactQuill = styled(ReactQuill)`
  .ql-disabled {
    background: #f5f5f5;
    color: rgba(0, 0, 0, 0.25);
  }
`;
