import { apiCall } from './api';

export interface Holding {
    symbol: string;
    quantity: number;
    average_cost: number;
    current_price: number;
    total_value: number;
    gain_loss: number;
    gain_loss_percent: number;
}

export interface Portfolio {
    cash_balance: number;
    total_value: number;
    holdings: Holding[];
}

export interface Transaction {
    id: string;
    symbol: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    total_amount: number;
    commission: number;
    date: string;
}

export const portfolioApi = {
    getPortfolio: async () => {
        const response = await apiCall('/api/portfolio', {
            method: 'GET',
        });
        const data = await response.json();
        return { response, data };
    },

    buyStock: async (symbol: string, quantity: number) => {
        const response = await apiCall('/api/portfolio/buy', {
            method: 'POST',
            body: JSON.stringify({ symbol, quantity }),
        });
        const data = await response.json();
        return { response, data };
    },

    sellStock: async (symbol: string, quantity: number) => {
        const response = await apiCall('/api/portfolio/sell', {
            method: 'POST',
            body: JSON.stringify({ symbol, quantity }),
        });
        const data = await response.json();
        return { response, data };
    },

    getTransactions: async (limit: number = 50) => {
        const response = await apiCall(`/api/portfolio/transactions?limit=${limit}`, {
            method: 'GET',
        });
        const data = await response.json();
        return { response, data };
    },
};
