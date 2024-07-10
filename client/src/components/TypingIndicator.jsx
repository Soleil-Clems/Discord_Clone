import { Box, HStack } from '@chakra-ui/react';
import React from 'react';

const TypingIndicator = () => {
  return (
    <HStack spacing="3px">
      {[...Array(3)].map((_, i) => (
        <Box
          key={i}
          w="8px"
          h="8px"
          bg="gray.400"
          borderRadius="50%"
          animation={`typing 1.5s ${i * 0.2}s infinite`}
        />
      ))}
      <style jsx global>{`
        @keyframes typing {
          0%, 80%, 100% {
            opacity: 0.2;
          }
          40% {
            opacity: 1;
          }
        }
      `}</style>
    </HStack>
  );
};

export default TypingIndicator;
