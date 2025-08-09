import React from 'react';

export type IGloabalStore = {
  theme?: 'light' | 'dark';
};

export const GlobalStore = React.createContext<IGloabalStore>({});

export const useGlobalStore = () => React.useContext(GlobalStore);
