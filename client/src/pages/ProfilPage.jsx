import React from 'react';
import { useParams } from 'react-router-dom';

function ProfilPage() {
    const { username } = useParams();
    return (
        <div className="flex items-center justify-center w-full h-screen bg-discord-dark text-white">
            <div className="flex flex-col w-2/5 h-2/4 bg-discord-black rounded-md">
                <div className="h-1/3 overflow-hidden rounded-t-md">
                    <img
                        src="https://rotek.fr/wp-content/uploads/discord-1-1440x1080.webp"
                        alt="Discord"
                        className="object-cover w-full h-full"
                    />
                </div>
                <div className="relative flex-1 p-4">
                    <div className="absolute flex items-center justify-center w-20 h-20 p-1.5 -top-10 left-4 bg-discord-black rounded-full">
                        <img
                            src="https://rotek.fr/wp-content/uploads/discord-1-1440x1080.webp"
                            alt="Profile"
                            className="object-cover w-full h-full rounded-full"
                        />
                    </div>
                    <div className="flex items-center justify-center h-full w-full bg-rose-500 rounded-b-md ">
                        <div className="flex flex-col items-center">
                            <h2 className="mb-2 text-2xl font-bold">Username: {username}</h2>
                            <p>Other user info goes here...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilPage;
