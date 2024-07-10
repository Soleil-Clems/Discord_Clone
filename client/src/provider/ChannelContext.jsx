import { createContext, useState } from 'react';

export const ChannelContext = createContext();

export const ChannelProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [activeRoom, setActiveRoom] = useState('');

  return (
    <ChannelContext.Provider value={{ channels, setChannels, activeRoom, setActiveRoom }}>
      {children}
    </ChannelContext.Provider>
  );
};
