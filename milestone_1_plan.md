# Milestone 1: Sales Analytics Dashboard Proposal (One-Page Plan)
**Submission Target**: Mentor Review (Phone: 9025988203)
**Project Title**: AuraSales Performance & Predictive Analytics System
**Sub-domain**: Sales Analytics

---

## 1. Problem Statement & Core Business Questions

### 1.1 Pain Points
Businesses lack real-time visibility into sales performance trends due to siloed data systems (marketing ad spend, transaction databases, and web log traffic). Manual data preparation creates delayed pricing strategies, unmonitored Customer Acquisition Cost (CAC) spikes, and an inability to run financial forecasts prior to budget commitments.

### 1.2 Core Business Questions Answered by the Dashboard
1.  **Revenue Velocity**: What are the monthly trends for gross revenue, cost of goods, and operating margins?
2.  **Product Contribution**: Which product categories and specific product units drive the highest sales volume and margins?
3.  **Regional Allocation**: How do sales volume and gross margin percentages distribute geographically?
4.  **Acquisition ROI**: What is the marketing efficiency (CAC) per acquisition channel, and how does customer Lifetime Value (LTV) compare to acquisition cost (LTV/CAC ratio)?
5.  **Predictive Forecasts**: What is the projected financial impact (revenue/profit) of adjusting marketing ad spend, modifying product pricing, or improving website checkout Conversion Rate Optimization (CRO)?

---

## 2. Secondary Research Summary (KPIs & Best Practices)

### 2.1 Selected Key Performance Indicators (KPIs)
*   **Total Revenue**: Cumulative gross invoicing.
*   **Units Sold**: Inventory throughput count.
*   **Net Profit & Margin %**: Financial bottom-line efficiency.
*   **Average Order Value (AOV)**: Purchase size benchmark.
*   **Conversion Rate**: Web traffic percentage converting to orders.
*   **Customer Acquisition Cost (CAC)**: Capital required to acquire a new customer.
*   **LTV/CAC Ratio**: Metric of unit-economic health (Target: > 3.0x).

### 2.2 Dashboard Design Best Practices
*   **Grid Hierarchy**: KPI summary cards positioned at the top; high-level trend visualizations in the middle; and granular filters or log details at the bottom.
*   **Theme**: Sleek glassmorphic dark-theme default to maximize readability of contrasting neon trend lines.
*   **Interactivity**: Global filters for time periods (Last 30 days, Last 90 days, YTD), text search queries, and range adjustment inputs.

---

## 3. Tool Selection & Data Simulation

### 3.1 Tools Chosen
*   **Dashboard & Interface**: Vanilla HTML5, CSS3 (glassmorphic framework), and JavaScript paired with **ApexCharts** for dynamic, responsive visualizations.
*   **Data Processing & Engine**: Python (Pandas & NumPy) utilized to model transaction cleaning, data prep, and LTV math.
*   **Documentation**: Markdown files linked locally in the workspace.

### 3.2 Simulated Data Source
*   **File**: `fictional_sales_data.csv` (1,000 transaction entries, generated via `sales_analytics.py`).
*   **Fields**: Transaction ID, Date, Product Name, Category, Price, Cost, Quantity, Region, Channel, Customer Segment, and CAC.

---

## 4. Visual Scope (Core Dashboard Modules)

We will build a professional single-page web dashboard structured into three main modules:
1.  **Overview Dashboard**: Visualizes top-line trends (monthly line graphs, category donuts, regional columns, and top product tables).
2.  **Sales Explorer Table**: A granular, sortable transactional log explorer supporting keyword searches, category filters, and an **Export CSV** download feature.
3.  **Scenario Planner (Forecast Simulator)**: Uses a microeconomic price elasticity model ($\epsilon = -1.2$) and diminishing ad returns to simulate 6-month forward projections as users slide inputs.
