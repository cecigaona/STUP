"use client";

import React, { useEffect, useRef, useState } from "react";
import { Menu, X, Send } from "lucide-react";

export default function Dashboard({ userName }: { userName: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<"home" | "search" | "portfolio">("home");

  // Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; text: string; isUser: boolean }>>([
    { id: 1, text: "Lorem ipsum dolor sit amet, consectetur", isUser: false },
    { id: 2, text: "Lorem ipsum dolor sit amet, consectetur", isUser: true },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Funds modal
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [fundsAction, setFundsAction] = useState<"add" | "withdraw">("add");
  const [order, setOrder] = useState<{ stock: string; quantity: number }>({ stock: "", quantity: 1 });
  const [orderSubmitted, setOrderSubmitted] = useState<string | null>(null);

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const navigateTo = (page: "home" | "search" | "portfolio") => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const sendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages((prev) => [...prev, { id: prev.length + 1, text: chatMessage, isUser: true }]);
      setChatMessage("");
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // auto-scroll to last message
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isChatOpen, chatMessages]);

  // Funds modal helpers
  const openFundsModal = (action: "add" | "withdraw") => {
    setFundsAction(action);
    setOrder({ stock: "", quantity: 1 });
    setOrderSubmitted(null);
    setIsFundsModalOpen(true);
  };
  const closeFundsModal = () => setIsFundsModalOpen(false);
  const submitFunds = () => {
    if (!order.stock.trim() || order.quantity <= 0) {
      setOrderSubmitted("Please enter a valid stock and quantity.");
      return;
    }
    setOrderSubmitted(
      `${fundsAction === "add" ? "Added" : "Withdrew"} ${order.quantity} ${
        order.quantity === 1 ? "share" : "shares"
      } of ${order.stock}.`
    );
  };

  const stockData = [
    { name: "TechCorp", price: "$150.25", change: "+2.5%", volume: "1.2M", isPositive: true },
    { name: "Innovate Solutions", price: "$220.50", change: "-1.8%", volume: "850K", isPositive: false },
    { name: "Global Energy", price: "$85.75", change: "+0.7%", volume: "2.5M", isPositive: true },
    { name: "HealthFirst", price: "$310.00", change: "+3.2%", volume: "600K", isPositive: true },
    { name: "FinServ Group", price: "$112.80", change: "-0.5%", volume: "1.5M", isPositive: false },
  ];

  return (
    <div className="min-h-screen bg-[#F3E7D2] relative">
      {/* Burger Button */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={toggleMenu}
          className="p-2 text-[#145147] hover:bg-white/20 rounded-lg transition-all duration-200"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Slide-out Navigation */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#145147] text-white transform transition-transform duration-300 ease-in-out z-40 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 pt-20">
          <h2 className="text-2xl font-bold mb-8">STUP</h2>
          <nav className="space-y-4">
            <button
              onClick={() => navigateTo("home")}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                currentPage === "home" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              Home Page
            </button>
            <button
              onClick={() => navigateTo("search")}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                currentPage === "search" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              Search Stocks
            </button>
            <button
              onClick={() => navigateTo("portfolio")}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                currentPage === "portfolio" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              Portfolio Actions
            </button>
          </nav>
        </div>
      </div>

      {isMenuOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setIsMenuOpen(false)} />}

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[480px] bg-[#145147] rounded-2xl shadow-2xl z-[60] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-white text-lg font-semibold">Chat</h3>
            <button
              onClick={closeChat}
              className="text-white/70 hover:text-white transition-colors duration-200"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isUser
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
              <button
                onClick={sendMessage}
                className="ml-2 text-[#145147] hover:text-[#0f3d37] transition-colors duration-200"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat FAB — hidden while chat is open */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={openChat}
            className="w-12 h-12 bg-[#145147] text-white rounded-full flex items-center justify-center
                       hover:bg-[#0f3d37] transition-all duration-200 shadow-lg hover:shadow-xl
                       transform hover:scale-105"
            aria-label="Open chat"
          >
            <span className="text-sm font-bold">IA</span>
          </button>
        </div>
      )}

      {/* ----------------- Content Area ----------------- */}
      <div className="pt-20 px-6 pb-6">
        {currentPage === "home" && (
          <>
            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-[#145147] text-4xl font-bold leading-tight">
                Welcome Back,
                <br />
                {userName}
              </h1>
            </div>

            {/* Portfolio Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#145147] text-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium mb-2 opacity-90">Portfolio Value</h3>
                <div className="text-3xl font-bold mb-2">$222,222</div>
                <div className="text-green-300 text-sm">+5.5%</div>
              </div>

              <div className="bg-[#145147] text-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium mb-2 opacity-90">Total Return</h3>
                <div className="text-3xl font-bold mb-2">$222</div>
                <div className="text-green-300 text-sm">+5.5%</div>
              </div>

              <div className="bg-[#145147] text-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium mb-2 opacity-90">Invested</h3>
                <div className="text-3xl font-bold">$200,000</div>
              </div>
            </div>

            {/* Stocks Table */}
            <div className="bg-[#F3E7D2] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="bg-[#145147] px-6 py-4">
                <div className="grid grid-cols-5 gap-4 text-white font-medium">
                  <div>Stock</div>
                  <div>Price</div>
                  <div>Change</div>
                  <div>Volume</div>
                  <div>Action</div>
                </div>
              </div>

              <div className="divide-y divide-gray-300">
                {stockData.map((stock, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-white/50 transition-colors duration-200">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="text-[#145147] font-medium">{stock.name}</div>
                      <div className="text-gray-700">{stock.price}</div>
                      <div className={`font-medium ${stock.isPositive ? "text-green-400" : "text-red-400"}`}>
                        {stock.change}
                      </div>
                      <div className="text-gray-600">{stock.volume}</div>
                      <div>
                        <button className="text-gray-600 hover:text-[#145147] transition-colors duration-200 font-medium">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                  placeholder="Search for stocks"
                  className="bg-transparent text-gray-300 placeholder-gray-500 flex-1 outline-none text-lg"
                />
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="mb-6">
              <div className="bg-[#2a3a3a] rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-2">Stocks / Tech</div>
                <h1 className="text-white text-3xl font-bold mb-1">Tech Inc.</h1>
                <div className="text-gray-400">NASDAQ: TCH</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="bg-[#2a3a3a] rounded-lg p-4">
                <div className="flex space-x-8">
                  <button className="text-white font-medium border-b-2 border-white pb-2">Summary</button>
                  <button className="text-gray-400 font-medium hover:text-white transition-colors">Chart</button>
                </div>
              </div>
            </div>

            {/* Key Stats Table */}
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

            {/* Popular Stocks Section */}
            <div className="mb-8">
              <div className="bg-[#2a3a3a] rounded-lg p-6 mb-6">
                <h2 className="text-white text-xl font-bold mb-6">Popular</h2>

                <div className="grid grid-cols-5 gap-4 mb-4">
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

            {/* Your Portfolio Section */}
            <div className="bg-[#F3E7D2] rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-8">
              <div className="bg-[#2a3a3a] px-6 py-4">
                <h2 className="text-white text-xl font-bold">Your Portfolio</h2>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { name: "Tech Innovators Inc.", shares: 10, value: 1500 },
                  { name: "Global Retail Group", shares: 5, value: 750 },
                  { name: "Financial Services Corp.", shares: 20, value: 2000 },
                  { name: "Healthcare Solutions Ltd.", shares: 15, value: 2250 },
                  { name: "Energy Resources Plc.", shares: 8, value: 1200 },
                ].map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 hover:bg-white/50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-12 h-12 ${idx % 2 ? "bg-[#F3E7D2] border-2 border-[#145147]" : "bg-[#145147]"} rounded-lg mr-4 flex items-center justify-center`}
                      >
                        <div className={`w-6 h-6 ${idx % 2 ? "text-[#145147]" : "text-white"}`}>
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <div className="text-[#145147] font-medium">{p.name}</div>
                        <div className="text-gray-600 text-sm">{p.shares} shares</div>
                      </div>
                    </div>
                    <div className="text-[#145147] font-bold">${p.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => openFundsModal("withdraw")}
                className="px-8 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full text-lg font-medium
                           hover:bg-white hover:shadow-lg active:bg-gray-50
                           focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-[#F3E7D2]
                           transition-all duration-300 ease-in-out
                           shadow-md hover:shadow-xl active:shadow-sm
                           transform hover:-translate-y-0.5 active:translate-y-0
                           border border-gray-200/50"
              >
                Withdraw Funds
              </button>

              <button
                onClick={() => openFundsModal("add")}
                className="px-8 py-3 bg-[#153832] text-white rounded-full text-lg font-medium
                           hover:bg-[#0f2a26] active:bg-[#0a1f1c] 
                           focus:outline-none focus:ring-2 focus:ring-[#153832]/50 focus:ring-offset-2 focus:ring-offset-[#F3E7D2]
                           transition-all duration-300 ease-in-out
                           shadow-lg hover:shadow-xl active:shadow-md
                           transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Add Funds
              </button>
            </div>
          </>
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
                  {fundsAction === "add" ? "Add Funds" : "Withdraw Funds"}
                </h3>
                <button onClick={closeFundsModal} className="text-gray-500 hover:text-gray-700" aria-label="Close funds modal">
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Stock</label>
                  <input
                    type="text"
                    list="stock-list"
                    value={order.stock}
                    onChange={(e) => setOrder({ ...order, stock: e.target.value })}
                    placeholder="Type or choose a stock"
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#145147]/40"
                  />
                  <datalist id="stock-list">
                    {stockData.map((s) => (
                      <option key={s.name} value={s.name} />
                    ))}
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

                {orderSubmitted && (
                  <div
                    className={`text-sm px-3 py-2 rounded-lg ${
                      orderSubmitted.startsWith("Please")
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
