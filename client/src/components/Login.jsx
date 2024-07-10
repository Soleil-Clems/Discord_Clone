import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
// import { Spinner } from '@chakra-ui/react'
import { Input, Button } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios"


export default function Login() {
    const [message, setMessage] = useState('');
    const [user] = useState()
    const [socket, setSocket] = useState(null);
    const [username, setUsername] = useState("")
    const [password] = useState("")
    const toast = useToast()
    const navigate = useNavigate();


    useEffect(() => {
        // localStorage.removeItem("token")
        const newSocket = io('http://localhost:4242');
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket) {

            socket.on('message', (data) => {
                setMessage(data);
                console.log(message);
                toast({
                    title: "Success",
                    description: data,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                })
            });
        }
    }, [socket]);


    const handleClick = async () => {
        try {
            const response = await axios.post(
                "http://localhost:4242/api/users/login",
                {
                    username,
                    password
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.status === 200) { // 201 Created
                const data = response.data;

                toast({
                    title: `Welcome ${username}`,
                    description: data.message,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });
                socket.emit("user", username)
                localStorage.setItem("user", JSON.stringify(data.user));
                console.log(data)
                navigate('/room');
            }
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

    const handleChange = (e) => {
        setUsername(e.target.value)
    }

    return (
        <div className='flex flex-col gap-3 bg-discord-dark p-9'>
            <div className='text-white flex flex-col justify-center gap-1 items-center'>
                <p className='text-xl font-bold'>Welcome back!</p>
                <p className="text-slate-400 mb-3">We're so excited to see you agin!</p>
            </div>

            <form action="" method="post" className="flex flex-col gap-3">
                <label htmlFor="username" className="flex flex-col gap-2">
                    <p className="text-slate-300 font-medium">Username <span className='text-red-500 text-xl'>*</span></p>
                    <Input width="20em" id="username" bg="white" type="text" variant='outline' placeholder='Username' onChange={handleChange} required />
                </label>
                <Button bg="#7289da" color="white" _hover={{ bg: 'rgba(114,137,218, .8)' }} onClick={handleClick}>Log In</Button>
                <p className="text-sm text-neutral-500">Besoin d'un compte? <Link className="text-discord-purple" to="register">S'inscrire</Link></p>
            </form>
            {/* <Spinner /> */}
        </div>
    )
}
