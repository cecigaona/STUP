"use client";

import React, { useEffect, useRef, useState } from "react";
import { Menu, X, Send, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { stocksApi, StockQuote } from "@/lib/stocksApi";
import { portfolioApi, Portfolio, Holding } from "@/lib/portfolioApi";
import TransactionHistory from "@/components/TransactionHistory";

export default function Page() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<"home" | "search" | "portfolio" | "transactions">("home");

  // Authentication
  const { user, loading, logout } = useAuth(true);
  const userName = user?.name || user?.username || user?.email?.split('@')[0] || "User";

  // ---------------- Chat ----------------
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; text: string; isUser: boolean }>>([
    { id: 1, text: "Lorem ipsum dolor sit amet, consectetur", isUser: false },
    { id: 2, text: "Lorem ipsum dolor sit amet, consectetur", isUser: true },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatMessages((prev) => [...prev, { id: prev.length + 1, text: chatMessage, isUser: true }]);
    setChatMessage("");
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };
  useEffect(() => {
    if (isChatOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isChatOpen, chatMessages]);

  // --- Drag en md+ / bottom sheet en móvil ---
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; baseX: number; baseY: number; dragging: boolean }>({
    startX: 0, startY: 0, baseX: 0, baseY: 0, dragging: false,
  });

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(min-width: 768px)");
    const upd = () => setIsDesktop(q.matches);
    upd();
    q.addEventListener("change", upd);
    return () => q.removeEventListener("change", upd);
  }, []);

  function clampToViewport(nx: number, ny: number) {
    const el = chatRef.current;
    if (!el) return { x: nx, y: ny };
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();
    const minX = -rect.left + pad + pos.x;
    const maxX = vw - rect.right - pad + pos.x;
    const minY = -rect.top + pad + pos.y;
    const maxY = vh - rect.bottom - pad + pos.y;
    return { x: Math.min(Math.max(nx, minX), maxX), y: Math.min(Math.max(ny, minY), maxY) };
  }

  function onDragStart(e: React.MouseEvent | React.TouchEvent) {
    if (!isDesktop) return;
    dragState.current.dragging = true;
    const p = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    dragState.current.startX = p.clientX;
    dragState.current.startY = p.clientY;
    dragState.current.baseX = pos.x;
    dragState.current.baseY = pos.y;
    document.body.style.userSelect = "none";
  }
  function onDragMove(e: MouseEvent | TouchEvent) {
    if (!dragState.current.dragging) return;
    const p = "touches" in e ? e.touches[0] : (e as MouseEvent);
    const dx = p.clientX - dragState.current.startX;
    const dy = p.clientY - dragState.current.startY;
    setPos(clampToViewport(dragState.current.baseX + dx, dragState.current.baseY + dy));
  }
  function onDragEnd() {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    document.body.style.userSelect = "";
  }
  useEffect(() => {
    const move = (ev: MouseEvent) => onDragMove(ev);
    const tmove = (ev: TouchEvent) => onDragMove(ev);
    const up = () => onDragEnd();
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", tmove, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", tmove);
      window.removeEventListener("touchend", up);
    };
  }, [isDesktop, pos.x, pos.y]);

  // ---------------- Funds modal ----------------
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [fundsAction, setFundsAction] = useState<"add" | "withdraw">("add");
  const [order, setOrder] = useState<{ stock: string; quantity: number }>({ stock: "", quantity: 1 });
  const [orderSubmitted, setOrderSubmitted] = useState<string | null>(null);
  const [currentStockPrice, setCurrentStockPrice] = useState<number | null>(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const openFundsModal = async (action: "add" | "withdraw", symbol?: string) => {
    setFundsAction(action);
    setOrder({ stock: symbol || "", quantity: 1 });
    setOrderSubmitted(null);
    setCurrentStockPrice(null);
    setIsFundsModalOpen(true);

    // Fetch current price if symbol is provided
    if (symbol) {
      setFetchingPrice(true);
      try {
        const { response, data } = await stocksApi.getQuote(symbol);
        if (response.ok && data.data) {
          setCurrentStockPrice(data.data.price);
        } else {
          // Use a reasonable estimate for demo purposes
          console.warn(`Using estimated price for ${symbol}`);
          const estimatedPrice = 100 + Math.random() * 400; // Random price between 100-500
          setCurrentStockPrice(Math.round(estimatedPrice * 100) / 100);
        }
      } catch (error) {
        console.error('Failed to fetch stock price:', error);
        // Use a reasonable estimate for demo purposes
        const estimatedPrice = 100 + Math.random() * 400;
        setCurrentStockPrice(Math.round(estimatedPrice * 100) / 100);
      } finally {
        setFetchingPrice(false);
      }
    }
  };
  const closeFundsModal = () => setIsFundsModalOpen(false);
  const submitFunds = async () => {
    if (!order.stock.trim() || order.quantity <= 0) {
      setOrderSubmitted("Please enter a valid stock and quantity.");
      return;
    }

    if (fundsAction === "add") {
      await handleBuyStock(order.stock, order.quantity);
    } else {
      await handleSellStock(order.stock, order.quantity);
    }

    // Close modal after 2 seconds if successful
    if (orderSubmitted && orderSubmitted.includes("Successfully")) {
      setTimeout(() => {
        closeFundsModal();
      }, 2000);
    }
  };

  // ---------------- Stock Data ----------------
  const [stockData, setStockData] = useState<StockQuote[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // ---------------- Portfolio Data ----------------
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // Fetch popular stocks and portfolio on component mount
  useEffect(() => {
    fetchPopularStocks();
    fetchPortfolio();
  }, []);

  const fetchPopularStocks = async () => {
    setStocksLoading(true);
    try {
      const { response, data } = await stocksApi.getPopularStocks();
      if (response.ok && data.data) {
        setStockData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      // Use mock data as fallback
      setStockData([
        { symbol: "AAPL", price: 150.25, change: 2.5, change_percent: "+1.7%", volume: 1200000, open: 148, high: 151, low: 147, previous_close: 147.75, latest_trading_day: "2024-01-01" },
        { symbol: "GOOGL", price: 220.50, change: -1.8, change_percent: "-0.8%", volume: 850000, open: 222, high: 223, low: 219, previous_close: 222.30, latest_trading_day: "2024-01-01" },
        { symbol: "MSFT", price: 385.75, change: 0.7, change_percent: "+0.2%", volume: 2500000, open: 385, high: 387, low: 383, previous_close: 385.05, latest_trading_day: "2024-01-01" },
      ]);
    } finally {
      setStocksLoading(false);
    }
  };

  const searchStocks = async () => {
    if (!searchQuery.trim()) return;
    try {
      const { response, data } = await stocksApi.searchStocks(searchQuery);
      if (response.ok && data.data) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K`;
    return volume.toString();
  };

  const fetchPortfolio = async () => {
    setPortfolioLoading(true);
    try {
      const { response, data } = await portfolioApi.getPortfolio();
      if (response.ok && data.data) {
        setPortfolio(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleBuyStock = async (symbol: string, quantity: number) => {
    try {
      const { response, data } = await portfolioApi.buyStock(symbol, quantity);
      if (response.ok) {
        fetchPortfolio(); // Refresh portfolio
        setOrderSubmitted(`Successfully bought ${quantity} shares of ${symbol}`);
      } else {
        if (response.status === 503) {
          setOrderSubmitted('Stock price temporarily unavailable. Please try again in a moment.');
        } else {
          setOrderSubmitted(data.error || 'Failed to buy stock. Please check your balance and try again.');
        }
      }
    } catch (error) {
      setOrderSubmitted('Connection error. Please check your internet and try again.');
    }
  };

  const handleSellStock = async (symbol: string, quantity: number) => {
    try {
      const { response, data } = await portfolioApi.sellStock(symbol, quantity);
      if (response.ok) {
        fetchPortfolio(); // Refresh portfolio
        setOrderSubmitted(`Successfully sold ${quantity} shares of ${symbol}`);
      } else {
        if (response.status === 503) {
          setOrderSubmitted('Stock price temporarily unavailable. Please try again in a moment.');
        } else {
          setOrderSubmitted(data.error || 'Failed to sell stock. Please check your holdings and try again.');
        }
      }
    } catch (error) {
      setOrderSubmitted('Connection error. Please check your internet and try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3E7D2] flex items-center justify-center">
        <div className="text-[#145147] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E7D2] relative">
      {/* Burger */}
      <div className="absolute top-6 left-6 z-50">
        <button onClick={() => setIsMenuOpen((v) => !v)} className="p-2 text-[#145147] hover:bg-white/20 rounded-lg">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#145147] text-white transform transition-transform duration-300 ease-in-out z-40 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-8 pt-20">
          <h2 className="text-2xl font-bold mb-8">STUP</h2>
          <nav className="space-y-4">
            <button
              onClick={() => {
                setCurrentPage("home");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left p-4 rounded-lg ${currentPage === "home" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              Home Page
            </button>
            <button
              onClick={() => {
                setCurrentPage("search");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left p-4 rounded-lg ${currentPage === "search" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              Search Stocks
            </button>
            <button
              onClick={() => {
                setCurrentPage("portfolio");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left p-4 rounded-lg ${currentPage === "portfolio" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              Portfolio Actions
            </button>
            <button
              onClick={() => {
                setCurrentPage("transactions");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left p-4 rounded-lg ${currentPage === "transactions" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              Transaction History
            </button>
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="w-full text-left p-4 rounded-lg hover:bg-white/10 text-red-300 hover:text-white mt-8"
            >
              Log Out
            </button>
          </nav>
        </div>
      </div>
      {isMenuOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setIsMenuOpen(false)} />}

      {/* Chat Panel (draggable en md+, bottom sheet en móvil) */}
      {isChatOpen && (
        <div
          ref={chatRef}
          className={`
            fixed z-[60] flex flex-col bg-[#145147] 
            md:w-96 md:h-[480px] md:rounded-2xl md:bottom-6 md:right-6
            w-full h-[70vh] bottom-0 inset-x-0 md:inset-auto
            shadow-2xl
          `}
          style={isDesktop ? { transform: `translate(${pos.x}px, ${pos.y}px)` } : undefined}
        >
          <div
            className="flex items-center justify-between p-4 border-b border-white/20 md:cursor-move select-none"
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
          >
            <h3 className="text-white text-lg font-semibold">Chat</h3>
            <button onClick={() => setIsChatOpen(false)} className="text-white/70 hover:text-white" aria-label="Close chat">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${message.isUser
                    ? "bg-white text-gray-800 rounded-br-md"
                    : "bg-[#F3E7D2] text-gray-800 rounded-bl-md"
                    }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/20">
            <div className="flex items-center bg-white rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Type a message ..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-gray-700 placeholder-gray-500 outline-none"
              />
              <button onClick={sendMessage} className="ml-2 text-[#145147] hover:text-[#0f3d37]" aria-label="Send message">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-12 h-12 bg-[#145147] text-white rounded-full flex items-center justify-center hover:bg-[#0f3d37] shadow-lg"
            aria-label="Open chat"
          >
            <span className="text-sm font-bold">IA</span>
          </button>
        </div>
      )}

      {/* ----------------- Content ----------------- */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-6">
        {currentPage === "home" && (
          <>
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-[#145147] text-3xl sm:text-4xl font-bold leading-tight">
                Welcome Back,
                <br />
                {userName}
              </h1>
            </div>

            {/* Portfolio Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#145147] text-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium mb-2 opacity-90 flex items-center">
                  <PieChart size={20} className="mr-2" />
                  Portfolio Value
                </h3>
                <div className="text-3xl font-bold mb-2">
                  ${portfolio?.total_value ? Number(portfolio.total_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '10,000.00'}
                </div>
                <div className={`text-sm ${portfolio && portfolio.total_value > 10000 ? 'text-green-300' : portfolio && portfolio.total_value < 10000 ? 'text-red-300' : 'text-gray-300'}`}>
                  {portfolio ? `${portfolio.total_value >= 10000 ? '+' : ''}${((portfolio.total_value - 10000) / 100).toFixed(2)}%` : '0.00%'}
                </div>
              </div>

              <div className="bg-[#145147] text-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium mb-2 opacity-90 flex items-center">
                  <DollarSign size={20} className="mr-2" />
                  Cash Balance
                </h3>
                <div className="text-3xl font-bold mb-2">
                  ${portfolio?.cash_balance ? Number(portfolio.cash_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '10,000.00'}
                </div>
                <div className="text-gray-300 text-sm">Available to invest</div>
              </div>

              <div className="bg-[#145147] text-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium mb-2 opacity-90">Holdings</h3>
                <div className="text-3xl font-bold">
                  {portfolio?.holdings?.length || 0}
                </div>
                <div className="text-gray-300 text-sm">Different stocks</div>
              </div>
            </div>

            {/* Stocks Table with Real Data */}
            <div className="bg-[#F3E7D2] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="bg-[#145147] px-6 py-4 flex justify-between items-center">
                <div className="grid grid-cols-5 gap-4 text-white font-medium flex-1">
                  <div>Symbol</div>
                  <div>Price</div>
                  <div>Change</div>
                  <div>Volume</div>
                  <div>Action</div>
                </div>
                <button
                  onClick={fetchPopularStocks}
                  disabled={stocksLoading}
                  className="text-white hover:text-green-300 transition-colors ml-4"
                >
                  {stocksLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-sm">↻ Refresh</span>
                  )}
                </button>
              </div>

              <div className="divide-y divide-gray-300">
                {stocksLoading && stockData.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-600">
                    Loading real-time stock data...
                  </div>
                ) : stockData.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-600">
                    No stock data available. Please try again later.
                  </div>
                ) : (
                  stockData.map((stock, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-white/50 transition-colors duration-200">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="text-[#145147] font-bold">{stock.symbol}</div>
                        <div className="text-gray-700">${stock.price.toFixed(2)}</div>
                        <div className={`font-medium flex items-center ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {stock.change >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                          ${Math.abs(stock.change).toFixed(2)} ({stock.change_percent})
                        </div>
                        <div className="text-gray-600">{formatVolume(stock.volume)}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openFundsModal("add", stock.symbol)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => {
                              setCurrentPage("search");
                              setSearchQuery(stock.symbol);
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {currentPage === "search" && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="bg-[#2a3a3a] rounded-lg p-4 flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for stocks (e.g., AAPL, MSFT, TSLA)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchStocks()}
                  className="bg-transparent text-gray-300 placeholder-gray-500 flex-1 outline-none text-lg"
                />
                <button
                  onClick={searchStocks}
                  className="ml-2 px-4 py-1 bg-[#145147] text-white rounded-lg hover:bg-[#0f3d37] transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-6">
                <div className="bg-[#2a3a3a] rounded-lg p-4">
                  <h3 className="text-white text-lg font-semibold mb-3">Search Results</h3>
                  <div className="space-y-2">
                    {searchResults.slice(0, 5).map((result, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div>
                          <div className="text-white font-medium">{result.symbol}</div>
                          <div className="text-gray-400 text-sm">{result.name}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-gray-300 text-sm">{result.type}</div>
                            <div className="text-gray-400 text-xs">{result.region}</div>
                          </div>
                          <button
                            onClick={() => openFundsModal("add", result.symbol)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Buy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Buy Section */}
            <div className="mb-6">
              <div className="bg-[#2a3a3a] rounded-lg p-4">
                <h3 className="text-white text-lg font-semibold mb-3">Quick Buy - Popular Stocks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stockData.slice(0, 4).map((stock) => (
                    <div key={stock.symbol} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold">{stock.symbol}</div>
                        <div className="text-gray-400 text-sm">${stock.price.toFixed(2)}</div>
                        <div className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change_percent})
                        </div>
                      </div>
                      <button
                        onClick={() => openFundsModal("add", stock.symbol)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Buy Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Stats Table (colores originales) */}
            <div className="bg-[#F3E7D2] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="bg-[#2a3a3a] px-6 py-4">
                <h2 className="text-white text-xl font-bold">Key Stats</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-gray-600 font-medium">Open</span>
                      <span className="text-[#145147] font-bold">$150.25</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-gray-600 font-medium">Low</span>
                      <span className="text-[#145147] font-bold">$149.50</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-gray-600 font-medium">Avg. Volume</span>
                      <span className="text-[#145147] font-bold">1.5M</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-medium">P/E Ratio</span>
                      <span className="text-[#145147] font-bold">25.5</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-gray-600 font-medium">High</span>
                      <span className="text-[#145147] font-bold">$152.75</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-gray-600 font-medium">Volume</span>
                      <span className="text-[#145147] font-bold">1.2M</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-gray-600 font-medium">Market Cap</span>
                      <span className="text-[#145147] font-bold">250B</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-medium">Div. Yield</span>
                      <span className="text-[#145147] font-bold">1.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {currentPage === "portfolio" && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="bg-[#2a3a3a] rounded-lg p-4 flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for stocks"
                  className="bg-transparent text-gray-300 placeholder-gray-500 flex-1 outline-none text-lg"
                />
              </div>
            </div>

            {/* Popular Stocks */}
            <div className="mb-8">
              <div className="bg-[#2a3a3a] rounded-lg p-6 mb-6">
                <h2 className="text-white text-xl font-bold mb-6">Popular</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {[
                    "Tech Innovators Inc.",
                    "Global Retail Group",
                    "Financial Services Corp.",
                    "Healthcare Solutions Ltd.",
                    "Energy Resources Plc.",
                  ].map((nm, idx) => (
                    <div key={idx} className="text-center">
                      <div
                        className={`w-20 h-20 ${idx % 2 ? "bg-[#145147]" : "bg-[#F3E7D2]"} rounded-lg mb-3 mx-auto flex items-center justify-center`}
                      >
                        <div className={`w-8 h-8 ${idx % 2 ? "text-white" : "text-[#145147]"}`}>
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-white text-sm font-medium mb-1">{nm}</div>
                      <div className={`${idx % 2 ? "text-red-400" : "text-green-400"} text-xs`}>
                        {idx % 2 ? "-1.2%" : "+2.5%"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Your Portfolio */}
            <div className="bg-[#F3E7D2] rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-8">
              <div className="bg-[#2a3a3a] px-6 py-4 flex justify-between items-center">
                <h2 className="text-white text-xl font-bold">Your Portfolio</h2>
                <button
                  onClick={fetchPortfolio}
                  disabled={portfolioLoading}
                  className="text-white hover:text-green-300 transition-colors"
                >
                  {portfolioLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-sm">↻ Refresh</span>
                  )}
                </button>
              </div>

              <div className="p-6 space-y-4">
                {portfolioLoading && !portfolio ? (
                  <div className="text-center text-gray-600 py-8">Loading portfolio...</div>
                ) : portfolio?.holdings && portfolio.holdings.length > 0 ? (
                  portfolio.holdings.map((holding, idx) => (
                    <div
                      key={holding.symbol}
                      className="flex items-center justify-between p-4 hover:bg-white/50 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex items-center flex-1">
                        <div
                          className={`w-12 h-12 ${holding.gain_loss >= 0 ? "bg-green-100 border-2 border-green-500" : "bg-red-100 border-2 border-red-500"} rounded-lg mr-4 flex items-center justify-center`}
                        >
                          <div className={`${holding.gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {holding.gain_loss >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[#145147] font-bold text-lg">{holding.symbol}</div>
                          <div className="text-gray-600 text-sm">
                            {holding.quantity} shares @ ${Number(holding.average_cost).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#145147] font-bold text-lg">
                          ${Number(holding.total_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm font-medium ${holding.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.gain_loss >= 0 ? '+' : ''}{Number(holding.gain_loss).toFixed(2)} ({Number(holding.gain_loss_percent).toFixed(2)}%)
                        </div>
                      </div>
                      <button
                        onClick={() => openFundsModal("withdraw", holding.symbol)}
                        className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-600 py-8">
                    <p>No holdings yet. Start building your portfolio!</p>
                    <button
                      onClick={() => openFundsModal("add", "")}
                      className="mt-4 px-6 py-2 bg-[#145147] text-white rounded-full hover:bg-[#0f3d37] transition-colors"
                    >
                      Buy Your First Stock
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => openFundsModal("withdraw", "")}
                className="px-8 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full text-lg font-medium hover:bg-white border border-gray-200/50"
              >
                Sell Stocks
              </button>

              <button
                onClick={() => openFundsModal("add", "")}
                className="px-8 py-3 bg-[#153832] text-white rounded-full text-lg font-medium hover:bg-[#0f2a26]"
              >
                Buy Stocks
              </button>
            </div>
          </>
        )}

        {currentPage === "transactions" && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-[#145147] text-3xl sm:text-4xl font-bold leading-tight">
                Transaction History
              </h1>
              <p className="text-gray-600 mt-2">Track all your buy and sell orders</p>
            </div>
            <TransactionHistory />
          </div>
        )}
      </div>

      {/* Funds Modal */}
      {isFundsModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[70]" onClick={closeFundsModal} />
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-[#145147]">
                  {fundsAction === "add" ? "Buy Stock" : "Sell Stock"}
                </h3>
                <button onClick={closeFundsModal} className="text-gray-500 hover:text-gray-700" aria-label="Close funds modal">
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Stock Symbol</label>
                  <input
                    type="text"
                    list="stock-list"
                    value={order.stock}
                    onChange={async (e) => {
                      const newSymbol = e.target.value.toUpperCase();
                      setOrder({ ...order, stock: newSymbol });
                      // Fetch price when symbol changes
                      if (newSymbol.length >= 1) {
                        setFetchingPrice(true);
                        setCurrentStockPrice(null);
                        try {
                          const { response, data } = await stocksApi.getQuote(newSymbol);
                          if (response.ok && data.data) {
                            setCurrentStockPrice(data.data.price);
                          } else {
                            // Use mock price if API fails
                            console.warn(`Using estimated price for ${newSymbol}`);
                            const estimatedPrice = 100 + Math.random() * 400;
                            setCurrentStockPrice(Math.round(estimatedPrice * 100) / 100);
                          }
                        } catch (error) {
                          console.error('Failed to fetch stock price:', error);
                          // Use mock price if API fails
                          const estimatedPrice = 100 + Math.random() * 400;
                          setCurrentStockPrice(Math.round(estimatedPrice * 100) / 100);
                        } finally {
                          setFetchingPrice(false);
                        }
                      }
                    }}
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#145147]/40"
                  />
                  <datalist id="stock-list">
                    {stockData.map((s) => (
                      <option key={s.symbol} value={s.symbol} />
                    ))}
                    <option value="AAPL" />
                    <option value="GOOGL" />
                    <option value="MSFT" />
                    <option value="TSLA" />
                    <option value="AMZN" />
                    <option value="META" />
                    <option value="NVDA" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Quantity (shares)</label>
                  <input
                    type="number"
                    min={1}
                    value={order.quantity}
                    onChange={(e) => setOrder({ ...order, quantity: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#145147]/40"
                  />
                </div>

                {currentStockPrice && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Current Price:</span>
                      <span className="font-medium">${currentStockPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Estimated Total:</span>
                      <span className="font-bold text-lg text-[#145147]">
                        ${(currentStockPrice * order.quantity).toFixed(2)}
                      </span>
                    </div>
                    {fundsAction === "add" && portfolio && (
                      <div className="mt-2 text-xs text-gray-500">
                        Available Cash: ${Number(portfolio.cash_balance).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
                {fetchingPrice && (
                  <div className="text-center text-gray-500 text-sm">
                    Fetching current price...
                  </div>
                )}

                {orderSubmitted && (
                  <div
                    className={`text-sm px-3 py-2 rounded-lg ${orderSubmitted.startsWith("Please")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                  >
                    {orderSubmitted}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t flex justify-end space-x-3">
                <button onClick={closeFundsModal} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancel
                </button>
                <button onClick={submitFunds} className="px-4 py-2 rounded-lg bg-[#145147] text-white hover:bg-[#0f3d37]">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
