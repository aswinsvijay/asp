import { Icon } from '@mui/material';
import type * as Icons from '@mui/icons-material';

type IconName = keyof typeof Icons;

const toSnakeCase = (value: string) => {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

export const convertIconName = (name: IconName) => {
  switch (name) {
    default:
      return toSnakeCase(name);
  }
};

export const CustomIcon: React.FC<{ name: IconName }> = ({ name }) => {
  return <Icon>{convertIconName(name)}</Icon>;
};
