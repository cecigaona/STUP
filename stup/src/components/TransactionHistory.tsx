"use client";

import React, { useEffect, useState } from 'react';
import { portfolioApi, Transaction } from '@/lib/portfolioApi';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { response, data } = await portfolioApi.getTransactions(20);
            if (response.ok && data.data) {
                setTransactions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-[#145147] px-6 py-4 flex justify-between items-center">
                <h2 className="text-white text-xl font-bold">Recent Transactions</h2>
                <button
                    onClick={fetchTransactions}
                    disabled={loading}
                    className="text-white hover:text-green-300 transition-colors"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <span className="text-sm">↻ Refresh</span>
                    )}
                </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {loading && transactions.length === 0 ? (
                    <div className="p-6 text-center text-gray-600">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-6 text-center text-gray-600">
                        <p>No transactions yet.</p>
                        <p className="text-sm mt-2">Start trading to see your history here!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${tx.type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {tx.type === 'buy' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.quantity} {tx.symbol}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                @ ${Number(tx.price).toFixed(2)} per share
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${tx.type === 'buy' ? 'text-red-600' : 'text-green-600'}`}>
                                            {tx.type === 'buy' ? '-' : '+'}${Number(tx.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(tx.date)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
