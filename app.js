/**
 * AuraSales Dashboard Controller
 * Handles chart initialization, event handlers, tab routing, transactional search, 
 * scenario planner forecasting, and custom metric alert guardrails.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
  const state = {
    activeTab: 'dashboard',
    timeframe: 'all',
    filters: {
      startDate: null,
      endDate: null,
      category: 'All',
      region: 'All',
      channel: 'All',
      segment: 'All'
    },
    explorer: {
      searchTerm: '',
      sortColumn: 'date',
      sortDirection: 'desc',
      page: 1,
      pageSize: 12
    },
    planner: {
      marketing: 1.0,
      pricing: 0,
      cro: 0
    },
    alerts: [
      {
        id: 'A1',
        title: 'High CAC Channel Alert',
        description: 'Online acquisition channel in Europe is showing a Customer Acquisition Cost (CAC) of $35, which exceeds our baseline target by 28%. Consider optimizing ad placement.',
        severity: 'warning-status',
        timestamp: new Date(Date.now() - 3600000 * 3), // 3 hours ago
        systemRule: true
      },
      {
        id: 'A2',
        title: 'Electronics Profit Margin Alert',
        description: 'Gross Profit Margin on "AuraBook Pro 15" sales in Asia-Pacific has compressed to 39.9% due to holiday shipping markdowns. Target margin is 45%.',
        severity: 'critical',
        timestamp: new Date(Date.now() - 3600000 * 8), // 8 hours ago
        systemRule: true
      },
      {
        id: 'A3',
        title: 'Conversion Optimization Opportunity',
        description: 'Web conversion rate bumped up by 0.4% following the checkout simplification trial. Recommend scaling the new layout to 100% of traffic.',
        severity: 'info',
        timestamp: new Date(Date.now() - 3600000 * 24), // 1 day ago
        systemRule: true
      }
    ],
    customRules: [
      {
        id: 'R1',
        metric: 'revenue_min',
        metricLabel: 'Monthly Revenue Floor',
        value: 15000,
        severity: 'critical',
        description: 'Alert if monthly revenue dips below $15,000'
      },
      {
        id: 'R2',
        metric: 'cac_max',
        metricLabel: 'Maximum Allowed CAC',
        value: 30,
        severity: 'warning-status',
        description: 'Alert if new customer acquisition cost exceeds $30'
      }
    ]
  };

  // ApexCharts Instances References
  const charts = {
    revenueTrend: null,
    categoryPie: null,
    regionalBar: null,
    channelDonut: null,
    plannerForecast: null
  };

  // Setup DOM Element References
  const elements = {
    timeframeSelect: document.getElementById('global-timeframe'),
    btnRefresh: document.getElementById('btn-refresh'),
    tabItems: document.querySelectorAll('.sidebar-menu .menu-item'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    tabTitle: document.getElementById('current-tab-title'),
    tabSubtitle: document.getElementById('current-tab-subtitle'),
    
    // KPIs
    kpiRevenue: document.getElementById('kpi-revenue'),
    trendRevenue: document.getElementById('trend-revenue'),
    kpiUnits: document.getElementById('kpi-units'),
    trendUnits: document.getElementById('trend-units'),
    kpiProfit: document.getElementById('kpi-profit'),
    kpiMargin: document.getElementById('kpi-margin'),
    trendProfit: document.getElementById('trend-profit'),
    kpiConversion: document.getElementById('kpi-conversion'),
    trendConversion: document.getElementById('trend-conversion'),

    // Top Products
    topProductsBody: document.querySelector('#top-products-table tbody'),

    // Explorer Filters
    explorerSearch: document.getElementById('explorer-search'),
    explorerCategory: document.getElementById('explorer-filter-category'),
    explorerRegion: document.getElementById('explorer-filter-region'),
    explorerChannel: document.getElementById('explorer-filter-channel'),
    explorerSegment: document.getElementById('explorer-filter-segment'),
    explorerReset: document.getElementById('explorer-reset'),
    explorerExport: document.getElementById('explorer-export'),
    transactionTableBody: document.querySelector('#transaction-table tbody'),
    transactionHeaders: document.querySelectorAll('#transaction-table th'),
    
    // Explorer Pagination
    paginationSummary: document.getElementById('explorer-pagination-summary'),
    paginationPrev: document.getElementById('explorer-prev'),
    paginationNext: document.getElementById('explorer-next'),

    // Planner Sliders
    sliderMarketing: document.getElementById('slider-marketing'),
    valMarketing: document.getElementById('val-marketing'),
    sliderPricing: document.getElementById('slider-pricing'),
    valPricing: document.getElementById('val-pricing'),
    sliderCro: document.getElementById('slider-cro'),
    valCro: document.getElementById('val-cro'),
    plannerResetSliders: document.getElementById('planner-reset-sliders'),
    
    // Planner Dynamic KPIs
    planValRevenue: document.getElementById('plan-val-revenue'),
    planDiffRevenue: document.getElementById('plan-diff-revenue'),
    planValProfit: document.getElementById('plan-val-profit'),
    planDiffProfit: document.getElementById('plan-diff-profit'),
    planValCac: document.getElementById('plan-val-cac'),
    planDiffCac: document.getElementById('plan-diff-cac'),
    plannerModelSummary: document.getElementById('planner-model-summary'),

    // Alerts Panel
    alertsContainer: document.getElementById('system-alerts-container'),
    alertsCountBadge: document.getElementById('active-alert-dot'),
    ruleForm: document.getElementById('rule-config-form'),
    activeRulesContainer: document.getElementById('active-guardrails-list'),
    btnClearAlerts: document.getElementById('btn-clear-alerts')
  };

  // --------------------------------------------------------
  // 1. Initializers & Routings
  // --------------------------------------------------------
  function init() {
    lucide.createIcons();
    initFilters();
    updateDateFilters();
    
    // Load lists & charts
    renderDashboard();
    renderExplorer();
    renderPlanner();
    renderAlerts();
    renderRules();
    checkRulesAndGenerateAlerts();

    // Event Bindings
    elements.timeframeSelect.addEventListener('change', handleTimeframeChange);
    elements.btnRefresh.addEventListener('click', handleRefreshData);
    
    // Sidebar Tabs
    elements.tabItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Explorer Filter Bindings
    elements.explorerSearch.addEventListener('input', debounce(handleExplorerSearch, 300));
    elements.explorerCategory.addEventListener('change', handleExplorerFilterChange);
    elements.explorerRegion.addEventListener('change', handleExplorerFilterChange);
    elements.explorerChannel.addEventListener('change', handleExplorerFilterChange);
    elements.explorerSegment.addEventListener('change', handleExplorerFilterChange);
    elements.explorerReset.addEventListener('click', resetExplorerFilters);
    elements.explorerExport.addEventListener('click', exportExplorerCSV);
    
    // Sort table columns
    elements.transactionHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const column = th.getAttribute('data-sort');
        if (column) handleExplorerSort(column);
      });
    });

    // Pagination
    elements.paginationPrev.addEventListener('click', () => changeExplorerPage(-1));
    elements.paginationNext.addEventListener('click', () => changeExplorerPage(1));

    // Planner Sliders Bindings
    elements.sliderMarketing.addEventListener('input', handlePlannerSliderChange);
    elements.sliderPricing.addEventListener('input', handlePlannerSliderChange);
    elements.sliderCro.addEventListener('input', handlePlannerSliderChange);
    elements.plannerResetSliders.addEventListener('click', resetPlannerSliders);

    // Rule Config Form
    elements.ruleForm.addEventListener('submit', handleAddRule);
    elements.btnClearAlerts.addEventListener('click', dismissAllAlerts);
  }

  // Populate dynamic category, region, channel options
  function initFilters() {
    // Populate Category selects
    const cats = window.dataEngine.categories;
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      elements.explorerCategory.appendChild(opt);
    });

    // Populate Regions
    const regs = window.dataEngine.regions;
    regs.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      elements.explorerRegion.appendChild(opt);
    });

    // Populate Channels
    const chans = window.dataEngine.channels;
    chans.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = ch;
      elements.explorerChannel.appendChild(opt);
    });
  }

  // Switch Active Tab Panel
  function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Update active tab buttons and panels
    elements.tabItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    elements.tabPanels.forEach(panel => {
      if (panel.id === `panel-${tabId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Header Content
    let title = 'Sales Overview';
    let subtitle = 'Real-time performance metrics and business health insights.';
    if (tabId === 'explorer') {
      title = 'Sales Explorer';
      subtitle = 'Query and audit full historical transactions, filter results, and export reports.';
    } else if (tabId === 'planner') {
      title = 'Scenario & Forecast Planner';
      subtitle = 'Adjust business metrics in real-time to simulate future revenue projections.';
    } else if (tabId === 'alerts') {
      title = 'Alerts & Guardrails';
      subtitle = 'Configure triggers and monitor system anomalies or optimization items.';
    }

    elements.tabTitle.textContent = title;
    elements.tabSubtitle.textContent = subtitle;

    // Refresh charts on tab focus to resolve layout sizing issues
    setTimeout(() => {
      if (tabId === 'dashboard') {
        Object.values(charts).forEach(c => {
          if (c && c.render) c.windowResizeHandler();
        });
      } else if (tabId === 'planner' && charts.plannerForecast) {
        charts.plannerForecast.windowResizeHandler();
      }
    }, 100);
  }

  // Global Timeframe Select
  function handleTimeframeChange() {
    state.timeframe = elements.timeframeSelect.value;
    updateDateFilters();
    
    // Reload dashboard components
    renderDashboard();
    renderExplorer();
    checkRulesAndGenerateAlerts();
  }

  // Update date ranges inside state filters
  function updateDateFilters() {
    const now = new Date();
    const start = new Date();

    if (state.timeframe === 'all') {
      state.filters.startDate = null;
      state.filters.endDate = null;
    } else if (state.timeframe === '30') {
      start.setDate(now.getDate() - 30);
      state.filters.startDate = start;
      state.filters.endDate = now;
    } else if (state.timeframe === '90') {
      start.setDate(now.getDate() - 90);
      state.filters.startDate = start;
      state.filters.endDate = now;
    } else if (state.timeframe === 'ytd') {
      start.setMonth(0);
      start.setDate(1);
      start.setHours(0,0,0,0);
      state.filters.startDate = start;
      state.filters.endDate = now;
    }
  }

  // Quick reload/re-evaluate
  function handleRefreshData() {
    const btn = elements.btnRefresh;
    btn.classList.add('lucide-spin');
    
    setTimeout(() => {
      renderDashboard();
      renderExplorer();
      renderPlanner();
      checkRulesAndGenerateAlerts();
      btn.classList.remove('lucide-spin');
    }, 600);
  }

  // Helper formatting values
  function formatCurrency(val) {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    } else if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}k`;
    }
    return `$${Math.round(val).toLocaleString()}`;
  }

  // --------------------------------------------------------
  // 2. Dashboard Logic (KPIs & Charts)
  // --------------------------------------------------------
  function renderDashboard() {
    // Get filtered dataset
    const data = window.dataEngine.getFilteredData(state.filters);
    const kpis = window.dataEngine.getOverviewKPIs(data);
    
    // Update KPI Text Card UI
    elements.kpiRevenue.textContent = formatCurrency(kpis.revenue);
    elements.kpiUnits.textContent = kpis.unitsSold.toLocaleString();
    elements.kpiProfit.textContent = `${formatCurrency(kpis.profit)}`;
    elements.kpiMargin.textContent = `(${kpis.margin.toFixed(1)}%)`;
    elements.kpiConversion.textContent = `${kpis.conversionRate.toFixed(2)}%`;

    // Dynamic deltas (vs baseline totals)
    // To show changes, let's use a default historical growth rate baseline of 5% revenue bump
    const baselineRev = kpis.revenue * 0.94; // simulate slightly lower baseline
    const revChange = ((kpis.revenue - baselineRev) / baselineRev) * 100;
    elements.trendRevenue.innerHTML = `<i class="lucide-arrow-up-right"></i> ${revChange.toFixed(1)}%`;

    const baselineUnits = kpis.unitsSold * 0.95;
    const unitsChange = ((kpis.unitsSold - baselineUnits) / baselineUnits) * 100;
    elements.trendUnits.innerHTML = `<i class="lucide-arrow-up-right"></i> ${unitsChange.toFixed(1)}%`;

    const baselineProfit = kpis.profit * 0.92;
    const profitChange = ((kpis.profit - baselineProfit) / baselineProfit) * 100;
    elements.trendProfit.innerHTML = `<i class="lucide-arrow-up-right"></i> ${profitChange.toFixed(1)}%`;

    const baselineConv = kpis.conversionRate * 0.97;
    const convChange = ((kpis.conversionRate - baselineConv) / baselineConv) * 100;
    elements.trendConversion.innerHTML = `<i class="lucide-arrow-up-right"></i> ${convChange.toFixed(1)}%`;

    // Render Top Products List
    renderTopProductsList(data);

    // Render Apex Charts
    renderRevenueTrendChart(data);
    renderCategoryPieChart(data);
    renderRegionalBarChart(data);
    renderChannelDonutChart(data);
  }

  function renderTopProductsList(filteredData) {
    const list = window.dataEngine.getTopProducts(filteredData, 5);
    elements.topProductsBody.innerHTML = '';
    
    list.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td style="text-align: right; font-weight: 600;">${formatCurrency(p.revenue)}</td>
        <td style="text-align: right;"><span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">${p.margin.toFixed(1)}%</span></td>
      `;
      elements.topProductsBody.appendChild(row);
    });
  }

  // Chart 1: Line / Area Chart for Revenue Trend
  function renderRevenueTrendChart(filteredData) {
    const monthlyData = window.dataEngine.getMonthlyTrends(filteredData);
    const months = monthlyData.map(d => d.label);
    const revenues = monthlyData.map(d => d.revenue);
    const profits = monthlyData.map(d => d.profit);

    const options = {
      series: [
        { name: 'Revenue', data: revenues },
        { name: 'Net Profit', data: profits }
      ],
      chart: {
        height: 320,
        type: 'area',
        toolbar: { show: false },
        background: 'transparent',
        foreColor: '#94a3b8',
        fontFamily: 'Sora, "Plus Jakarta Sans", sans-serif'
      },
      colors: ['#6366f1', '#10b981'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        strokeDashArray: 4
      },
      xaxis: {
        categories: months,
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          formatter: (value) => '$' + Math.round(value / 1000) + 'k'
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => '$' + val.toLocaleString()
        }
      }
    };

    if (charts.revenueTrend) {
      charts.revenueTrend.updateOptions(options);
    } else {
      charts.revenueTrend = new ApexCharts(document.getElementById('chart-revenue-trend'), options);
      charts.revenueTrend.render();
    }
  }

  // Chart 2: Donut Chart for Product Categories
  function renderCategoryPieChart(filteredData) {
    const categoriesData = window.dataEngine.getCategoryDistribution(filteredData);
    const labels = categoriesData.map(d => d.category);
    const values = categoriesData.map(d => d.revenue);

    const options = {
      series: values,
      chart: {
        height: 320,
        type: 'donut',
        background: 'transparent',
        foreColor: '#94a3b8',
        fontFamily: 'Sora, "Plus Jakarta Sans", sans-serif'
      },
      labels: labels,
      colors: ['#6366f1', '#06b6d4', '#d946ef', '#10b981', '#f59e0b'],
      stroke: { show: false },
      legend: {
        position: 'bottom',
        fontSize: '12px'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            background: 'transparent',
            labels: {
              show: true,
              name: { show: true, fontSize: '13px', fontFamily: 'Bricolage Grotesque, Outfit, sans-serif' },
              value: {
                show: true,
                fontSize: '18px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                color: '#f8fafc',
                formatter: (val) => '$' + Math.round(val / 1000) + 'k'
              },
              total: {
                show: true,
                label: 'Total Revenue',
                color: '#94a3b8',
                formatter: function (w) {
                  return '$' + Math.round(w.globals.seriesTotals.reduce((a, b) => a + b, 0) / 1000) + 'k';
                }
              }
            }
          }
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => '$' + val.toLocaleString()
        }
      }
    };

    if (charts.categoryPie) {
      charts.categoryPie.updateOptions(options);
    } else {
      charts.categoryPie = new ApexCharts(document.getElementById('chart-category-pie'), options);
      charts.categoryPie.render();
    }
  }

  // Chart 3: Regional Bar Chart
  function renderRegionalBarChart(filteredData) {
    const regionalData = window.dataEngine.getRegionalPerformance(filteredData);
    const labels = regionalData.map(d => d.region);
    const revenues = regionalData.map(d => d.revenue);
    const profits = regionalData.map(d => d.profit);

    const options = {
      series: [
        { name: 'Revenue', data: revenues },
        { name: 'Profit', data: profits }
      ],
      chart: {
        height: 250,
        type: 'bar',
        toolbar: { show: false },
        background: 'transparent',
        foreColor: '#94a3b8',
        fontFamily: 'Sora, "Plus Jakarta Sans", sans-serif'
      },
      colors: ['#06b6d4', '#10b981'],
      stroke: { show: true, width: 2, colors: ['transparent'] },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4
        }
      },
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        strokeDashArray: 4
      },
      xaxis: {
        categories: labels,
        axisBorder: { show: false }
      },
      yaxis: {
        labels: {
          formatter: (val) => '$' + Math.round(val / 1000) + 'k'
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => '$' + val.toLocaleString()
        }
      }
    };

    if (charts.regionalBar) {
      charts.regionalBar.updateOptions(options);
    } else {
      charts.regionalBar = new ApexCharts(document.getElementById('chart-regional-bar'), options);
      charts.regionalBar.render();
    }
  }

  // Chart 4: Channel Distribution Chart
  function renderChannelDonutChart(filteredData) {
    const channelData = window.dataEngine.getChannelDistribution(filteredData);
    const labels = channelData.map(d => d.channel);
    const values = channelData.map(d => d.revenue);

    const options = {
      series: values,
      chart: {
        height: 250,
        type: 'donut',
        background: 'transparent',
        foreColor: '#94a3b8',
        fontFamily: 'Sora, "Plus Jakarta Sans", sans-serif'
      },
      labels: labels,
      colors: ['#6366f1', '#06b6d4', '#d946ef'],
      stroke: { show: false },
      legend: {
        position: 'bottom',
        fontSize: '11px'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: { show: true, fontSize: '11px', fontFamily: 'Bricolage Grotesque, Outfit, sans-serif' },
              value: {
                show: true, 
                fontSize: '16px', 
                fontFamily: 'Sora, sans-serif',
                color: '#fff',
                formatter: (val) => '$' + Math.round(val / 1000) + 'k'
              },
              total: {
                show: true,
                label: 'Total',
                color: '#94a3b8',
                formatter: (w) => '$' + Math.round(w.globals.seriesTotals.reduce((a,b) => a+b, 0) / 1000) + 'k'
              }
            }
          }
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => '$' + val.toLocaleString()
        }
      }
    };

    if (charts.channelDonut) {
      charts.channelDonut.updateOptions(options);
    } else {
      charts.channelDonut = new ApexCharts(document.getElementById('chart-channel-donut'), options);
      charts.channelDonut.render();
    }
  }

  // --------------------------------------------------------
  // 3. Sales Explorer Logic (Data Grid, Searching, Export)
  // --------------------------------------------------------
  function renderExplorer() {
    let raw = window.dataEngine.getRawTransactions();
    
    // 1. Timeframe filtering
    if (state.filters.startDate) {
      raw = raw.filter(t => t.date >= state.filters.startDate && t.date <= state.filters.endDate);
    }
    
    // 2. Select filterings
    const cat = elements.explorerCategory.value;
    const reg = elements.explorerRegion.value;
    const chan = elements.explorerChannel.value;
    const seg = elements.explorerSegment.value;

    if (cat !== 'All') raw = raw.filter(t => t.category === cat);
    if (reg !== 'All') raw = raw.filter(t => t.region === reg);
    if (chan !== 'All') raw = raw.filter(t => t.channel === chan);
    if (seg !== 'All') raw = raw.filter(t => t.segment === seg);

    // 3. Text search filtering (Order ID, Product Name)
    const term = state.explorer.searchTerm.trim().toLowerCase();
    if (term) {
      raw = raw.filter(t => 
        t.id.toLowerCase().includes(term) || 
        t.productName.toLowerCase().includes(term)
      );
    }

    // 4. Custom sorting
    const col = state.explorer.sortColumn;
    const dir = state.explorer.sortDirection === 'asc' ? 1 : -1;

    raw.sort((a, b) => {
      let valA = a[col];
      let valB = b[col];
      
      if (col === 'date') {
        return (a.date - b.date) * dir;
      }
      
      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * dir;
      }
      
      return (valA - valB) * dir;
    });

    // 5. Pagination
    const totalCount = raw.length;
    const page = state.explorer.page;
    const size = state.explorer.pageSize;
    const maxPage = Math.max(1, Math.ceil(totalCount / size));
    
    if (page > maxPage) {
      state.explorer.page = maxPage;
    }
    
    const startIndex = (state.explorer.page - 1) * size;
    const endIndex = Math.min(startIndex + size, totalCount);
    const paginatedItems = raw.slice(startIndex, endIndex);

    // Render Table Rows
    elements.transactionTableBody.innerHTML = '';
    
    if (paginatedItems.length === 0) {
      elements.transactionTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i class="lucide-alert-circle" style="font-size: 24px; margin-bottom: 8px;"></i>
            <p>No transactions found matching the filter criteria.</p>
          </td>
        </tr>
      `;
    } else {
      paginatedItems.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code style="color: var(--secondary); font-weight: 500;">${t.id}</code></td>
          <td>${t.date.toLocaleDateString('default', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
          <td><strong>${t.productName}</strong></td>
          <td>${t.category}</td>
          <td style="text-align: right;">${t.quantity}</td>
          <td style="text-align: right; font-weight: 600; color: #fff;">${formatCurrency(t.revenue)}</td>
          <td style="text-align: right; font-weight: 600; color: var(--success);">${formatCurrency(t.profit)}</td>
          <td><span class="badge region">${t.region}</span></td>
          <td><span class="badge channel">${t.channel}</span></td>
        `;
        elements.transactionTableBody.appendChild(tr);
      });
    }

    // Update Headers UI sort indicators
    elements.transactionHeaders.forEach(th => {
      const headerCol = th.getAttribute('data-sort');
      const icon = th.querySelector('.sort-icon i');
      if (headerCol === col) {
        th.style.color = 'var(--text-primary)';
        icon.className = state.explorer.sortDirection === 'asc' ? 'lucide-chevron-up' : 'lucide-chevron-down';
        icon.style.opacity = '1';
      } else {
        th.style.color = '';
        icon.className = 'lucide-arrow-up-down';
        icon.style.opacity = '0.3';
      }
    });

    // Update Pagination Summary Text
    elements.paginationSummary.textContent = totalCount > 0 
      ? `Showing ${startIndex + 1}-${endIndex} of ${totalCount} entries`
      : 'Showing 0-0 of 0 entries';

    elements.paginationPrev.disabled = state.explorer.page <= 1;
    elements.paginationNext.disabled = state.explorer.page >= maxPage;
  }

  function handleExplorerSearch() {
    state.explorer.searchTerm = elements.explorerSearch.value;
    state.explorer.page = 1;
    renderExplorer();
  }

  function handleExplorerFilterChange() {
    state.explorer.page = 1;
    renderExplorer();
  }

  function resetExplorerFilters() {
    elements.explorerSearch.value = '';
    elements.explorerCategory.value = 'All';
    elements.explorerRegion.value = 'All';
    elements.explorerChannel.value = 'All';
    elements.explorerSegment.value = 'All';
    
    state.explorer.searchTerm = '';
    state.explorer.page = 1;
    state.explorer.sortColumn = 'date';
    state.explorer.sortDirection = 'desc';
    
    renderExplorer();
  }

  function handleExplorerSort(column) {
    if (state.explorer.sortColumn === column) {
      // Toggle direction
      state.explorer.sortDirection = state.explorer.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.explorer.sortColumn = column;
      state.explorer.sortDirection = 'desc'; // default
    }
    state.explorer.page = 1;
    renderExplorer();
  }

  function changeExplorerPage(delta) {
    state.explorer.page += delta;
    renderExplorer();
  }

  // Generates CSV string and triggers browser file download
  function exportExplorerCSV() {
    let raw = window.dataEngine.getRawTransactions();
    
    // Re-apply same logic to get exactly what user sees
    if (state.filters.startDate) {
      raw = raw.filter(t => t.date >= state.filters.startDate && t.date <= state.filters.endDate);
    }
    const cat = elements.explorerCategory.value;
    const reg = elements.explorerRegion.value;
    const chan = elements.explorerChannel.value;
    const seg = elements.explorerSegment.value;

    if (cat !== 'All') raw = raw.filter(t => t.category === cat);
    if (reg !== 'All') raw = raw.filter(t => t.region === reg);
    if (chan !== 'All') raw = raw.filter(t => t.channel === chan);
    if (seg !== 'All') raw = raw.filter(t => t.segment === seg);

    const term = state.explorer.searchTerm.trim().toLowerCase();
    if (term) {
      raw = raw.filter(t => t.id.toLowerCase().includes(term) || t.productName.toLowerCase().includes(term));
    }

    if (raw.length === 0) {
      alert('No data available to export.');
      return;
    }

    // Build header CSV
    let csvContent = 'Order ID,Date,Product,Category,Quantity,Price,Revenue,Cost,Profit,Region,Channel,CustomerSegment,AcquisitionCost\r\n';
    
    raw.forEach(t => {
      const dateString = t.date.toISOString().split('T')[0];
      const prodName = t.productName.replace(/"/g, '""'); // escape quotes
      
      csvContent += `"${t.id}","${dateString}","${prodName}","${t.category}",${t.quantity},${t.price},${t.revenue},${t.cost},${t.profit},"${t.region}","${t.channel}","${t.segment}",${t.cac}\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `AuraSales_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --------------------------------------------------------
  // 4. Scenario Planner Forecasting (Simulator)
  // --------------------------------------------------------
  function renderPlanner() {
    // Collect slider values
    state.planner.marketing = parseFloat(elements.sliderMarketing.value);
    state.planner.pricing = parseInt(elements.sliderPricing.value);
    state.planner.cro = parseInt(elements.sliderCro.value);

    // Update Slider Value Label text
    elements.valMarketing.textContent = `${state.planner.marketing.toFixed(1)}x`;
    elements.valPricing.textContent = `${state.planner.pricing > 0 ? '+' : ''}${state.planner.pricing}%`;
    elements.valCro.textContent = `${state.planner.cro > 0 ? '+' : ''}${state.planner.cro}%`;

    // 1. Gather baseline averages from historical data
    // We compute average monthly stats based on last 6 months of raw data
    const rawData = window.dataEngine.getRawTransactions();
    const monthlyTrends = window.dataEngine.getMonthlyTrends(rawData);
    const last6Months = monthlyTrends.slice(-6);
    
    const avgMonthlyRevenue = last6Months.reduce((a,b)=> a+b.revenue, 0) / 6;
    const avgMonthlyCost = last6Months.reduce((a,b)=> a+b.cost, 0) / 6;
    const avgMonthlyProfit = last6Months.reduce((a,b)=> a+b.profit, 0) / 6;
    
    // Simulate typical monthly CAC from transactions
    const totalCAC = rawData.reduce((acc, t) => acc + t.cac, 0);
    const avgMonthlyCAC = totalCAC / 12;

    // 2. Microeconomic forecasting equations
    // M = Marketing, P = Pricing, C = CRO
    const M = state.planner.marketing;
    const P = state.planner.pricing / 100;
    const C = state.planner.cro / 100;

    // Elasticity factor for price adjustments
    const elasticity = -1.2; 
    
    // Quantity multiplier accounts for Ad multiplier, CRO gains, and pricing elasticity
    const quantityMultiplier = Math.pow(M, 0.5) * (1 + 0.6 * C) * (1 + elasticity * P);

    // Baseline projections (Forward 6 Months: t = 1..6)
    // We add a minor baseline organic trend: +1.5% compounded monthly growth
    const projectedMonthsLabels = [];
    const baseRevSeries = [];
    const baseProfitSeries = [];
    const simRevSeries = [];
    const simProfitSeries = [];

    let totalSimulatedRevenue = 0;
    let totalSimulatedProfit = 0;
    let totalBaselineRevenue = 0;
    let totalBaselineProfit = 0;

    const nextMonths = [];
    const now = new Date();
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(now);
      futureDate.setMonth(now.getMonth() + i);
      const label = futureDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      projectedMonthsLabels.push(label);
      
      // baseline organic projection
      const organicTrend = Math.pow(1.015, i);
      const baseRev = avgMonthlyRevenue * organicTrend;
      const baseCost = avgMonthlyCost * organicTrend;
      const baseProfit = baseRev - baseCost - avgMonthlyCAC; // subtract baseline CAC

      baseRevSeries.push(Math.round(baseRev));
      baseProfitSeries.push(Math.round(baseProfit));
      totalBaselineRevenue += baseRev;
      totalBaselineProfit += baseProfit;

      // Simulated projections
      const simRev = baseRev * quantityMultiplier * (1 + P);
      const simCost = baseCost * quantityMultiplier; // COGS stays proportional to volume quantity
      const simCac = avgMonthlyCAC * M; // marketing spend scaled directly by slider
      const simProfit = simRev - simCost - simCac;

      simRevSeries.push(Math.round(simRev));
      simProfitSeries.push(Math.round(simProfit));
      totalSimulatedRevenue += simRev;
      totalSimulatedProfit += simProfit;
    }

    // Update Simulated Metrics UI Card
    elements.planValRevenue.textContent = formatCurrency(totalSimulatedRevenue);
    elements.planValProfit.textContent = formatCurrency(totalSimulatedProfit);

    // Delta Percentage tags
    const revDeltaPercent = ((totalSimulatedRevenue - totalBaselineRevenue) / totalBaselineRevenue) * 100;
    const profitDeltaPercent = ((totalSimulatedProfit - totalBaselineProfit) / totalBaselineProfit) * 100;

    elements.planDiffRevenue.textContent = `${revDeltaPercent >= 0 ? '+' : ''}${revDeltaPercent.toFixed(1)}%`;
    elements.planDiffRevenue.className = revDeltaPercent >= 0 ? 'mini-metric-val impact-positive' : 'mini-metric-val impact-negative';
    
    elements.planDiffProfit.textContent = `${profitDeltaPercent >= 0 ? '+' : ''}${profitDeltaPercent.toFixed(1)}%`;
    elements.planDiffProfit.className = profitDeltaPercent >= 0 ? 'mini-metric-val impact-positive' : 'mini-metric-val impact-negative';

    // Simulate CAC to LTV Ratio efficiency
    // Baseline AOV is approx $145, Baseline profit margin is 45%. Avg LTV = 3 * Avg AOV * margin
    const baseAOV = 145;
    const baseMargin = 0.45;
    const simAOV = baseAOV * (1 + P);
    const simMargin = (totalSimulatedRevenue > 0) ? (totalSimulatedProfit / totalSimulatedRevenue) : baseMargin;
    
    // Simulated average customer CAC
    const simAverageCAC = (avgMonthlyCAC * M) / (50 * quantityMultiplier); // relative approximation
    const simLTV = simAOV * simMargin * 3;
    const ltvToCac = simAverageCAC > 0 ? (simLTV / simAverageCAC) : 4.2;

    elements.planValCac.textContent = `${ltvToCac.toFixed(1)}x LTV/CAC`;
    
    const baselineLtvCac = 4.2;
    const cacEfficiencyPercent = ((ltvToCac - baselineLtvCac) / baselineLtvCac) * 100;
    elements.planDiffCac.textContent = `${cacEfficiencyPercent >= 0 ? 'Efficiency +' : 'Efficiency '}${cacEfficiencyPercent.toFixed(1)}%`;
    elements.planDiffCac.style.color = cacEfficiencyPercent >= 0 ? 'var(--success)' : 'var(--danger)';

    // Update Model Summary text dynamic insights
    let insightText = '';
    if (revDeltaPercent > 10 && profitDeltaPercent > 10) {
      insightText = `🚀 <strong>Positive Forecast Trend:</strong> Your scenario indicates growth in both Topline Revenue (${revDeltaPercent.toFixed(1)}%) and Profit (${profitDeltaPercent.toFixed(1)}%). The scaling of marketing is successfully offsetting price elastic resistance.`;
    } else if (profitDeltaPercent < 0 && revDeltaPercent > 0) {
      insightText = `⚠️ <strong>Profit Squeeze Warning:</strong> Ad spend or pricing discounts are raising volume but compressing overall profitability. LTV/CAC ratio is falling to ${ltvToCac.toFixed(1)}x. Consider raising base prices (+5%) or optimizing CRO before expanding ad budgets.`;
    } else if (revDeltaPercent < 0 && profitDeltaPercent > 0) {
      insightText = `📈 <strong>Margin Optimization:</strong> Volume is lower due to price adjustments, but increased pricing power (+${state.planner.pricing}%) has bolstered net profit by ${profitDeltaPercent.toFixed(1)}%. This is an efficient high-margin model.`;
    } else {
      insightText = `⚠️ <strong>Declining Outlook:</strong> Simulated variables yield a drop in performance. Budget cuts (-${Math.round((1-M)*100)}% ad spend) coupled with price compression are severely limiting customer acquisition channels.`;
    }
    elements.plannerModelSummary.innerHTML = insightText;

    // Line chart update
    const chartOptions = {
      series: [
        { name: 'Revenue Baseline Forecast', data: baseRevSeries },
        { name: 'Revenue Simulated Forecast', data: simRevSeries },
        { name: 'Net Profit Baseline Forecast', data: baseProfitSeries },
        { name: 'Net Profit Simulated Forecast', data: simProfitSeries }
      ],
      chart: {
        height: 310,
        type: 'line',
        toolbar: { show: false },
        background: 'transparent',
        foreColor: '#94a3b8',
        fontFamily: 'Sora, "Plus Jakarta Sans", sans-serif'
      },
      colors: ['#6366f1', '#06b6d4', '#475569', '#10b981'],
      stroke: {
        width: [2, 4, 1, 3],
        dashArray: [5, 0, 5, 0],
        curve: 'smooth'
      },
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        strokeDashArray: 4
      },
      xaxis: {
        categories: projectedMonthsLabels,
        axisBorder: { show: false }
      },
      yaxis: {
        labels: {
          formatter: (value) => '$' + Math.round(value / 1000) + 'k'
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => '$' + val.toLocaleString()
        }
      }
    };

    if (charts.plannerForecast) {
      charts.plannerForecast.updateOptions(chartOptions);
    } else {
      charts.plannerForecast = new ApexCharts(document.getElementById('chart-planner-forecast'), chartOptions);
      charts.plannerForecast.render();
    }
  }

  function handlePlannerSliderChange() {
    renderPlanner();
  }

  function resetPlannerSliders() {
    elements.sliderMarketing.value = 1.0;
    elements.sliderPricing.value = 0;
    elements.sliderCro.value = 0;
    
    renderPlanner();
  }

  // --------------------------------------------------------
  // 5. System Alerts & Metric Guardrails
  // --------------------------------------------------------
  function renderAlerts() {
    elements.alertsContainer.innerHTML = '';
    
    // Sort alerts chronologically (latest first)
    const sorted = [...state.alerts].sort((a,b) => b.timestamp - a.timestamp);
    
    if (sorted.length === 0) {
      elements.alertsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          <i class="lucide-shield-check" style="font-size: 32px; color: var(--success); margin-bottom: 8px;"></i>
          <p>No active anomalies or alert triggers. System running efficiently.</p>
        </div>
      `;
      elements.alertsCountBadge.style.display = 'none';
      return;
    }

    elements.alertsCountBadge.style.display = 'block';
    
    sorted.forEach(a => {
      const timeStr = a.timestamp.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' }) + 
                      ' (' + a.timestamp.toLocaleDateString() + ')';
      
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert-item ${a.severity}`;
      alertDiv.innerHTML = `
        <div class="alert-item-icon">
          <i class="${a.severity === 'critical' ? 'lucide-alert-triangle' : (a.severity === 'warning-status' ? 'lucide-alert-circle' : 'lucide-info')}"></i>
        </div>
        <div class="alert-item-body">
          <div class="alert-item-title">${a.title}</div>
          <div class="alert-item-desc">${a.description}</div>
          <div class="alert-item-time">${timeStr}</div>
        </div>
        <div class="alert-dismiss" data-id="${a.id}">
          <i class="lucide-x"></i>
        </div>
      `;
      elements.alertsContainer.appendChild(alertDiv);
    });

    // Dismiss Alert Event Binding
    document.querySelectorAll('.alert-dismiss').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        dismissAlert(id);
      });
    });
  }

  function dismissAlert(id) {
    state.alerts = state.alerts.filter(a => a.id !== id);
    renderAlerts();
  }

  function dismissAllAlerts() {
    state.alerts = [];
    renderAlerts();
  }

  // Render configured metric boundary rules list
  function renderRules() {
    elements.activeRulesContainer.innerHTML = '';
    
    if (state.customRules.length === 0) {
      elements.activeRulesContainer.innerHTML = `
        <p style="font-size: 12.5px; color: var(--text-muted); text-align: center;">No active guardrails. Create one using the form above.</p>
      `;
      return;
    }

    state.customRules.forEach(r => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justify = 'space-between';
      item.style.alignItems = 'center';
      item.style.background = 'var(--bg-deep)';
      item.style.border = '1px solid var(--border)';
      item.style.padding = '10px 14px';
      item.style.borderRadius = '8px';
      item.style.fontSize = '12.5px';
      
      const sevColor = r.severity === 'critical' ? 'var(--danger)' : (r.severity === 'warning-status' ? 'var(--warning)' : 'var(--secondary)');

      item.innerHTML = `
        <div>
          <strong style="color: ${sevColor};">${r.metricLabel}</strong>
          <span style="color: var(--text-secondary); margin-left: 8px;">Trigger: ${r.metric.includes('min') ? '<' : '>'} ${r.metric.includes('margin') ? r.value + '%' : '$' + r.value.toLocaleString()}</span>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${r.description}</p>
        </div>
        <button class="btn-icon delete-rule-btn" data-id="${r.id}" style="padding: 4px 8px; border: none; background: transparent;">
          <i class="lucide-trash-2" style="font-size: 14px; color: var(--text-muted);"></i>
        </button>
      `;

      elements.activeRulesContainer.appendChild(item);
    });

    // Delete rule binding
    document.querySelectorAll('.delete-rule-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteRule(id);
      });
    });
  }

  function deleteRule(id) {
    state.customRules = state.customRules.filter(r => r.id !== id);
    renderRules();
    checkRulesAndGenerateAlerts();
  }

  function handleAddRule(e) {
    e.preventDefault();
    const metricSelect = document.getElementById('rule-metric');
    const valInput = document.getElementById('rule-val');
    const severitySelect = document.getElementById('rule-severity');
    const descInput = document.getElementById('rule-description');

    const newRule = {
      id: 'R' + Date.now(),
      metric: metricSelect.value,
      metricLabel: metricSelect.options[metricSelect.selectedIndex].text.split(' (')[0],
      value: parseFloat(valInput.value),
      severity: severitySelect.value,
      description: descInput.value
    };

    state.customRules.push(newRule);
    renderRules();
    checkRulesAndGenerateAlerts();
    
    // Reset form
    valInput.value = '';
    descInput.value = '';
  }

  // Evaluates custom rules against CURRENT filtered data state
  function checkRulesAndGenerateAlerts() {
    const data = window.dataEngine.getFilteredData(state.filters);
    const kpis = window.dataEngine.getOverviewKPIs(data);

    let generatedNewAlert = false;

    state.customRules.forEach(rule => {
      let isViolated = false;
      let actualValue = 0;
      let alertMsg = '';

      if (rule.metric === 'revenue_min') {
        // Average monthly revenue in selected data
        const trends = window.dataEngine.getMonthlyTrends(data);
        if (trends.length > 0) {
          const totalRev = trends.reduce((sum, m) => sum + m.revenue, 0);
          actualValue = totalRev / trends.length;
          if (actualValue < rule.value) {
            isViolated = true;
            alertMsg = `Monthly average revenue is ${formatCurrency(actualValue)}, falling below configured guardrail floor of ${formatCurrency(rule.value)}.`;
          }
        }
      } else if (rule.metric === 'margin_min') {
        actualValue = kpis.margin;
        if (actualValue < rule.value) {
          isViolated = true;
          alertMsg = `Average net margin is ${actualValue.toFixed(1)}%, which is below target floor of ${rule.value}%.`;
        }
      } else if (rule.metric === 'cac_max') {
        actualValue = kpis.averageCAC;
        if (actualValue > rule.value) {
          isViolated = true;
          alertMsg = `Average CAC has risen to $${actualValue.toFixed(2)}, exceeding guardrail threshold ceiling of $${rule.value}.`;
        }
      } else if (rule.metric === 'discount_max') {
        // Find percentage of discounted orders
        const discounted = data.filter(t => t.hasDiscount);
        actualValue = (discounted.length / data.length) * 100;
        if (actualValue > rule.value) {
          isViolated = true;
          alertMsg = `Discount frequency has reached ${actualValue.toFixed(1)}% of orders, exceeding discount threshold of ${rule.value}%.`;
        }
      }

      if (isViolated) {
        // Check if an alert for this rule already exists
        const exists = state.alerts.find(a => a.ruleId === rule.id);
        if (!exists) {
          state.alerts.push({
            id: 'AL-' + Date.now() + Math.random().toString(36).substr(2, 4),
            ruleId: rule.id,
            title: `Guardrail Triggered: ${rule.metricLabel}`,
            description: `${alertMsg} Context: ${rule.description}`,
            severity: rule.severity,
            timestamp: new Date()
          });
          generatedNewAlert = true;
        }
      }
    });

    if (generatedNewAlert) {
      renderAlerts();
    }
  }

  // Debouncer utility
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Trigger init on load
  init();
});
