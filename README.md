# AuraSales: Performance & Predictive Analytics Dashboard

AuraSales is a professional, high-fidelity sales analytics dashboard prototype and data science toolkit. It addresses the problem of scattered sales data by providing real-time visibility into metrics, ad-hoc transactional querying, predictive forecasting simulations, and anomaly alert guardrails.

---

## 📂 Project Structure

*   **[`index.html`](file:///d:/Sadre/index.html)**: The main single-page application structure. Contains layouts for the analytical Dashboard, Sales Explorer, Scenario Planner, and Guardrail Alerts.
*   **[`styles.css`](file:///d:/Sadre/styles.css)**: Custom CSS design system implementing a premium glassmorphic dark-theme with neon accents. Leverages **Outfit** for typography headers, **Plus Jakarta Sans** for body interfaces, and **JetBrains Mono** for data cells.
*   **[`data.js`](file:///d:/Sadre/data.js)**: Procedural client-side JavaScript mock data generator modeling seasonal transaction curves.
*   **[`app.js`](file:///d:/Sadre/app.js)**: Controller scripting that coordinates filtering states, dynamically renders ApexCharts, handles pagination/sorting, runs real-time mathematical forecasts, and checks threshold alert rules.
*   **[`app.py`](file:///d:/Sadre/app.py)**: Interactive Python enterprise analytics dashboard powered by **Streamlit**, **Pandas**, **Plotly Express**, and **OpenPyXL**.
*   **[`sales_analytics.py`](file:///d:/Sadre/sales_analytics.py)**: Unified Python data generator and analytics pipeline. Supports CLI flags for generating datasets, calculating business KPIs, and running financial summaries.
*   **[`requirements.txt`](file:///d:/Sadre/requirements.txt)**: Python package dependencies (`streamlit`, `pandas`, `plotly`, `openpyxl`).
*   **[`fictional_sales_data.csv`](file:///d:/Sadre/fictional_sales_data.csv)**: Fictional dataset populated via Python.
*   **[`sales_analytics_documentation.md`](file:///d:/Sadre/sales_analytics_documentation.md)**: Granular technical documentation covering equations, PostgreSQL/Snowflake data schemas, and ETL dbt architectures.

---

## ⚡ Quick Start & Verification

### 1. Launching the Streamlit Interactive Python App
Run the full-featured Python dashboard with real-time Plotly charts and Excel/CSV exporting:
```bash
python -m streamlit run app.py
```
Open **[http://localhost:8501](http://localhost:8501)** in your browser.

### 2. Launching the Web Prototype (Vanilla JS & CSS)
*   **Option A (Local Server)**:
    ```bash
    python -m http.server 8000
    ```
    Open **[http://localhost:8000](http://localhost:8000)**
*   **Option B (Direct Execution)**: Double-click **[`index.html`](file:///d:/Sadre/index.html)** in Windows Explorer.

### 3. Running Python Analytical CLI Pipeline
```bash
python sales_analytics.py
```

---

## 💡 Key Features of the Prototype

1.  **Interactive Performance Dashboard**: Features time-frame sorting (All Time, 30 Days, 90 Days, YTD), dynamic graphs (growth trends, category revenue shares, regional profit distributions, channel blends), and Top 5 selling product lists.
2.  **Dataset Upload & Import**: Drag-and-drop or browse custom sales CSV files, auto-detect columns/metrics, preview sample records, and dynamically refresh all charts and filters.
3.  **Sales Explorer Data Grid**: A searchable database grid supporting multi-column sorting, channel/region filtering, pagination, and a dynamic **Export CSV** download feature.
4.  **Scenario Forecast Simulator**: Real-time modeling that calculates the delta impact of ad-spend increases, pricing changes, and conversion optimization using microeconomic demand elasticity models.
5.  **Metric Guardrails**: Set custom floor/ceiling rules (such as max CAC limits or minimum revenue targets) to automatically flag anomalies in system logs.
