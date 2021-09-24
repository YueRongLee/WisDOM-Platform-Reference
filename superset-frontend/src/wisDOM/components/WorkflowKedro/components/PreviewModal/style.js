import styled from 'styled-components';
import SqlKedro from 'src/wisDOM/components/SqlKedro/SqlKedro';

export const ModalKedro = styled(SqlKedro)`
  .schema-list-wrapper {
    overflow: auto;
    height: 100%;
  }

  .ant-spin-nested-loading {
    height: 100%;
  }

  .kedro-content {
    width: 100%;
  }
`;
