import React, { useState } from 'react';
import { Input, Button, useToast } from '@chakra-ui/react'
import { useNavigate, Link } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import axios from "axios"

export default function Register() {
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [show, setShow] = React.useState(false)
    const toast = useToast()
    const navigate = useNavigate();





    const handleClick = async () => {
        try {
            const response = await axios.post(
                "http://localhost:4242/api/users/register",
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
    
            if(response.status === 201){ // 201 Created
                const data = response.data;
    
                toast({
                    title: 'Account created.',
                    description: data.message,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });
    
                navigate('/'); 
            }
        } catch (error) {
            console.error('Error registering user', error);
            toast({
                title: 'An error occurred.',
                description: "User already exist",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const handleChange = (e) => {
        setUsername(e.target.value)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

    return (
        <div className='flex flex-col gap-3 bg-discord-dark p-9'>
            <div className='text-white flex flex-col justify-center gap-1 items-center'>
                <p className='text-xl font-bold'>Welcome back!</p>
                <p className="text-slate-400 mb-3">We're so excited to see you again!</p>
            </div>

            <form action="" method="post" className="flex flex-col gap-3">
                <label htmlFor="username" className="flex flex-col gap-2">
                    <p className="text-slate-300 font-medium">Username <span className='text-red-500 text-xl'>*</span></p>
                    <Input width="20em" id="username" bg="white" type="text" variant='outline' placeholder='Username' onChange={handleChange} required />
                </label>
                <label htmlFor="password" className="flex flex-col gap-2">
                    <p className="text-slate-300 font-medium">Password</p>
                    <PasswordInput onChange={handlePasswordChange} />
                </label>
                <Button bg="#7289da" color="white" _hover={{ bg: 'rgba(114,137,218, .8)' }} onClick={handleClick}>Register</Button>
                <p className="text-sm text-neutral-500">Besoin d'un compte? <Link className="text-discord-purple" to="/">Se connecter</Link></p>
            </form>
        </div>
    )
}
