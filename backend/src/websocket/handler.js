import { processMessage } from '../ai/agent.js';
import supabase from '../supabase/client.js';

// Store conversation history per chat
const conversations = new Map();

export function setupWebSocket(io) {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        const chatId = socket.id;
        conversations.set(chatId, []);

        // Handle incoming messages
        socket.on('message', async (data) => {
            const { content } = data;
            console.log(`[${chatId}] User: ${content}`);

            try {
                // Save user message to Supabase
                await saveMessage(chatId, 'user', content);

                // Get conversation history
                const history = conversations.get(chatId) || [];

                // Process through AI
                const response = await processMessage(content, history);

                // Update conversation history
                history.push({ role: 'user', content });
                history.push({ role: 'assistant', content: response.content });
                conversations.set(chatId, history.slice(-20)); // Keep last 20 messages

                // Determine message type based on tool results
                let messageType = 'text';
                let metadata = null;

                if (response.toolResults && response.toolResults.length > 0) {
                    const lastResult = response.toolResults[response.toolResults.length - 1];
                    if (lastResult.result.success) {
                        messageType = lastResult.result.type;
                        metadata = lastResult.result.data;
                    }
                }

                // Save bot response to Supabase
                await saveMessage(chatId, 'assistant', response.content, messageType, metadata);

                // Send response back to client
                socket.emit('message', {
                    role: 'assistant',
                    content: response.content,
                    messageType,
                    metadata,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Error processing message:', error);
                socket.emit('message', {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
                    messageType: 'error',
                    timestamp: new Date().toISOString()
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            conversations.delete(chatId);
        });
    });
}

// Save message to Supabase
async function saveMessage(chatId, role, content, messageType = 'text', metadata = null) {
    try {
        const { error } = await supabase
            .from('messages')
            .insert({
                chat_id: chatId,
                role,
                content,
                message_type: messageType,
                metadata
            });

        if (error) {
            console.error('Supabase insert error:', error);
        }
    } catch (err) {
        console.error('Save message error:', err);
    }
}
