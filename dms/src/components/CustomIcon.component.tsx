import { Icon } from '@mui/material';
import type * as Icons from '@mui/icons-material';
import { toSnakeCase } from '../utils';

type IconName = keyof typeof Icons;

export const convertIconName = (name: IconName) => {
  switch (name) {
    default:
      return toSnakeCase(name);
  }
};

export const CustomIcon: React.FC<{ name: IconName }> = ({ name }) => {
  return <Icon>{convertIconName(name)}</Icon>;
};
