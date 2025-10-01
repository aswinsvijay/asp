import { Box, Button } from '@mui/material';

export const SidebarComponent = <T extends string>({
  setCurrentView,
  items,
}: {
  setCurrentView: (value: T) => void;
  items: { label: T }[];
}) => {
  return (
    <Box display={'flex'} flexDirection={'column'}>
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
