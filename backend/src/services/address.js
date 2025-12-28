import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ADDRESS_API_BASE = process.env.ADDRESS_API_BASE_URL;

// Get all addresses
export async function getAllAddresses() {
    try {
        const response = await axios.get(`${ADDRESS_API_BASE}/api/addresses`);
        return response.data;
    } catch (error) {
        console.error('Get addresses error:', error.message);
        throw error;
    }
}

// Search addresses
export async function searchAddresses(query) {
    try {
        const response = await axios.get(
            `${ADDRESS_API_BASE}/api/addresses/search?q=${encodeURIComponent(query)}`
        );
        return response.data;
    } catch (error) {
        console.error('Search addresses error:', error.message);
        throw error;
    }
}

// Get address by ID
export async function getAddressById(id) {
    try {
        const response = await axios.get(`${ADDRESS_API_BASE}/api/addresses/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get address error:', error.message);
        throw error;
    }
}
