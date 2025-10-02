import React, { useState } from 'react';
import { SidebarComponent, DashboardViews } from '@/src/components';
import { Box } from '@mui/material';
import { Colors, Spacing } from '@/src/utils';

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<(typeof DashboardViews)[number]['label']>('Files');

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
      <Box display={'flex'} flex={'1'} p={Spacing.SMALL}>
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
