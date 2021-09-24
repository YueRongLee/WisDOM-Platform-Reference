import styled from 'styled-components';
import { Menu as DropdownMenu } from 'src/common/components';

export const DropdownMenuItem = styled(DropdownMenu.Item)`
  cursor: ${p => (p.childUrl === '' ? 'auto' : 'pointer')};
  &&.ant-menu-item-selected {
    background-color: ${p => (p.childUrl === '' ? '#fff' : '#f0feff')};
  }
`;
