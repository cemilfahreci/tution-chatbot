import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useWebSocket(url) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const socketInstance = io(url, {
            transports: ['websocket', 'polling']
        });

        socketInstance.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        socketInstance.on('message', (message) => {
            setIsTyping(false);
            setMessages(prev => [...prev, message]);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [url]);

    const sendMessage = useCallback((content) => {
        if (socket && isConnected) {
            // Add user message to local state
            setMessages(prev => [...prev, {
                role: 'user',
                content,
                timestamp: new Date().toISOString()
            }]);

            // Show typing indicator
            setIsTyping(true);

            // Send to server
            socket.emit('message', { content });
        }
    }, [socket, isConnected]);

    return {
        isConnected,
        messages,
        sendMessage,
        isTyping
    };
}
