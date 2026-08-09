/**
 * AuraSales Mock Data Engine
 * Generates and processes realistic historical sales transactions for interactive dashboards.
 */

const dataEngine = (() => {
  // Config arrays
  const categories = ['Electronics', 'Fashion', 'Home & Living', 'Fitness & Sports', 'Beauty & Care'];
  
  const products = [
    { id: 'P001', name: 'AuraBook Pro 15', category: 'Electronics', price: 1299, cost: 780 },
    { id: 'P002', name: 'SoundSync ANC Headphones', category: 'Electronics', price: 199, cost: 85 },
    { id: 'P003', name: 'Quantum Charge Wireless Pad', category: 'Electronics', price: 49, cost: 15 },
    { id: 'P004', name: 'AeroGlide Smart Watch', category: 'Electronics', price: 299, cost: 130 },
    
    { id: 'P005', name: 'Luxe Linen Blazer', category: 'Fashion', price: 120, cost: 40 },
    { id: 'P006', name: 'Stratus Comfort Sneakers', category: 'Fashion', price: 85, cost: 30 },
    { id: 'P007', name: 'Core Denim Slim Fit', category: 'Fashion', price: 65, cost: 22 },
    { id: 'P008', name: 'Voyager Anti-Theft Backpack', category: 'Fashion', price: 75, cost: 25 },
    
    { id: 'P009', name: 'Nova Glow LED Desk Lamp', category: 'Home & Living', price: 45, cost: 14 },
    { id: 'P010', name: 'Ember Ceramic Coffee Mug Set', category: 'Home & Living', price: 35, cost: 10 },
    { id: 'P011', name: 'Helix Memory Foam Pillow', category: 'Home & Living', price: 80, cost: 32 },
    { id: 'P012', name: 'Breeze Mist Ultrasonic Diffuser', category: 'Home & Living', price: 50, cost: 18 },
    
    { id: 'P013', name: 'IronPulse Adjustable Dumbbell', category: 'Fitness & Sports', price: 249, cost: 120 },
    { id: 'P014', name: 'FlexiCore Anti-Slip Yoga Mat', category: 'Fitness & Sports', price: 40, cost: 12 },
    { id: 'P015', name: 'HydroDash Insulated Flask', category: 'Fitness & Sports', price: 30, cost: 8 },
    { id: 'P016', name: 'SonicPulse Smart Jump Rope', category: 'Fitness & Sports', price: 45, cost: 15 },
    
    { id: 'P017', name: 'DermaBright Serum Duo', category: 'Beauty & Care', price: 55, cost: 14 },
    { id: 'P018', name: 'HydroBloom Nourishing Cream', category: 'Beauty & Care', price: 38, cost: 10 },
    { id: 'P019', name: 'SilkDuo Ionic Hair Dryer', category: 'Beauty & Care', price: 110, cost: 48 },
    { id: 'P020', name: 'HerbalPure Charcoal Mask Set', category: 'Beauty & Care', price: 28, cost: 6 }
  ];

  const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America'];
  const channels = ['Online', 'In-Store', 'Affiliate'];
  const segments = ['New', 'Returning'];

  // Seeded random number generator for reproducibility
  let seed = 42;
  function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function randomRange(min, max) {
    return min + random() * (max - min);
  }

  function randomChoice(arr) {
    return arr[Math.floor(random() * arr.length)];
  }

  // Generate date list over the past 12 months
  function generateTransactions() {
    const list = [];
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Number of transactions to generate
    const transactionCount = 850;

    for (let i = 0; i < transactionCount; i++) {
      // Choose date along the timeline
      const progressFraction = i / transactionCount;
      const transTime = new Date(startDate.getTime() + progressFraction * (now.getTime() - startDate.getTime()));
      
      // Seasonality adjustments (higher sales in November/December, minor boost in spring)
      const month = transTime.getMonth();
      let seasonalityMultiplier = 1.0;
      if (month === 10) seasonalityMultiplier = 1.35; // Nov (BFCM)
      if (month === 11) seasonalityMultiplier = 1.5;  // Dec (Holiday)
      if (month === 2 || month === 3) seasonalityMultiplier = 1.1; // Spring boost
      
      // Randomly adjust order volume frequency based on seasonality
      if (random() > (seasonalityMultiplier > 1.2 ? 0.95 : 0.8)) {
        // Skip some days to simulate realistic distribution, or double up
      }

      const product = randomChoice(products);
      
      // Set region preference
      let region = randomChoice(regions);
      if (product.category === 'Electronics' && random() < 0.45) region = 'North America';
      if (product.category === 'Fashion' && random() < 0.4) region = 'Europe';

      // Set sales channel
      const channel = randomChoice(channels);
      
      // Customer Segment
      const segment = random() < 0.55 ? 'New' : 'Returning';

      // Determine units sold
      let quantity = 1;
      const roll = random();
      if (product.price < 50) {
        quantity = roll < 0.5 ? 1 : (roll < 0.8 ? 2 : (roll < 0.95 ? 3 : 5));
      } else if (product.price < 200) {
        quantity = roll < 0.8 ? 1 : (roll < 0.96 ? 2 : 3);
      } else {
        quantity = roll < 0.95 ? 1 : 2;
      }

      // Add a slight variance to price (discounts)
      let price = product.price;
      const discountRoll = random();
      let hasDiscount = false;
      if (discountRoll < 0.25) {
        // Apply 5%, 10% or 15% discount
        const rate = randomChoice([0.05, 0.1, 0.15]);
        price = Math.round(price * (1 - rate));
        hasDiscount = true;
      }

      // Calculate financials
      const revenue = price * quantity;
      const cost = product.cost * quantity;
      const profit = revenue - cost;
      
      // Customer Acquisition Cost (CAC)
      // Return segment typically has near-zero CAC, new has higher
      let cac = 0;
      if (segment === 'New') {
        if (channel === 'Online') {
          cac = Math.round(randomRange(15, 35));
        } else if (channel === 'Affiliate') {
          cac = Math.round(revenue * 0.12); // Commission
        } else {
          cac = Math.round(randomRange(5, 15)); // In-Store promo
        }
      }

      list.push({
        id: `TX-${100000 + i}`,
        date: new Date(transTime),
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity: quantity,
        price: price,
        revenue: revenue,
        cost: cost,
        profit: profit,
        region: region,
        channel: channel,
        segment: segment,
        cac: cac,
        hasDiscount: hasDiscount
      });
    }

    // Sort chronologically
    return list.sort((a, b) => a.date - b.date);
  }

  // Pre-generate static default list
  const defaultTransactions = generateTransactions();
  let transactions = [...defaultTransactions];
  let dynamicCategories = [...categories];
  let dynamicRegions = [...regions];
  let dynamicChannels = [...channels];
  let dynamicProducts = [...products];

  let currentDatasetMeta = {
    isCustom: false,
    name: 'Simulated Seed Transactions',
    rowCount: transactions.length,
    uploadedAt: null
  };

  // Generate Daily Web Traffic and Conversions for Funnel Analysis
  function generateFunnelData() {
    const funnel = [];
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - 11);
    startDate.setDate(1);
    
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      const month = currentDate.getMonth();
      let baseTraffic = 1500; // Base daily visitors
      
      // Apply seasonality
      if (month === 10) baseTraffic = 2200; // Nov
      if (month === 11) baseTraffic = 2500; // Dec
      
      // Weekly seasonality (weekends have lower/higher traffic depending on shopping trends)
      const dayOfWeek = currentDate.getDay();
      let dayMult = 1.0;
      if (dayOfWeek === 0 || dayOfWeek === 6) dayMult = 1.15; // Weekend shopping spikes online

      const traffic = Math.round(randomRange(0.85, 1.15) * baseTraffic * dayMult);
      const conversionRate = randomRange(0.022, 0.038); // 2.2% to 3.8%
      const orders = Math.round(traffic * conversionRate);
      
      funnel.push({
        date: new Date(currentDate),
        traffic: traffic,
        conversionRate: conversionRate,
        orders: orders
      });

      // Increment day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return funnel;
  }

  let funnelData = generateFunnelData();

  // CSV Text Parser Utility
  function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          currentField += '"';
          i++; // skip next quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentField.trim());
        if (currentRow.some(val => val.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(val => val.length > 0)) {
        rows.push(currentRow);
      }
    }
    return rows;
  }

  // Load and Parse CSV Content
  function loadCSVData(csvText, filename = 'Uploaded Dataset.csv') {
    const rows = parseCSV(csvText);
    if (!rows || rows.length < 2) {
      throw new Error('The CSV file does not contain enough data (minimum header + 1 row required).');
    }

    const rawHeaders = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Helper to find column index with various common aliases
    const findCol = (aliases) => {
      for (let alias of aliases) {
        const idx = rawHeaders.indexOf(alias.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const colIdx = {
      id: findCol(['transaction_id', 'transactionid', 'tx_id', 'order_id', 'id', 'invoice_no']),
      date: findCol(['date', 'order_date', 'transaction_date', 'timestamp', 'time', 'datetime', 'created_at']),
      productId: findCol(['product_id', 'productid', 'item_id', 'sku', 'pid']),
      productName: findCol(['product_name', 'product', 'item', 'item_name', 'title', 'name', 'description']),
      category: findCol(['category', 'product_category', 'dept', 'department', 'type', 'group']),
      quantity: findCol(['quantity', 'qty', 'units', 'count', 'items', 'volume']),
      price: findCol(['price', 'unit_price', 'item_price', 'rate', 'unitprice', 'selling_price']),
      revenue: findCol(['revenue', 'sales', 'total', 'total_amount', 'total_revenue', 'gross_sales', 'amount']),
      cost: findCol(['cost', 'cogs', 'total_cost', 'unit_cost', 'expense', 'expenses']),
      profit: findCol(['net_profit', 'profit', 'netprofit', 'margin', 'net_income', 'gross_profit']),
      region: findCol(['region', 'country', 'market', 'location', 'territory', 'geo', 'state']),
      channel: findCol(['channel', 'sales_channel', 'source', 'medium', 'acquisition_channel', 'type']),
      segment: findCol(['customer_segment', 'segment', 'customer_type', 'user_type', 'client_type']),
      cac: findCol(['cac', 'ad_spend', 'acquisition_cost', 'cost_per_acquisition', 'marketing_cost'])
    };

    const newTransactions = [];
    const discoveredCategories = new Set();
    const discoveredRegions = new Set();
    const discoveredChannels = new Set();
    const discoveredProductsMap = {};

    const now = new Date();

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;

      const id = colIdx.id !== -1 && row[colIdx.id] ? row[colIdx.id] : `TX-${100000 + r}`;
      
      // Parse Date
      let dateVal = now;
      if (colIdx.date !== -1 && row[colIdx.date]) {
        const parsed = new Date(row[colIdx.date]);
        if (!isNaN(parsed.getTime())) {
          dateVal = parsed;
        }
      }

      // Quantity & Price
      let quantity = colIdx.quantity !== -1 && row[colIdx.quantity] ? parseFloat(row[colIdx.quantity].replace(/[^0-9.-]+/g, '')) : 1;
      if (isNaN(quantity) || quantity <= 0) quantity = 1;

      let price = colIdx.price !== -1 && row[colIdx.price] ? parseFloat(row[colIdx.price].replace(/[^0-9.-]+/g, '')) : 50;
      if (isNaN(price) || price < 0) price = 50;

      // Revenue
      let revenue = colIdx.revenue !== -1 && row[colIdx.revenue] ? parseFloat(row[colIdx.revenue].replace(/[^0-9.-]+/g, '')) : (quantity * price);
      if (isNaN(revenue)) revenue = quantity * price;

      // Cost
      let cost = colIdx.cost !== -1 && row[colIdx.cost] ? parseFloat(row[colIdx.cost].replace(/[^0-9.-]+/g, '')) : (revenue * 0.45);
      if (isNaN(cost)) cost = revenue * 0.45;

      // Net Profit
      let profit = colIdx.profit !== -1 && row[colIdx.profit] ? parseFloat(row[colIdx.profit].replace(/[^0-9.-]+/g, '')) : (revenue - cost);
      if (isNaN(profit)) profit = revenue - cost;

      // Product & Category
      const productName = colIdx.productName !== -1 && row[colIdx.productName] ? row[colIdx.productName] : 'Standard Item';
      const productId = colIdx.productId !== -1 && row[colIdx.productId] ? row[colIdx.productId] : `P${String(r).padStart(3, '0')}`;
      const category = colIdx.category !== -1 && row[colIdx.category] ? row[colIdx.category] : 'General';

      // Region & Channel & Segment
      const region = colIdx.region !== -1 && row[colIdx.region] ? row[colIdx.region] : 'Global';
      const channel = colIdx.channel !== -1 && row[colIdx.channel] ? row[colIdx.channel] : 'Direct';
      const segment = colIdx.segment !== -1 && row[colIdx.segment] ? row[colIdx.segment] : (r % 2 === 0 ? 'New' : 'Returning');

      // CAC
      let cac = colIdx.cac !== -1 && row[colIdx.cac] ? parseFloat(row[colIdx.cac].replace(/[^0-9.-]+/g, '')) : (segment === 'New' ? 20 : 0);
      if (isNaN(cac)) cac = segment === 'New' ? 20 : 0;

      discoveredCategories.add(category);
      discoveredRegions.add(region);
      discoveredChannels.add(channel);
      
      if (!discoveredProductsMap[productId]) {
        discoveredProductsMap[productId] = {
          id: productId,
          name: productName,
          category: category,
          price: price,
          cost: cost / quantity
        };
      }

      newTransactions.push({
        id,
        date: dateVal,
        productId,
        productName,
        category,
        quantity,
        price,
        revenue,
        cost,
        profit,
        region,
        channel,
        segment,
        cac,
        hasDiscount: price < (discoveredProductsMap[productId].price || price)
      });
    }

    if (newTransactions.length === 0) {
      throw new Error('No valid transaction rows could be parsed from the CSV.');
    }

    // Sort chronologically
    newTransactions.sort((a, b) => a.date - b.date);

    // Apply updates to state
    transactions = newTransactions;
    dynamicCategories = Array.from(discoveredCategories);
    dynamicRegions = Array.from(discoveredRegions);
    dynamicChannels = Array.from(discoveredChannels);
    dynamicProducts = Object.values(discoveredProductsMap);

    currentDatasetMeta = {
      isCustom: true,
      name: filename,
      rowCount: transactions.length,
      uploadedAt: new Date()
    };

    return {
      rowCount: transactions.length,
      categoriesCount: dynamicCategories.length,
      regionsCount: dynamicRegions.length,
      channelsCount: dynamicChannels.length,
      totalRevenue: transactions.reduce((acc, t) => acc + t.revenue, 0),
      dateRange: {
        start: transactions[0]?.date || now,
        end: transactions[transactions.length - 1]?.date || now
      }
    };
  }

  // Reset to default seeded transactions
  function resetToDefaultData() {
    transactions = [...defaultTransactions];
    dynamicCategories = [...categories];
    dynamicRegions = [...regions];
    dynamicChannels = [...channels];
    dynamicProducts = [...products];

    currentDatasetMeta = {
      isCustom: false,
      name: 'Simulated Seed Transactions',
      rowCount: transactions.length,
      uploadedAt: null
    };

    return {
      rowCount: transactions.length,
      name: currentDatasetMeta.name
    };
  }

  // Fetch full lists
  const getRawTransactions = () => transactions;
  const getRawFunnel = () => funnelData;
  const getDatasetMeta = () => ({ ...currentDatasetMeta });

  // Filter Transaction List
  const getFilteredData = (filters) => {
    return transactions.filter(t => {
      // Date range filter
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;

      // Category filter
      if (filters.category && filters.category !== 'All' && t.category !== filters.category) return false;

      // Region filter
      if (filters.region && filters.region !== 'All' && t.region !== filters.region) return false;

      // Channel filter
      if (filters.channel && filters.channel !== 'All' && t.channel !== filters.channel) return false;

      // Segment filter
      if (filters.segment && filters.segment !== 'All' && t.segment !== filters.segment) return false;

      return true;
    });
  };

  // Aggregate Metrics & KPIs
  const getOverviewKPIs = (filteredTrans) => {
    let revenue = 0;
    let cost = 0;
    let profit = 0;
    let unitsSold = 0;
    let totalCac = 0;
    let newCustomersCount = 0;
    const orderIds = new Set();

    filteredTrans.forEach(t => {
      revenue += t.revenue;
      cost += t.cost;
      profit += t.profit;
      unitsSold += t.quantity;
      totalCac += t.cac;
      orderIds.add(t.id);
      if (t.segment === 'New') {
        newCustomersCount++;
      }
    });

    const totalOrders = orderIds.size;
    const avgOrderValue = totalOrders > 0 ? (revenue / totalOrders) : 0;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    // Funnel integration
    let totalTraffic = 0;
    let totalWebOrders = 0;
    funnelData.forEach(f => {
      if (filteredTrans.length > 0) {
        totalTraffic += f.traffic;
        totalWebOrders += f.orders;
      }
    });

    const webConversionRate = totalTraffic > 0 ? (totalWebOrders / totalTraffic) * 100 : 2.9;
    const averageCAC = newCustomersCount > 0 ? (totalCac / newCustomersCount) : 0;

    return {
      revenue,
      cost,
      profit,
      margin,
      unitsSold,
      avgOrderValue,
      totalOrders,
      conversionRate: webConversionRate,
      averageCAC,
      cacToLtvRatio: averageCAC > 0 ? (avgOrderValue * (margin / 100) * 3) / averageCAC : 0, // simple LTV estimate
    };
  };

  // Group by Month (chronological order)
  const getMonthlyTrends = (filteredTrans) => {
    const monthsMap = {};
    
    // Initialize months in order based on transactions or raw
    filteredTrans.forEach(t => {
      const year = t.date.getFullYear();
      const monthIndex = t.date.getMonth();
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      
      if (!monthsMap[key]) {
        monthsMap[key] = {
          key: key,
          label: t.date.toLocaleString('default', { month: 'short', year: '2-digit' }),
          revenue: 0,
          cost: 0,
          profit: 0,
          units: 0,
          transactions: 0
        };
      }
      
      monthsMap[key].revenue += t.revenue;
      monthsMap[key].cost += t.cost;
      monthsMap[key].profit += t.profit;
      monthsMap[key].units += t.quantity;
      monthsMap[key].transactions += 1;
    });

    return Object.values(monthsMap).sort((a, b) => a.key.localeCompare(b.key));
  };

  // Group by Product Category
  const getCategoryDistribution = (filteredTrans) => {
    const catMap = {};
    
    // Seed with all current active categories
    dynamicCategories.forEach(c => {
      catMap[c] = { category: c, revenue: 0, profit: 0, units: 0 };
    });

    filteredTrans.forEach(t => {
      const cat = t.category || 'Other';
      if (!catMap[cat]) {
        catMap[cat] = { category: cat, revenue: 0, profit: 0, units: 0 };
      }
      catMap[cat].revenue += t.revenue;
      catMap[cat].profit += t.profit;
      catMap[cat].units += t.quantity;
    });

    return Object.values(catMap).sort((a, b) => b.revenue - a.revenue);
  };

  // Group by Region
  const getRegionalPerformance = (filteredTrans) => {
    const regMap = {};
    
    dynamicRegions.forEach(r => {
      regMap[r] = { region: r, revenue: 0, profit: 0, units: 0 };
    });

    filteredTrans.forEach(t => {
      const reg = t.region || 'Other';
      if (!regMap[reg]) {
        regMap[reg] = { region: reg, revenue: 0, profit: 0, units: 0 };
      }
      regMap[reg].revenue += t.revenue;
      regMap[reg].profit += t.profit;
      regMap[reg].units += t.quantity;
    });

    return Object.values(regMap).sort((a, b) => b.revenue - a.revenue);
  };

  // Group by Acquisition Channel
  const getChannelDistribution = (filteredTrans) => {
    const chanMap = {};
    
    dynamicChannels.forEach(ch => {
      chanMap[ch] = { channel: ch, revenue: 0, units: 0, count: 0 };
    });

    filteredTrans.forEach(t => {
      const ch = t.channel || 'Direct';
      if (!chanMap[ch]) {
        chanMap[ch] = { channel: ch, revenue: 0, units: 0, count: 0 };
      }
      chanMap[ch].revenue += t.revenue;
      chanMap[ch].units += t.quantity;
      chanMap[ch].count += 1;
    });

    return Object.values(chanMap);
  };

  // Top Products
  const getTopProducts = (filteredTrans, limit = 5) => {
    const prodMap = {};
    filteredTrans.forEach(t => {
      const pId = t.productId || t.productName;
      if (!prodMap[pId]) {
        prodMap[pId] = {
          id: pId,
          name: t.productName,
          category: t.category,
          revenue: 0,
          profit: 0,
          units: 0,
          margin: 0
        };
      }
      prodMap[pId].revenue += t.revenue;
      prodMap[pId].profit += t.profit;
      prodMap[pId].units += t.quantity;
    });

    return Object.values(prodMap)
      .map(p => {
        p.margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
        return p;
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  };

  return {
    getRawTransactions,
    getRawFunnel,
    getFilteredData,
    getOverviewKPIs,
    getMonthlyTrends,
    getCategoryDistribution,
    getRegionalPerformance,
    getChannelDistribution,
    getTopProducts,
    loadCSVData,
    resetToDefaultData,
    getDatasetMeta,
    parseCSV,
    get categories() { return dynamicCategories; },
    get regions() { return dynamicRegions; },
    get channels() { return dynamicChannels; },
    get segments() { return segments; },
    get products() { return dynamicProducts; }
  };
})();

// Export global variable so it's accessible by index.html/app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dataEngine;
} else {
  window.dataEngine = dataEngine;
}
