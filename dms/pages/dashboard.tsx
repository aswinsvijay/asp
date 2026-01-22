import React, { useState } from 'react';
import { SidebarComponent, DashboardViews, CustomIcon } from '@/src/components';
import { Box, Button } from '@mui/material';
import { Colors, Spacing, AuthUtils } from '@/src/utils';
import { useRouter } from 'next/router';

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<(typeof DashboardViews)[number]['label']>('Files');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AuthUtils.logout();
      await router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box display={'flex'} height={'100%'} gap={Spacing.SMALL}>
      <Box width={'250px'} height={'100%'} bgcolor={Colors.BACKGROUND}>
        <SidebarComponent
          items={DashboardViews}
          setCurrentView={(value) => {
            setCurrentView(value);
          }}
        />
      </Box>
      <Box display={'flex'} flex={'1'} flexDirection={'column'} p={Spacing.SMALL} gap={Spacing.SMALL}>
        <Box
          height={'40px'}
          bgcolor={Colors.BACKGROUND}
          borderRadius={Spacing.MEDIUM}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'flex-end'}
          px={Spacing.SMALL}
        >
          <Button
            variant="outlined"
            onClick={() => {
              void handleLogout();
            }}
            size="small"
          >
            <CustomIcon name="Logout" />
          </Button>
        </Box>
        <Box flex={'1'} bgcolor={Colors.BACKGROUND} borderRadius={Spacing.MEDIUM}>
          {DashboardViews.map(({ label, Component }) => {
            return currentView === label && <Component key={label} />;
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
