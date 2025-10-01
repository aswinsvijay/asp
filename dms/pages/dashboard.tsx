import React, { useState } from 'react';
import { SidebarComponent, DashboardViews } from '@/src/components';
import { Box } from '@mui/material';

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<(typeof DashboardViews)[number]['label']>('Files');

  return (
    <Box display={'flex'} height={'100%'}>
      <Box width={'15%'} height={'100%'}>
        <SidebarComponent
          items={DashboardViews}
          setCurrentView={(value) => {
            setCurrentView(value);
          }}
        />
      </Box>
      <Box flex={'1'}>
        {DashboardViews.map(({ label, Component }) => {
          return currentView === label && <Component />;
        })}
      </Box>
    </Box>
  );
};

export default Dashboard;
