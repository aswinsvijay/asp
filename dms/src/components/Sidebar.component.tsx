import { Box, Button } from '@mui/material';
import { Spacing } from '../utils';

export const SidebarComponent = <T extends string>({
  setCurrentView,
  items,
}: {
  setCurrentView: (value: T) => void;
  items: { label: T }[];
}) => {
  return (
    <Box display={'flex'} flexDirection={'column'} p={Spacing.SMALL} gap={Spacing.TINY}>
      {items.map((item) => (
        <Button
          key={item.label}
          variant="outlined"
          onClick={() => {
            setCurrentView(item.label);
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );
};
