import { apiCall } from './api';

export interface StockQuote {
    symbol: string;
    price: number;
    change: number;
    change_percent: string;
    volume: number;
    open: number;
    high: number;
    low: number;
    previous_close: number;
    latest_trading_day: string;
}

export interface StockSearchResult {
    symbol: string;
    name: string;
    type: string;
    region: string;
    currency: string;
}

export interface IntradayData {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface MarketMovers {
    top_gainers: Array<{
        ticker: string;
        price: number;
        change_amount: number;
        change_percentage: string;
        volume: number;
    }>;
    top_losers: Array<{
        ticker: string;
        price: number;
        change_amount: number;
        change_percentage: string;
        volume: number;
    }>;
    most_active: Array<{
        ticker: string;
        price: number;
        change_amount: number;
        change_percentage: string;
        volume: number;
    }>;
}

export const stocksApi = {
    getQuote: async (symbol: string) => {
        const response = await apiCall(`/api/stocks/quote/${symbol}`, {
            method: 'GET',
        });
        const data = await response.json();
        return { response, data };
    },

    searchStocks: async (query: string) => {
        const response = await apiCall(`/api/stocks/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
        });
        const data = await response.json();
        return { response, data };
    },

    getIntraday: async (symbol: string, interval: string = '5min') => {
        const response = await apiCall(`/api/stocks/intraday/${symbol}?interval=${interval}`, {
            method: 'GET',
        });
        const data = await response.json();
        return { response, data };
    },

    getMarketMovers: async () => {
        const response = await apiCall('/api/stocks/market-movers', {
            method: 'GET',
        });
        const data = await response.json();
        return { response, data };
    },

    getPopularStocks: async () => {
        const response = await apiCall('/api/stocks/popular', {
            method: 'GET',
        });
        const data = await response.json();
        return { response, data };
    },
};
