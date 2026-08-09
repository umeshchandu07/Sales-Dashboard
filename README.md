# AuraSales: Performance & Predictive Analytics Dashboard

AuraSales is a professional, high-fidelity sales analytics dashboard prototype and data science toolkit. It addresses the problem of scattered sales data by providing real-time visibility into metrics, ad-hoc transactional querying, predictive forecasting simulations, and anomaly alert guardrails.

---

## 📂 Project Structure

*   **[`index.html`](file:///d:/Sadre/index.html)**: The main single-page application structure. Contains layouts for the analytical Dashboard, Sales Explorer, Scenario Planner, and Guardrail Alerts.
*   **[`styles.css`](file:///d:/Sadre/styles.css)**: Custom CSS design system implementing a premium glassmorphic dark-theme with neon accents. Leverages **Outfit** for typography headers, **Plus Jakarta Sans** for body interfaces, and **JetBrains Mono** for data cells.
*   **[`data.js`](file:///d:/Sadre/data.js)**: Procedural client-side JavaScript mock data generator modeling seasonal transaction curves.
*   **[`app.js`](file:///d:/Sadre/app.js)**: Controller scripting that coordinates filtering states, dynamically renders ApexCharts, handles pagination/sorting, runs real-time mathematical forecasts, and checks threshold alert rules.
*   **[`generate_data.py`](file:///d:/Sadre/generate_data.py)**: Python data generator script that outputs a CP1252-safe transactional CSV log.
*   **[`analyze_sales.py`](file:///d:/Sadre/analyze_sales.py)**: Pandas-based Python utility for descriptive sales and CAC analysis.
*   **[`fictional_sales_data.csv`](file:///d:/Sadre/fictional_sales_data.csv)**: Fictional dataset of 1,000 transaction rows populated via Python.
*   **[`sales_analytics_documentation.md`](file:///d:/Sadre/sales_analytics_documentation.md)**: Granular technical documentation covering equations, PostgreSQL/Snowflake data schemas, and ETL dbt architectures.

---

## ⚡ Quick Start & Verification

### 1. Launching the Interactive Web Dashboard
Since AuraSales is a high-fidelity frontend prototype, it can run directly in the browser:
*   **Option A (Local Server)**: Run a local server from the project directory. For example, using Python's built-in server:
    ```bash
    python -m http.server 8000
    ```
    Then open your browser and navigate to: **[http://localhost:8000](http://localhost:8000)**
*   **Option B (Direct Execution)**: Double-click **[`index.html`](file:///d:/Sadre/index.html)** inside your Windows Explorer to open it in Chrome, Edge, or Firefox.

### 2. Running Python Analytical Scripts
To test the Python-based data processing module:
1.  **Generate Data**:
    ```bash
    python generate_data.py
    ```
    This generates the CSV file `fictional_sales_data.csv`.
2.  **Process Data** (Requires `pandas`):
    ```bash
    pip install pandas
    python analyze_sales.py
    ```
    This outputs key KPIs, product category index performance, regional share, and customer LTV/CAC ratios directly to your command prompt.

---

## 💡 Key Features of the Prototype

1.  **Interactive Performance Dashboard**: Features time-frame sorting (All Time, 30 Days, 90 Days, YTD), dynamic graphs (growth trends, category revenue shares, regional profit distributions, channel blends), and Top 5 selling product lists.
2.  **Dataset Upload & Import**: Drag-and-drop or browse custom sales CSV files, auto-detect columns/metrics, preview sample records, and dynamically refresh all charts and filters.
3.  **Sales Explorer Data Grid**: A searchable database grid supporting multi-column sorting, channel/region filtering, pagination, and a dynamic **Export CSV** download feature.
4.  **Scenario Forecast Simulator**: Real-time modeling that calculates the delta impact of ad-spend increases, pricing changes, and conversion optimization using microeconomic demand elasticity models.
5.  **Metric Guardrails**: Set custom floor/ceiling rules (such as max CAC limits or minimum revenue targets) to automatically flag anomalies in system logs.
