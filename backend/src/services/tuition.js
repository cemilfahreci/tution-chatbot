import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TUITION_API_BASE = process.env.TUITION_API_BASE_URL;
const USERNAME = process.env.TUITION_API_USERNAME;
const PASSWORD = process.env.TUITION_API_PASSWORD;

let authToken = null;

// Get JWT token from Tuition API
async function getAuthToken() {
    if (authToken) return authToken;

    try {
        const response = await axios.post(`${TUITION_API_BASE}/api/v1/auth/login`, {
            username: USERNAME,
            password: PASSWORD
        });
        authToken = response.data.token;
        return authToken;
    } catch (error) {
        console.error('Auth error:', error.message);
        throw error;
    }
}

// Get tuition info by student number
export async function getTuitionInfo(studentNo) {
    try {
        const response = await axios.get(
            `${TUITION_API_BASE}/api/v1/mobile/tuition/${studentNo}`
        );

        if (typeof response.data === 'string' && response.data.includes('quota exceeded')) {
            throw new Error('RATE_LIMIT: Daily request limit exceeded.');
        }

        return response.data;
    } catch (error) {
        const isRateLimit = error.response?.status === 429 ||
            (typeof error.response?.data === 'string' && error.response.data.includes('quota exceeded')) ||
            error.message.includes('429');

        if (isRateLimit) {
            throw new Error('RATE_LIMIT: Daily request limit exceeded.');
        }

        if (error.response?.status === 404) {
            throw new Error('STUDENT_NOT_FOUND: Student not found.');
        }

        console.error('Get tuition error:', error.message);
        throw error;
    }
}

// Pay tuition
export async function payTuition(studentNo, amount, term) {
    try {
        const response = await axios.post(
            `${TUITION_API_BASE}/api/v1/banking/payment`,
            {
                StudentNo: studentNo,
                Term: term,
                Amount: amount
            }
        );
        return response.data;
    } catch (error) {
        console.error('Pay tuition error:', error.response?.data || error.message);
        throw error;
    }
}
