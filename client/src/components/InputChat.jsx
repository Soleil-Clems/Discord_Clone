import { useState, useRef, useEffect, useContext } from 'react';
import { Textarea, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useToast } from '@chakra-ui/react';
import EmojiPicker from 'emoji-picker-react';
import { RiEmojiStickerFill } from "react-icons/ri";
import axios from "axios";
import { ChannelContext } from '../provider/ChannelContext'; // Assurez-vous que le chemin est correct
import PropTypes from 'prop-types';
import { FaCode } from "react-icons/fa";


export default function InputChat({ socket }) {
    const { activeRoom, setActiveRoom, channels, setChannels } = useContext(ChannelContext);
    const [text, setText] = useState('');
    const [cmdChoose, setCmdChoose] = useState("");
    const [cmd] = useState(['/nick', '/list', '/create', '/delete', '/join', '/leave', '/users', '/msg', "/update", "/dall-e"]);
    const [suggestions, setSuggestions] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [listOpen, setListOpen] = useState(false);
    const [filteredChannels, setFilteredChannels] = useState([]);
    const [userList, setUserList] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser ? storedUser.id : null;
    const username = storedUser ? storedUser.username : null;
    const [user] = useState(username);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [emojiPickerRef]);

    useEffect(() => {
        // Écouter l'événement "rmmsg" depuis le socket
        if (socket) {
            socket.on("rmmsg", fetchChannels);
        }

        // Nettoyage de l'écouteur d'événement lorsque le composant est démonté
        return () => {
            if (socket) {
                socket.off("rmmsg", fetchChannels);
            }
        };
    }, [socket]);

    useEffect(() => {
        if (activeRoom) {
            socket.emit('getUsers', activeRoom.name, (users) => {
                setUserList(users);
            });
        }
    }, [activeRoom, socket]);

    const handleChange = (e) => {
        const input = e.target.value;
        setText(input);


        if (input.startsWith('/')) {
            const filteredCommands = cmd.filter((command) => command.startsWith(input));
            setSuggestions(filteredCommands);
        } else {
            setSuggestions([]);
            setFilteredUsers([]);
        }

        if (input.includes('@')) {
            const lastAtIndex = input.lastIndexOf('@');
            const usernameFragment = input.slice(lastAtIndex + 1);
            const filtered = userList.filter((username) => username.startsWith(usernameFragment));
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setText((prevText) => prevText + emojiObject.emoji);
    };

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

    const handleOpenAi = async (room, content) => {
        try {
            const response = await axios.post('http://localhost:4242/api/openai',
                {
                    content
                },
                { headers: { "Content-Type": "application/json" } }
            );
            const data = response.data
            socket.emit('openai', { room: activeRoom.name, message: data, user: "dall-e" });

            console.log(data)

        } catch (error) {
            console.error('Erreur lors de la récupération des channels:', error);
        }
    }

    const handleChangeNick = async (nickname) => {
        try {
            const response = await axios.patch(
                `http://localhost:4242/api/users/${userId}`,
                { nickname },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 200) {
                const data = response.data;
                toast({
                    title: `Nickname changed successfully ${username}`,
                    description: data.message,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });

                socket.emit('nick', { room: activeRoom.name, nick: nickname, user: user });
            }
            fetchChannels();
        } catch (error) {
            console.error('Error registering user', error);
            toast({
                title: 'An error occurred.',
                description: "User does not exist",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const handleCreateRoom = async (name, creator, users, messages) => {
        try {
            const response = await axios.post(
                `http://localhost:4242/api/channels`,
                { name, creator, users, messages },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 201) {
                toast({
                    title: `Success`,
                    description: `Channel ${name} created Successfully`,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });
                socket.emit('create', { room: activeRoom.name });
                fetchChannels();
            }
        } catch (error) {
            console.error('Create channel', error);
            toast({
                title: 'An error occurred.',
                description: "Create channel",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const handleDeleteRoom = async (creator, room) => {
        try {
            const response = await axios.post(
                `http://localhost:4242/api/channels/delete`,
                { creator, room },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 200) {
                toast({
                    title: `Success`,
                    description: `delete  ${room} Successfully`,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });
                socket.emit('deleteRoom', { user: user, room: room });
            }
            fetchChannels();
        } catch (error) {
            toast({
                title: 'An error occurred.',
                description: "Vous n'etes pas autorises ",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };


    const handleUpdateRoom = async (creator, newName, channel) => {
        try {
            const response = await axios.patch(
                `http://localhost:4242/api/channels/`,
                { creator, newName, channelId: channel._id },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 200) {
                toast({
                    title: `Success`,
                    description: `update  ${channel.name} to ${newName} Successfully`,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });
                console.log("update ok")
                socket.emit('updateRoom', { user: user, room: channel.name });
            }
            fetchChannels();
        } catch (error) {
            toast({
                title: 'An error occurred.',
                description: "Vous n'etes pas autorises ",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const handleJoinRoom = async (room) => {
        try {

            fetchChannels();
            const result = channels.filter((channel) => channel.name == room);
            if (result.length > 0) {
                setActiveRoom(result[0]);
                console.log(result[0])
                const response = await axios.patch(
                    `http://localhost:4242/api/channels/join`,
                    { userId: user._id, channelId: result[0]._id },
                    { headers: { "Content-Type": "application/json" } }
                );

                if (response.status === 200) {
                    socket.emit('joinRoom', { room: room, message: text, user: user });
                }
            } else {
                toast({
                    title: 'Ouppsss!',
                    description: `La room ${room} n'existe pas`,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
                fetchChannels();
            }
        } catch (error) {
            toast({
                title: 'An error occurred.',
                description: `Impossible de rejoindre la room ${room}`,
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const handleLeaveRoom = async (room) => {
        try {
            setActiveRoom('');
            socket.emit('leaveRoom', { room: room, message: text, user: user });
        } catch (error) {
            toast({
                title: 'An error occurred.',
                description: `Impossible de rejoindre la room ${room}`,
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const handleSendMessage = async (channelId, senderId, content) => {
        try {
            const response = await axios.post(
                `http://localhost:4242/api/messages`,
                { channelId, senderId, content },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 201) {
                toast({
                    title: `Success`,
                    description: `send  ${content} Successfully`,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });
            }
            fetchChannels();
        } catch (error) {
            toast({
                title: 'An error occurred.',
                description: "Send message ",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const handlePrivateMessage = async (nickname, message, users, sender) => {

        try {
            const response = await axios.post(
                `http://localhost:4242/api/channels/private`,
                { content: message, users, sender },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 201) {
                toast({
                    title: `Success`,
                    description: `send message Successfully`,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });
            }
            fetchChannels();
        } catch (error) {
            toast({
                title: 'An error occurred.',
                description: "Send message ",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }

        socket.emit('privateMessage', { nickname, message, sender: user });
    };

    const handleClick = () => {
        let cmdCond;
        let newText;
        let conv;
        let msgParts
        let nickname
        let message
        let filtered

        const containsElement = cmd.some(el => text.includes(el));
        if (containsElement) {
            conv = text + " ";
            cmdCond = conv.split(" ")[0];
            newText = conv.split(" ").slice(1).join(" ").trim();

            if (cmdChoose === "") {
                setCmdChoose(cmdCond);
            }
        } else {
            newText = text;
        }

        switch (cmdCond) {
            case "/nick":
                handleChangeNick(newText);
                setText('');
                setCmdChoose("");
                setSuggestions([]);
                break;
            case "/msg":
                msgParts = newText.split(" ");
                nickname = msgParts[0];
                message = msgParts.slice(1).join(" ");
                handlePrivateMessage(nickname, message, [nickname, username], userId);
                setText('');
                setCmdChoose("");
                setSuggestions([]);
                break;
            case "/join":
                handleJoinRoom(newText);
                setText('');
                setCmdChoose("");
                setSuggestions([]);
                break;
            case "/leave":
                handleLeaveRoom(activeRoom.name);
                conv = "";
                newText = "";
                setText('');
                setCmdChoose("");
                setSuggestions([]);
                break;
            case "/dall-e":
                handleOpenAi(activeRoom.name, newText);
                socket.emit('message', { room: activeRoom.name, message: newText, user: user });
                socket.emit('typing', { room: activeRoom.name, message: '', user: "dall-e" });
                conv = "";
                newText = "";
                setText('');
                setCmdChoose("");
                setSuggestions([]);
                break;
            case "/create":
                handleCreateRoom(newText, userId, userId, []);
                conv = "";
                newText = "";
                setText('');
                setCmdChoose("");
                setSuggestions([]);
                break;
            case "/update":
                handleUpdateRoom(userId, newText, activeRoom);
                conv = "";
                newText = "";
                setText('');
                setCmdChoose("");
                setSuggestions([]);
                // console.log(activeRoom.name, 'tot', newText)
                break;
            case "/delete":
                handleDeleteRoom(userId, newText);
                conv = "";
                newText = "";
                setText('');
                setCmdChoose("");
                setSuggestions([]);
                break;
            case "/users":
                socket.emit('getUsers', activeRoom.name, (users) => {
                    setUserList(users);
                    onOpen();
                });
                setText('');
                conv = "";
                newText = "";
                setCmdChoose("");
                setSuggestions([]);
                break;
            case "/list":
                filtered = channels.filter((channel) => channel.name.includes(newText));
                setFilteredChannels(filtered);
                setListOpen(true);
                setText('');
                setCmdChoose("");
                setSuggestions([]);
                break;
            default:
                socket.emit('message', { room: activeRoom.name, message: newText, user: user });
                handleSendMessage(activeRoom._id, userId, newText);
                setText('');
                conv = "";
                newText = "";
                setCmdChoose("");
                setSuggestions([]);
                break;
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setText((prevText) => {
            const lastSpaceIndex = prevText.lastIndexOf(' ');
            const newText = prevText.substring(0, lastSpaceIndex + 1) + suggestion + ' ';
            return newText;
        });
        setCmdChoose(suggestion);
        setSuggestions([]);
        setFilteredUsers([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            setText((prevText) => prevText + '\n');
        } else if (e.key === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <div className="flex w-full relative">
            <div className="flex w-full relative">
                <Textarea
                    width="100%"
                    border="none"
                    outline="none"
                    type="text"
                    variant="unstyled"
                    borderTopRightRadius="0"
                    borderBottomRightRadius="0"
                    bg="#424549"
                    color="white"
                    placeholder="Enter your message"
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    resize="none"
                />
                <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} bg="#424549" color="white" height="100%" borderTopLeftRadius="0" borderRadius="0" border="none">
                    <RiEmojiStickerFill className='text-xl text-discord-purple' />
                </Button>
                <Button bg="#424549" color="white" height="100%" borderTopLeftRadius="0" borderBottomLeftRadius="0" border="none"><FaCode className='text-xl text-discord-purple' /></Button>
                {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-14 right-2 z-10">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}
                {suggestions.length > 0 && (
                    <div className="absolute bottom-12 w-64 bg-discord-black rounded shadow-lg">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="p-2 hover:bg-discord-middle-dark cursor-pointer text-white"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
                {filteredUsers.length > 0 && (
                    <div className="absolute bottom-12 w-64 bg-discord-black rounded shadow-lg">
                        {filteredUsers.map((username, index) => (
                            <div
                                key={index}
                                className="p-2 hover:bg-discord-middle-dark cursor-pointer text-white"
                                onClick={() => handleSuggestionClick(username)}
                            >
                                {username}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Modal bg="#1e2124" isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Users in {activeRoom.name}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ul>
                            {userList.map((user, index) => (
                                <li key={index}>{user}</li>
                            ))}
                        </ul>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal bg="#1e2124" isOpen={listOpen} onClose={() => setListOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Channels matching your search</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ul>
                            {filteredChannels.map((channel, index) => (
                                <li key={index}>{channel.name}</li>
                            ))}
                        </ul>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}

InputChat.propTypes = {
    socket: PropTypes.object.isRequired,
};
