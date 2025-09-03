import { createContext, useEffect, useState } from "react";
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SERVER_URL);
export const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => {
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            setSocketConnected(true);
            console.log('Socket connected');
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
            console.log('Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }, []);

    return (
        <SocketContext.Provider value={{ socket, socketConnected }}>
            {children}
        </SocketContext.Provider>
    );
};