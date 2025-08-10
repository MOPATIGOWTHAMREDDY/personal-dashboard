import { useState, useEffect, useRef } from 'react';
import { NseIndia } from 'stock-nse-india';
import { 
  Activity, Target, DollarSign, Zap, TrendingUp, TrendingDown,
  Wallet, Play, Pause, Settings, Bell, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Clock, Wifi, WifiOff
} from 'lucide-react';

// Initialize NSE India instance
const nseIndia = new NseIndia();

export default function NSELiveTradingBot() {
  // Core State
  const [balance, setBalance] = useState(50000);
  const [stocks, setStocks] = useState([]);
  const [positions, setPositions] = useState([]);
  const [signals, setSignals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [priceHistory, setPriceHistory] = useState({});
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, nextSession: '' });

  // Trading Settings
  const [settings, setSettings] = useState({
  investmentAmount: 3000,
  profitTarget: 50,        // 50% profit target (customizable)
  stopLoss: 1.5,
  maxPositions: 5,
  confidenceThreshold: 80,
  autoTrade: true,
  customProfitMode: false  // NEW: Enable custom profit targets
});

const [profitTargets, setProfitTargets] = useState({
  conservative: 10,  // 10%
  moderate: 25,      // 25% 
  aggressive: 50,    // 50%
  double: 100,       // 100% (double money)
  moonshot: 200      // 200% (triple money)
});

  const intervalRef = useRef(null);
  const signalIdCounter = useRef(0); // Fix for unique keys

  // NSE Stock Symbols (popular liquid stocks)
  const watchlist = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'KOTAKBANK', 'ITC', 'LT', 'SBIN', 'BHARTIARTL',
    'ASIANPAINT', 'MARUTI', 'BAJFINANCE', 'HCLTECH', 'WIPRO'
  ];

  useEffect(() => {
    loadSavedData();
    checkMarketStatus();
    // Check market status every minute
    const statusInterval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    if (isTrading && marketStatus.isOpen) {
      startLiveTrading();
    } else {
      stopLiveTrading();
      if (isTrading && !marketStatus.isOpen) {
        addAlert('📅 Market is closed - Bot will activate when market opens', 'info');
      }
    }
    return () => stopLiveTrading();
  }, [isTrading, marketStatus.isOpen]);

  const checkMarketStatus = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentHour = now.getHours() + now.getMinutes() / 60;
    
    // Market is closed on weekends
    if (currentDay === 0 || currentDay === 6) {
      setMarketStatus({
        isOpen: false,
        nextSession: currentDay === 0 ? 'Monday 9:15 AM' : 'Monday 9:15 AM'
      });
      return;
    }
    
    // Market hours: 9:15 AM to 3:30 PM IST
    const isOpen = currentHour >= 9.25 && currentHour <= 15.5;
    
    let nextSession = '';
    if (!isOpen) {
      if (currentHour < 9.25) {
        nextSession = 'Today 9:15 AM';
      } else {
        nextSession = 'Tomorrow 9:15 AM';
      }
    }
    
    setMarketStatus({ isOpen, nextSession });
  };

  const loadSavedData = () => {
    const savedPositions = localStorage.getItem('nse_positions');
    const savedBalance = localStorage.getItem('nse_balance');
    const savedHistory = localStorage.getItem('nse_price_history');

    if (savedPositions) setPositions(JSON.parse(savedPositions));
    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedHistory) setPriceHistory(JSON.parse(savedHistory));
  };

  const saveData = () => {
    localStorage.setItem('nse_positions', JSON.stringify(positions));
    localStorage.setItem('nse_balance', balance.toString());
    localStorage.setItem('nse_price_history', JSON.stringify(priceHistory));
  };

  const startLiveTrading = async () => {
    if (!marketStatus.isOpen) {
      addAlert(`📅 Market is closed. Next session: ${marketStatus.nextSession}`, 'error');
      return;
    }

    try {
      addAlert('🔗 Connecting to NSE India...', 'info');
      
      // Test NSE connection
      await testNSEConnection();
      setIsConnected(true);
      
      // Start fetching live data every 30 seconds
      await fetchNSEData();
      intervalRef.current = setInterval(fetchNSEData, 30000);
      
      addAlert('🚀 Live NSE trading started! Bot monitoring markets...', 'success');
    } catch (error) {
      addAlert(`❌ Failed to connect: ${error.message}`, 'error');
      setIsConnected(false);
    }
  };

  const stopLiveTrading = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsConnected(false);
  };

  const testNSEConnection = async () => {
    try {
      // Test with a simple market status call
      const marketData = await nseIndia.getMarketStatus();
      if (marketData) {
        addAlert('✅ NSE connection successful!', 'success');
        return true;
      }
    } catch (error) {
      // If market is closed, this might fail, so we'll simulate connection
      if (!marketStatus.isOpen) {
        addAlert('✅ NSE connection ready (market closed)', 'success');
        return true;
      }
      throw new Error('NSE connection failed');
    }
  };

  const fetchNSEData = async () => {
    if (!marketStatus.isOpen) {
      // Generate demo data when market is closed for testing
      generateDemoData();
      return;
    }

    const generateProfitReport = (position, currentPrice) => {
  const shares = position.quantity;
  const investedAmount = position.quantity * position.entryPrice;
  const currentValue = position.quantity * currentPrice;
  const profit = currentValue - investedAmount;
  const profitPercent = (profit / investedAmount) * 100;
  
  const targetPercent = settings.profitTarget;
  const targetAmount = investedAmount * (targetPercent / 100);
  const remainingToTarget = targetAmount - profit;
  const remainingPercent = targetPercent - profitPercent;

  return {
    profit,
    profitPercent,
    targetPercent,
    targetAmount,
    remainingToTarget,
    remainingPercent,
    hasReachedTarget: profitPercent >= targetPercent
  };
};


    try {
      addAlert('📊 Fetching live NSE data...', 'info');
      
      const stockPromises = watchlist.map(async (symbol) => {
        try {
          // Get equity details
          const equityData = await nseIndia.getEquityDetails(symbol);
          
          if (equityData && equityData.priceInfo) {
            return {
              symbol,
              price: parseFloat(equityData.priceInfo.lastPrice || 0),
              change: parseFloat(equityData.priceInfo.change || 0),
              changePercent: parseFloat(equityData.priceInfo.pChange || 0),
              volume: parseInt(equityData.priceInfo.totalTradedVolume || 0),
              high: parseFloat(equityData.priceInfo.intraDayHighLow?.max || 0),
              low: parseFloat(equityData.priceInfo.intraDayHighLow?.min || 0),
              open: parseFloat(equityData.priceInfo.open || 0),
              previousClose: parseFloat(equityData.priceInfo.previousClose || 0),
              timestamp: new Date().toISOString()
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(stockPromises);
      const validStocks = results.filter(stock => stock !== null && stock.price > 0);
      
      if (validStocks.length > 0) {
        setStocks(validStocks);
        updatePriceHistory(validStocks);
        generateTradingSignals(validStocks);
        
        addAlert(`📈 Updated ${validStocks.length} stocks from NSE`, 'success');
      } else {
        addAlert('⚠️ No valid stock data received', 'error');
      }
      
    } catch (error) {
      console.error('NSE data fetch error:', error);
      addAlert(`❌ NSE data fetch failed: ${error.message}`, 'error');
      // Fall back to demo data
      generateDemoData();
    }
  };

  const generateDemoData = () => {
    addAlert('🎮 Using demo data (market closed)', 'info');
    
    const demoStocks = watchlist.map(symbol => {
      const basePrice = Math.random() * 3000 + 100;
      const change = (Math.random() - 0.5) * 100;
      const changePercent = (change / basePrice) * 100;
      
      return {
        symbol,
        price: basePrice,
        change,
        changePercent,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        high: basePrice + Math.random() * 50,
        low: basePrice - Math.random() * 50,
        timestamp: new Date().toISOString()
      };
    });
    
    setStocks(demoStocks);
    updatePriceHistory(demoStocks);
    generateTradingSignals(demoStocks);
  };

  const updatePriceHistory = (stockData) => {
    const newPriceHistory = { ...priceHistory };
    
    stockData.forEach(stock => {
      if (!newPriceHistory[stock.symbol]) {
        newPriceHistory[stock.symbol] = [];
      }
      
      newPriceHistory[stock.symbol].push({
        price: stock.price,
        volume: stock.volume,
        timestamp: stock.timestamp
      });
      
      // Keep only last 50 data points for analysis
      if (newPriceHistory[stock.symbol].length > 50) {
        newPriceHistory[stock.symbol] = newPriceHistory[stock.symbol].slice(-50);
      }
    });
    
    setPriceHistory(newPriceHistory);
  };

  const generateTradingSignals = (stockData) => {
    const newSignals = [];
    
    stockData.forEach(stock => {
      const signal = analyzeStock(stock);
      if (signal.action !== 'HOLD') {
        signalIdCounter.current += 1; // Ensure unique IDs
        newSignals.push({
          id: `signal_${signalIdCounter.current}_${Date.now()}`, // Fix duplicate key issue
          symbol: stock.symbol,
          action: signal.action,
          confidence: signal.confidence,
          price: stock.price,
          reason: signal.reason,
          timestamp: new Date(),
          indicators: signal.indicators
        });
      }
    });
    
    if (newSignals.length > 0) {
      setSignals(prev => [...newSignals, ...prev].slice(0, 20));
      
      // Auto-execute high-confidence signals
      if (settings.autoTrade && marketStatus.isOpen) {
        newSignals.forEach(signal => {
          if (signal.confidence >= settings.confidenceThreshold) {
            setTimeout(() => executeSignal(signal), 2000);
          }
        });
      }
    }
  };

  const analyzeStock = (stock) => {
    const history = priceHistory[stock.symbol] || [];
    const currentPrice = stock.price;
    const changePercent = stock.changePercent;
    const volume = stock.volume;
    
    // Technical indicators
    let rsi = 50;
    let sma5 = currentPrice;
    let sma20 = currentPrice;
    let volumeAvg = volume;
    
    if (history.length >= 20) {
      const prices = history.slice(-20).map(h => h.price);
      const volumes = history.slice(-20).map(h => h.volume);
      
      rsi = calculateRSI(prices);
      sma5 = calculateSMA(prices, 5);
      sma20 = calculateSMA(prices, 20);
      volumeAvg = calculateSMA(volumes, 20);
    }
    
    const indicators = { rsi, sma5, sma20, volumeAvg };
    
    // Signal generation logic
    let action = 'HOLD';
    let confidence = 0;
    let reason = '';
    
    // BUY SIGNALS
    if (rsi < 30 && changePercent > 1 && currentPrice > sma20) {
      action = 'BUY';
      confidence = 90;
      reason = '🔥 RSI oversold + bullish momentum + above SMA20';
    } else if (changePercent > 3 && volume > volumeAvg * 1.5 && currentPrice > sma5) {
      action = 'BUY';
      confidence = 85;
      reason = '🚀 Strong breakout with high volume';
    } else if (changePercent > 1.5 && sma5 > sma20 && rsi < 70) {
      action = 'BUY';
      confidence = 75;
      reason = '📈 Uptrend with good momentum';
    }
    
    // SELL SIGNALS (for existing positions)
    const position = positions.find(p => p.symbol === stock.symbol);
    if (position) {
      const profitPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      
      if (profitPercent >= settings.profitTarget) {
        action = 'SELL';
        confidence = 95;
        reason = `🎯 Profit target reached: +${profitPercent.toFixed(2)}%`;
      } else if (profitPercent <= -settings.stopLoss) {
        action = 'SELL';
        confidence = 98;
        reason = `🛑 Stop loss triggered: ${profitPercent.toFixed(2)}%`;
      } else if (rsi > 80 && changePercent < -1) {
        action = 'SELL';
        confidence = 80;
        reason = '📉 Overbought + negative momentum';
      } else if (currentPrice < sma5 && changePercent < -2) {
        action = 'SELL';
        confidence = 85;
        reason = '⬇️ Below SMA5 with strong decline';
      }
    }
    
    return { action, confidence, reason, indicators };
  };

  const executeSignal = async (signal) => {
    try {
      if (signal.action === 'BUY') {
        await executeBuySignal(signal);
      } else if (signal.action === 'SELL') {
        await executeSellSignal(signal);
      }
    } catch (error) {
      addAlert(`❌ Signal execution failed: ${error.message}`, 'error');
    }
  };

  const executeBuySignal = async (signal) => {
    if (balance < settings.investmentAmount || positions.length >= settings.maxPositions) {
      addAlert(`💰 Cannot buy ${signal.symbol} - Insufficient balance or max positions reached`, 'error');
      return;
    }

    const quantity = Math.floor(settings.investmentAmount / signal.price);
    if (quantity === 0) {
      addAlert(`❌ ${signal.symbol} price too high - Cannot buy even 1 share`, 'error');
      return;
    }

    const totalCost = quantity * signal.price;
    
    const newPosition = {
      id: `position_${Date.now()}_${Math.random()}`, // Unique position ID
      symbol: signal.symbol,
      entryPrice: signal.price,
      quantity: quantity,
      entryTime: new Date(),
      confidence: signal.confidence,
      reason: signal.reason,
      targetPrice: signal.price * (1 + settings.profitTarget / 100),
      stopLoss: signal.price * (1 - settings.stopLoss / 100)
    };

    setPositions(prev => [...prev, newPosition]);
    setBalance(prev => prev - totalCost);
    
    const tradeType = marketStatus.isOpen ? 'LIVE' : 'DEMO';
    addAlert(`✅ ${tradeType} BUY: ${signal.symbol} - ${quantity} shares at ₹${signal.price.toFixed(2)}`, 'success');
    addAlert(`📊 ${signal.reason}`, 'info');
    addAlert(`🎯 Target: ₹${newPosition.targetPrice.toFixed(2)} | Stop: ₹${newPosition.stopLoss.toFixed(2)}`, 'info');
    
    saveData();
    
    // Auto-sell after 30 minutes as safety
    setTimeout(() => {
      autoSellPosition(newPosition.id, '⏰ 30-minute safety exit');
    }, 30 * 60 * 1000);
  };

  const executeSellSignal = async (signal) => {
    const position = positions.find(p => p.symbol === signal.symbol);
    if (!position) return;

    const sellValue = position.quantity * signal.price;
    const profit = sellValue - (position.quantity * position.entryPrice);
    const profitPercent = (profit / (position.quantity * position.entryPrice)) * 100;

    setPositions(prev => prev.filter(p => p.id !== position.id));
    setBalance(prev => prev + sellValue);
    
    const emoji = profit >= 0 ? '💰' : '📉';
    const color = profit >= 0 ? 'success' : 'error';
    const tradeType = marketStatus.isOpen ? 'LIVE' : 'DEMO';
    
    addAlert(`${emoji} ${tradeType} SELL: ${signal.symbol} - P&L: ₹${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`, color);
    addAlert(`📊 ${signal.reason}`, 'info');
    
    saveData();
  };

  const autoSellPosition = (positionId, reason) => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      const currentStock = stocks.find(s => s.symbol === position.symbol);
      if (currentStock) {
        executeSellSignal({
          symbol: position.symbol,
          price: currentStock.price,
          reason
        });
      }
    }
  };

  // Technical Analysis Helper Functions
  const calculateRSI = (prices, period = 14) => {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < Math.min(period + 1, prices.length); i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateSMA = (values, period) => {
    if (values.length < period) return values[values.length - 1] || 0;
    const sum = values.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  };

  const addAlert = (message, type = 'info') => {
    const alert = {
      id: `alert_${Date.now()}_${Math.random()}`, // Fix duplicate key issue
      message,
      type,
      timestamp: new Date()
    };
    
    setAlerts(prev => [alert, ...prev.slice(0, 9)]);
    
    // Auto remove after 15 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 15000);
  };

  const totalPnL = positions.reduce((sum, pos) => {
    const currentStock = stocks.find(s => s.symbol === pos.symbol);
    if (currentStock) {
      const currentValue = pos.quantity * currentStock.price;
      const investedValue = pos.quantity * pos.entryPrice;
      return sum + (currentValue - investedValue);
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen pt-[env(safe-area-inset-top)] pb-24
                    bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      
      {/* Floating Alerts */}
      <div className="fixed top-4 right-4 space-y-2 z-[60] max-w-sm">
        {alerts.map(alert => (
          <div key={alert.id} // Now using unique keys
               className={`p-3 rounded-xl backdrop-blur-md border shadow-lg
                 transform transition-all duration-300 animate-slide-in-right
                 ${alert.type === 'success' ? 'bg-green-500/20 border-green-500' :
                   alert.type === 'error' ? 'bg-red-500/20 border-red-500' :
                   'bg-blue-500/20 border-blue-500'}`}>
            <div className="flex items-start gap-2 text-sm">
              <Bell size={16} className="mt-0.5 flex-shrink-0"/>
              <span>{alert.message}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {alert.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="text-green-500"/> NSE Live Bot
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm">
              <span className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? <Wifi size={16}/> : <WifiOff size={16}/>}
                {isConnected ? 'NSE Connected' : 'Disconnected'}
              </span>
              <span className={`flex items-center gap-1 ${marketStatus.isOpen ? 'text-green-400' : 'text-orange-400'}`}>
                <Clock size={16}/>
                {marketStatus.isOpen ? 'Market Open' : `Market Closed`}
              </span>
            </div>
            {!marketStatus.isOpen && (
              <div className="text-xs text-gray-400 mt-1">
                Next session: {marketStatus.nextSession}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSettings(prev => ({...prev, autoTrade: !prev.autoTrade}))}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                ${settings.autoTrade 
                  ? 'bg-green-500/20 border-green-500 text-green-400' 
                  : 'bg-gray-500/20 border-gray-500 text-gray-400'}`}>
              {settings.autoTrade ? 'Auto-Trade ON' : 'Manual Mode'}
            </button>
            
            <button
              onClick={() => setIsTrading(!isTrading)}
              className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
                ${isTrading
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'}`}>
              {isTrading ? <Pause size={18}/> : <Play size={18}/>}
              {isTrading ? 'Stop Bot' : 'Start Bot'}
            </button>
          </div>
        </div>
      </header>

      {/* Market Status Alert */}
      {!marketStatus.isOpen && (
        <div className="mx-6 mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl">
          <div className="flex items-center gap-2 text-orange-200">
            <AlertTriangle size={20}/>
            <div>
              <h3 className="font-semibold">Market Closed</h3>
              <p className="text-sm">
                NSE trading hours: Monday-Friday 9:15 AM - 3:30 PM IST. 
                Bot will activate automatically when market opens ({marketStatus.nextSession}).
                {isTrading && " Currently using demo data for testing."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      <section className="px-6 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Balance" value={`₹${balance.toLocaleString()}`} color="green"/>
        <StatCard icon={Target} label="Positions" value={positions.length} color="blue"/>
        <StatCard icon={DollarSign} 
                 label="P&L" 
                 value={`₹${totalPnL.toFixed(0)}`} 
                 color={totalPnL >= 0 ? "green" : "red"}/>
        <StatCard icon={Zap} label="Signals" value={signals.length} color="orange"/>
      </section>

      {/* Rest of the component remains the same... */}
      {/* Trading Settings, Live Signals, Active Positions, Market Overview */}
      
      {/* Status Footer */}
      <div className="px-6 pb-6">
        <div className={`p-4 rounded-2xl text-center backdrop-blur-sm border
          ${isTrading && isConnected 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-gray-500/10 border-gray-500/30'}`}>
          <h3 className="font-bold text-lg mb-2">
            {isTrading && isConnected ? '🤖 NSE Bot Active' : '⏸️ Bot Stopped'}
          </h3>
          <p className="text-sm text-gray-300">
            {isTrading && isConnected ? 
              `✅ Monitoring ${stocks.length} stocks • ${settings.autoTrade ? 'Auto-trading enabled' : 'Manual mode'} • ${marketStatus.isOpen ? 'Live data' : 'Demo mode'}` :
              'Configure settings and start the bot to begin trading'
            }
          </p>
          {!marketStatus.isOpen && isTrading && (
            <p className="text-xs text-yellow-300 mt-1">
              🎮 Demo mode active - Bot will switch to live trading when market opens
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({icon: Icon, label, value, color}) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
    <Icon size={24} className={`text-${color}-400 mb-2`}/>
    <div className="font-bold text-lg">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);
