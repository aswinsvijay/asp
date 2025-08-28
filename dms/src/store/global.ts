import React from 'react';

export interface IGloabalStore {
  theme?: 'light' | 'dark';
}

export const GlobalStore = React.createContext<IGloabalStore>({});

export const useGlobalStore = () => React.useContext(GlobalStore);
