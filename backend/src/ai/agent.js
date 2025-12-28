import axios from 'axios';
import dotenv from 'dotenv';
import { systemPrompt } from './tools.js';
import { getTuitionInfo, payTuition } from '../services/tuition.js';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Execute tool calls based on parsed intent
async function executeToolCall(toolName, args) {
    console.log('Executing tool:', toolName, args);

    switch (toolName) {
        case 'get_tuition_info':
            try {
                const tuitionData = await getTuitionInfo(args.studentNo);
                return {
                    success: true,
                    type: 'tuition_card',
                    data: tuitionData
                };
            } catch (error) {
                if (error.message.includes('RATE_LIMIT')) {
                    return {
                        success: false,
                        type: 'rate_limit',
                        error: '⚠️ Rate limit exceeded! Please try again tomorrow.'
                    };
                }
                if (error.message.includes('STUDENT_NOT_FOUND')) {
                    return {
                        success: false,
                        error: '🚫 Student not found. Please check the student number.'
                    };
                }
                return { success: false, error: error.message };
            }

        case 'pay_tuition':
            try {
                const paymentResult = await payTuition(
                    args.studentNo,
                    args.amount,
                    args.term
                );
                return {
                    success: true,
                    type: 'payment_success',
                    data: paymentResult
                };
            } catch (error) {
                return { success: false, error: error.message };
            }

        default:
            return { success: false, error: 'Unknown tool: ' + toolName };
    }
}

// Process user message through Ollama
export async function processMessage(userMessage, conversationHistory = []) {
    try {
        // Build conversation for Ollama
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map(m => ({
                role: m.role,
                content: m.content
            })),
            { role: 'user', content: userMessage }
        ];

        // Call Ollama
        const response = await axios.post(OLLAMA_URL + '/api/chat', {
            model: MODEL,
            messages: messages,
            stream: false,
            options: {
                temperature: 0.7
            }
        });

        const assistantMessage = response.data.message.content;

        // Try to parse intent from user message directly
        const userLower = userMessage.toLowerCase();

        // Direct student number input (just a number)
        if (/^\d{3,}$/.test(userMessage.trim())) {
            const result = await executeToolCall('get_tuition_info', { studentNo: userMessage.trim() });

            if (result.success) {
                return {
                    content: 'Here is the tuition information:',
                    toolResults: [{ toolName: 'get_tuition_info', result }]
                };
            } else {
                return {
                    content: result.error || 'Could not retrieve tuition information.',
                    toolResults: [{ toolName: 'get_tuition_info', result }]
                };
            }
        }

        // Check tuition intent
        if (userLower.includes('check') || userLower.includes('tuition') || userLower.includes('status')) {
            return {
                content: 'Sure, I can help with that. Please provide your student number.',
                toolResults: []
            };
        }

        // Pay tuition intent  
        if (userLower.includes('pay')) {
            // Try to extract payment info from message
            const studentMatch = userMessage.match(/student\s*(\d+)/i);
            const amountMatch = userMessage.match(/\$?([\d,]+)/);
            const termMatch = userMessage.match(/(Fall|Spring)\s*\d{4}/i);

            if (studentMatch && amountMatch && termMatch) {
                const result = await executeToolCall('pay_tuition', {
                    studentNo: studentMatch[1],
                    amount: parseFloat(amountMatch[1].replace(/,/g, '')),
                    term: termMatch[0].replace(/\s/g, '')
                });

                if (result.success) {
                    return {
                        content: 'Payment successful.',
                        toolResults: [{ toolName: 'pay_tuition', result }]
                    };
                } else {
                    return {
                        content: 'Payment failed: ' + result.error,
                        toolResults: [{ toolName: 'pay_tuition', result }]
                    };
                }
            }

            return {
                content: 'Okay, I can assist you with that. Please check your tuition first to see the amount due.',
                toolResults: []
            };
        }

        // Confirmation for payment
        if (userLower === 'yes' || userLower === 'confirm') {
            for (let i = conversationHistory.length - 1; i >= 0; i--) {
                const msg = conversationHistory[i];
                if (msg.metadata && msg.metadata.student_no) {
                    const tuition = msg.metadata.tuitions?.[0];
                    if (tuition && tuition.balance > 0) {
                        const result = await executeToolCall('pay_tuition', {
                            studentNo: msg.metadata.student_no,
                            amount: tuition.balance,
                            term: tuition.term
                        });

                        if (result.success) {
                            return {
                                content: 'Payment successful.',
                                toolResults: [{ toolName: 'pay_tuition', result }]
                            };
                        }
                    }
                }
            }
        }

        // Default response from Ollama
        return {
            content: assistantMessage,
            toolResults: []
        };

    } catch (error) {
        console.error('Ollama error:', error.message);
        return {
            content: "I'm here to help you with tuition queries and payments. You can say 'check my tuition' or 'pay my tuition'.",
            toolResults: []
        };
    }
}
