import { useEffect, useContext} from 'react';
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from 'axios';
import PropTypes from 'prop-types';
import { useToast } from '@chakra-ui/react';
import { ChannelContext } from '../provider/ChannelContext';

export default function RoomList({ socket }) {
  const { channels, setChannels, setActiveRoom } = useContext(ChannelContext);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser ? storedUser.id : null;
  const username = storedUser.username;
  console.log(username)
  const toast = useToast();

  const fetchChannels = async () => {
    try {
      const response = await axios.get('http://localhost:4242/api/channels');
      const updatedChannels = response.data.map(channel => {
        if (!channel.name) {
          if (channel.senderOne === username) {
            channel.name = channel.senderTwo; // or channel.senderTwo, depending on your logic
          } else {
            
            channel.name = channel.senderOne; 
          }
        }
        return channel;
      });
      setChannels(updatedChannels);
      console.log(updatedChannels);
    } catch (error) {
      console.error('Erreur lors de la récupération des channels:', error);
    }
  };
  

  useEffect(() => {
    

    fetchChannels();

    const interval = setInterval(fetchChannels, 30000); // Appel toutes les 30 secondes

    return () => clearInterval(interval);
  }, [setChannels]);

  const handleRoomClick = async (room) => {
    try {
      if (socket) {
        const response = await axios.patch(
          `http://localhost:4242/api/channels/join`,
          { userId, channelId: room._id },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 200) {
          socket.emit('joinRoom', { room: room.name, user: username });
          setActiveRoom(room);
        }
      }

      fetchChannels();
    } catch (error) {
      toast({
        title: 'An error occurred.',
        description: `Impossible de rejoindre la room ${room.name}`,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="relative h-full bg-discord-black text-white">
      <h2 className="text-center text-xl font-bold p-4">Rooms</h2>
      <ul className="divide-y divide-gray-700">
        {channels.map((channel) => (
          <li key={channel._id} className="p-2 cursor-pointer flex items-center gap-2" onClick={() => handleRoomClick(channel)}>
            <img src="https://via.placeholder.com/150" className='w-10 h-10 rounded-3xl' alt="group img" />
            {channel.name}
          </li>
        ))}
      </ul>
      <div className="absolute bottom-5 left-0 right-0 flex justify-center">
        <Link to={`/profil/${userId}`}>
          <FaUserCircle className='w-10 h-10 bg-white text-discord-purple rounded-3xl' />
        </Link>
      </div>
    </div>
  );
}

RoomList.propTypes = {
  socket: PropTypes.object.isRequired,
};
