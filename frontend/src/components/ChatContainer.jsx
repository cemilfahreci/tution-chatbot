import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { useWebSocket } from '../hooks/useWebSocket';

const WS_URL = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:3001';

export default function ChatContainer() {
    const [inputValue, setInputValue] = useState('');
    const [studentNumberInput, setStudentNumberInput] = useState('');
    const [showStudentInput, setShowStudentInput] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const { isConnected, messages, sendMessage, isTyping } = useWebSocket(WS_URL);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Check if last message is asking for student number
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant' &&
                (lastMsg.content?.toLowerCase().includes('student number') ||
                    lastMsg.content?.toLowerCase().includes('provide') ||
                    lastMsg.content?.toLowerCase().includes('enter'))) {
                setShowStudentInput(true);
            } else {
                setShowStudentInput(false);
            }
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && isConnected) {
            sendMessage(inputValue.trim());
            setInputValue('');
            inputRef.current?.focus();
        }
    };

    const handleStudentSubmit = (e) => {
        e.preventDefault();
        if (studentNumberInput.trim() && isConnected) {
            sendMessage(studentNumberInput.trim());
            setStudentNumberInput('');
            setShowStudentInput(false);
        }
    };

    const handlePayClick = ({ studentNo, balance, term }) => {
        // Use raw number for amount, not formatted string (locale issues)
        sendMessage(`Pay ${balance} dollars for student ${studentNo}, term ${term}`);
    };

    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <h1>🎓 Tuition Assistant</h1>
                <p>
                    {isConnected ? '● Connected' : '○ Connecting...'}
                </p>
            </div>

            {/* Messages */}
            <div className="messages-container">
                {messages.length === 0 && (
                    <div className="message assistant">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            Hello! I can help you with:
                            <br />• Check your tuition
                            <br />• Pay your tuition
                            <br /><br />
                            How can I assist you today?
                        </div>
                    </div>
                )}

                {messages.map((message, index) => (
                    <MessageBubble
                        key={index}
                        message={message}
                        onPayClick={handlePayClick}
                    />
                ))}

                {/* Student Number Input Box */}
                {showStudentInput && (
                    <div className="student-input-card">
                        <h4>Student Number</h4>
                        <form onSubmit={handleStudentSubmit}>
                            <input
                                type="text"
                                placeholder="Enter student number"
                                value={studentNumberInput}
                                onChange={(e) => setStudentNumberInput(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" disabled={!studentNumberInput.trim()}>
                                Submit
                            </button>
                        </form>
                    </div>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="message assistant">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="input-container" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    className="message-input"
                    placeholder="+ Message"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={!isConnected}
                />
                <button
                    type="submit"
                    className="send-button"
                    disabled={!isConnected || !inputValue.trim()}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
