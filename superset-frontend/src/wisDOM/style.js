import styled from 'styled-components';

export const MainTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & :not(:last-child) {
    margin-right: 12px;
  }
  button {
    color: #ffffff;
    background-color: #20a7c9;
    border-color: #20a7c9;
    padding: 5px 10px;
    font-size: 12px;
    line-height: 1.5;
    border-radius: 4px;
    margin-right: 10px;
    width: 120px;
  }
`;
