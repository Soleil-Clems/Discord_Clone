import React, { useState } from 'react';
import { Input, Button, InputGroup, InputRightElement } from '@chakra-ui/react';

export default function PasswordInput({ onChange }) {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    return (
        <InputGroup size='md'>
            <Input
                pr='4.5rem'
                variant="outline"
                bg="white"
                type={show ? 'text' : 'password'}
                placeholder='Enter password'
                onChange={onChange}
            />
            <InputRightElement width='4.5rem'>
                <Button h='1.75rem' size='sm' onClick={handleClick}>
                    {show ? 'Hide' : 'Show'}
                </Button>
            </InputRightElement>
        </InputGroup>
    );
}
