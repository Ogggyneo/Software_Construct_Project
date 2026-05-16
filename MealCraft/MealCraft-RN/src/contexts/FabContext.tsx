import React from 'react';

export const FabContext = React.createContext<{
  setFabVisible: (v: boolean) => void;
}>({ setFabVisible: () => {} });
