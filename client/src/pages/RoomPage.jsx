import RoomList from '../components/RoomList';
import ChatScreen from '../components/ChatScreen';
import { io } from 'socket.io-client';
import InputChat from '../components/InputChat';
import { ChannelProvider, ChannelContext } from '../provider/ChannelContext';


const socket = io('http://localhost:4242');

export default function RoomPage() {
  return (
    <ChannelProvider>
      <div className="flex h-screen bg-discord-dark">
        <div className="relative w-52 bg-discord-dark">
          <RoomList socket={socket} />
        </div>
        <ChannelContext.Consumer>
          {({ activeRoom }) => (
            <div className="w-full relative">
              {activeRoom && <ChatScreen socket={socket} />}
              <div className="flex p-3 absolute bottom-0 left-0 right-0">
                <InputChat className="bg-blue-500 w-full" socket={socket} />
              </div>
            </div>
          )}
        </ChannelContext.Consumer>
      </div>
    </ChannelProvider>
  );
}
