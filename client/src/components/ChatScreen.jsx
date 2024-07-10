import { useEffect, useState, useContext } from 'react';
import { ChannelContext } from '../provider/ChannelContext'; // Assurez-vous que le chemin est correct
import axios from "axios"
import { FcDownload } from "react-icons/fc";
import PropTypes from 'prop-types';
import TypingIndicator from './TypingIndicator';

export default function ChatScreen({ socket }) {
  const { activeRoom, setChannels } = useContext(ChannelContext);
  const [messages, setMessages] = useState([]);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const username = storedUser ? storedUser.username : null;

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
    if (socket) {
      const userInfo = {
        room: activeRoom.name,
        user: username,
      };

      socket.emit('joinRoom', userInfo);

      socket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        fetchChannels()
      });

      return () => {
        socket.off('message');
        setMessages(activeRoom.messages);

      };
    }
  }, [socket, activeRoom, username]);

 
  return (
    <div className="h-full bg-discord-dark text-white">
      <div className="h-full flex flex-col">

        <div className="flex-1 overflow-y-auto">

          {messages.map((message, index) => (
            <div key={index} className={`p-4 ${message.type === 'notification' ? 'text-slate-500' : ''}`}>
              {message.type === 'notification' ? (
                <p className="text-sm italic flex justify-center">{message.content}</p>
              ) : message.type === 'img' ? (
                <div className="flex items-start">
                  <p className="text-base">{message.sender.username} :</p>
                  <div className="flex items-center ml-2">
                    <img src={message.content} alt="User sent" className="max-h-64 rounded-md mr-2" />
                    <a href={message.content} download target="_blank" className="text-blue-500 hover:underline"><FcDownload /></a>
                  </div>
                </div>
              ) : message.type === 'typing' ? (
                <div className="flex items-center justify-start">
                  <TypingIndicator />
                  <p className="ml-2">{message.sender.username}</p>
                </div>
              ) : (
                <p className="text-base">{message.sender.username} : {message.content}</p>
              )}
            </div>
          ))}



        </div>

      </div>
    </div>
  );
}

ChatScreen.propTypes = {
  socket: PropTypes.object.isRequired,
  // activeRoom: PropTypes.object.isRequired,
};