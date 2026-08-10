"""
AuraSales Enterprise Sales & Performance Analytics Dashboard
Built with Streamlit, Pandas, Plotly Express, and OpenPyXL.
"""

import io
import os
import sys
from datetime import datetime, timedelta
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
import openpyxl

# Set Streamlit Page Configuration
st.set_page_config(
    page_title="AuraSales // Enterprise Analytics",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Modern Styling
st.markdown("""
<style>
    /* Global Styles & Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    h1, h2, h3, h4, .stSubheader {
        font-family: 'Outfit', sans-serif !important;
        font-weight: 700;
        letter-spacing: -0.02em;
    }

    /* Metric Cards Custom Styling */
    div[data-testid="stMetric"] {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 16px 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(12px);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    
    div[data-testid="stMetric"]:hover {
        transform: translateY(-2px);
        border-color: rgba(99, 102, 241, 0.4);
    }
    
    div[data-testid="stMetricValue"] {
        font-family: 'Outfit', sans-serif !important;
        font-weight: 700 !important;
        font-size: 1.8rem !important;
    }
    
    /* Header Accent Badge */
    .brand-badge {
        display: inline-block;
        padding: 4px 12px;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.35);
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #818cf8;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 8px;
    }
    
    /* Status Pills */
    .status-pill {
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .status-healthy { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .status-warning { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3); }
    .status-alert { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

    /* Streamlit Tabs Customization */
    button[data-baseweb="tab"] {
        font-family: 'Outfit', sans-serif;
        font-size: 1rem;
        font-weight: 600;
        padding-top: 10px;
        padding-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)


# ==============================================================================
# DATA LOADER & CACHING
# ==============================================================================

@st.cache_data
def load_default_data():
    csv_path = "fictional_sales_data.csv"
    if not os.path.exists(csv_path):
        # Auto-generate if missing
        try:
            from sales_analytics import generate_fictional_data
            generate_fictional_data(csv_path, 1000)
        except Exception:
            pass
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        df['Date'] = pd.to_datetime(df['Date'])
        return df
    return pd.DataFrame()


def parse_uploaded_file(uploaded_file):
    try:
        if uploaded_file.name.endswith('.csv'):
            df = pd.read_csv(uploaded_file)
        elif uploaded_file.name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(uploaded_file, engine='openpyxl')
        else:
            st.error("Unsupported file type. Please upload a .csv or .xlsx file.")
            return None
        
        # Ensure Date parsing if exists
        for col in df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    df[col] = pd.to_datetime(df[col])
                except Exception:
                    pass
        return df
    except Exception as e:
        st.error(f"Error parsing file: {e}")
        return None


# ==============================================================================
# SIDEBAR FILTERS & CONTROLS
# ==============================================================================

st.sidebar.markdown('<div class="brand-badge">AuraSales Analytics</div>', unsafe_allow_html=True)
st.sidebar.title("🎛️ Control Center")

# File Upload Section
uploaded_file = st.sidebar.file_uploader(
    "Upload Custom Sales Data (.csv, .xlsx)",
    type=["csv", "xlsx", "xls"],
    help="Upload your enterprise sales dataset to dynamically analyze metrics in real-time."
)

if uploaded_file is not None:
    raw_df = parse_uploaded_file(uploaded_file)
    st.sidebar.success(f"Loaded: `{uploaded_file.name}`")
else:
    raw_df = load_default_data()

if raw_df is None or raw_df.empty:
    st.warning("⚠️ No dataset available. Please ensure 'fictional_sales_data.csv' exists or upload a dataset.")
    st.stop()

# Ensure standard columns exist or compute fallbacks
df = raw_df.copy()
if 'Net_Profit' not in df.columns and 'Revenue' in df.columns and 'Cost' in df.columns:
    df['Net_Profit'] = df['Revenue'] - df['Cost']
if 'Margin_Percent' not in df.columns and 'Revenue' in df.columns and 'Net_Profit' in df.columns:
    df['Margin_Percent'] = (df['Net_Profit'] / df['Revenue'].replace(0, 1)) * 100

st.sidebar.markdown("---")
st.sidebar.subheader("📅 Date Horizon")

date_col = None
for col in ['Date', 'date', 'Timestamp', 'timestamp', 'Transaction_Date']:
    if col in df.columns:
        date_col = col
        break

if date_col and pd.api.types.is_datetime64_any_dtype(df[date_col]):
    min_date = df[date_col].min().date()
    max_date = df[date_col].max().date()
    
    date_selection = st.sidebar.date_input(
        "Select Date Range",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date
    )
    
    if isinstance(date_selection, (tuple, list)) and len(date_selection) == 2:
        start_date, end_date = date_selection
        df = df[(df[date_col].dt.date >= start_date) & (df[date_col].dt.date <= end_date)]

st.sidebar.subheader("🔍 Dimension Slicing")

# Region Filter
if 'Region' in df.columns:
    available_regions = sorted(df['Region'].dropna().unique().tolist())
    selected_regions = st.sidebar.multiselect("Region", available_regions, default=available_regions)
    if selected_regions:
        df = df[df['Region'].isin(selected_regions)]

# Category Filter
if 'Category' in df.columns:
    available_categories = sorted(df['Category'].dropna().unique().tolist())
    selected_categories = st.sidebar.multiselect("Product Category", available_categories, default=available_categories)
    if selected_categories:
        df = df[df['Category'].isin(selected_categories)]

# Channel Filter
if 'Channel' in df.columns:
    available_channels = sorted(df['Channel'].dropna().unique().tolist())
    selected_channels = st.sidebar.multiselect("Sales Channel", available_channels, default=available_channels)
    if selected_channels:
        df = df[df['Channel'].isin(selected_channels)]

# Customer Segment Filter
if 'Customer_Segment' in df.columns:
    available_segments = sorted(df['Customer_Segment'].dropna().unique().tolist())
    selected_segments = st.sidebar.multiselect("Customer Segment", available_segments, default=available_segments)
    if selected_segments:
        df = df[df['Customer_Segment'].isin(selected_segments)]

# Reset Button
if st.sidebar.button("🔄 Reset All Filters", use_container_width=True):
    st.rerun()

st.sidebar.markdown("---")
st.sidebar.caption(f"Showing **{len(df):,}** of **{len(raw_df):,}** records")


# ==============================================================================
# MAIN DASHBOARD INTERFACE
# ==============================================================================

st.markdown('<div class="brand-badge">Enterprise Executive Overview</div>', unsafe_allow_html=True)
st.title("⚡ AuraSales Performance Analytics")

# Top KPI Metric Cards
col1, col2, col3, col4, col5 = st.columns(5)

total_rev = df['Revenue'].sum() if 'Revenue' in df.columns else 0
total_profit = df['Net_Profit'].sum() if 'Net_Profit' in df.columns else 0
total_units = df['Quantity'].sum() if 'Quantity' in df.columns else len(df)
margin_pct = (total_profit / total_rev * 100) if total_rev > 0 else 0
avg_order_val = df['Revenue'].mean() if 'Revenue' in df.columns and len(df) > 0 else 0

# CAC and LTV Calculation
if 'CAC' in df.columns and 'Customer_Segment' in df.columns:
    new_cust_df = df[df['Customer_Segment'] == 'New']
    avg_cac = new_cust_df['CAC'].mean() if len(new_cust_df) > 0 else 0
    estimated_ltv = avg_order_val * (margin_pct / 100) * 3
    ltv_cac_ratio = (estimated_ltv / avg_cac) if avg_cac > 0 else 0
else:
    avg_cac = 0
    ltv_cac_ratio = 0

with col1:
    st.metric("Total Revenue", f"${total_rev:,.2f}", delta=f"{len(df):,} Orders")
with col2:
    st.metric("Net Profit", f"${total_profit:,.2f}", delta=f"{margin_pct:.1f}% Margin")
with col3:
    st.metric("Units Sold", f"{total_units:,}", delta="Products Moved")
with col4:
    st.metric("Avg Order Value", f"${avg_order_val:.2f}", delta="Per Transaction")
with col5:
    st.metric("LTV / CAC Ratio", f"{ltv_cac_ratio:.1f}x", delta=f"CAC: ${avg_cac:.1f}")

st.markdown("<br>", unsafe_allow_html=True)

# Main Navigation Tabs
tab_overview, tab_explorer, tab_simulator, tab_guardrails = st.tabs([
    "📊 Executive Overview",
    "🔍 Granular Sales Explorer",
    "📈 Scenario & Forecast Simulator",
    "🚨 Metric Guardrails"
])


# ==============================================================================
# TAB 1: EXECUTIVE OVERVIEW
# ==============================================================================

with tab_overview:
    # Row 1: Time Series & Category Breakdown
    chart_col1, chart_col2 = st.columns([1.6, 1.0])
    
    with chart_col1:
        st.subheader("📈 Monthly Revenue & Profit Velocity")
        if date_col and date_col in df.columns and 'Revenue' in df.columns and 'Net_Profit' in df.columns:
            ts_df = df.copy()
            ts_df['Period'] = ts_df[date_col].dt.to_period('M').astype(str)
            trend_df = ts_df.groupby('Period').agg(
                Revenue=('Revenue', 'sum'),
                Net_Profit=('Net_Profit', 'sum')
            ).reset_index().sort_values('Period')
            
            fig_trend = px.area(
                trend_df,
                x='Period',
                y=['Revenue', 'Net_Profit'],
                labels={'value': 'Amount ($)', 'Period': 'Month', 'variable': 'Metric'},
                color_discrete_map={'Revenue': '#6366f1', 'Net_Profit': '#10b981'},
                template='plotly_dark'
            )
            fig_trend.update_layout(
                margin=dict(l=20, r=20, t=30, b=20),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)"
            )
            st.plotly_chart(fig_trend, use_container_width=True)
        else:
            st.info("Time series trend requires Date, Revenue, and Net_Profit columns.")
            
    with chart_col2:
        st.subheader("🍩 Category Revenue Share")
        if 'Category' in df.columns and 'Revenue' in df.columns:
            cat_df = df.groupby('Category')['Revenue'].sum().reset_index()
            fig_donut = px.pie(
                cat_df,
                names='Category',
                values='Revenue',
                hole=0.55,
                color_discrete_sequence=px.colors.qualitative.Prism,
                template='plotly_dark'
            )
            fig_donut.update_layout(
                margin=dict(l=10, r=10, t=30, b=10),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5)
            )
            st.plotly_chart(fig_donut, use_container_width=True)

    # Row 2: Regional Performance & Top Products
    chart_col3, chart_col4 = st.columns([1.2, 1.4])
    
    with chart_col3:
        st.subheader("🌍 Regional Revenue & Profitability")
        if 'Region' in df.columns and 'Revenue' in df.columns and 'Net_Profit' in df.columns:
            reg_df = df.groupby('Region').agg(
                Revenue=('Revenue', 'sum'),
                Net_Profit=('Net_Profit', 'sum')
            ).reset_index().sort_values('Revenue', ascending=False)
            
            fig_reg = px.bar(
                reg_df,
                x='Region',
                y=['Revenue', 'Net_Profit'],
                barmode='group',
                labels={'value': 'Amount ($)', 'Region': 'Region', 'variable': 'Metric'},
                color_discrete_map={'Revenue': '#818cf8', 'Net_Profit': '#34d399'},
                template='plotly_dark'
            )
            fig_reg.update_layout(
                margin=dict(l=20, r=20, t=30, b=20),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
            )
            st.plotly_chart(fig_reg, use_container_width=True)

    with chart_col4:
        st.subheader("🏆 Top Performing Products by Revenue")
        if 'Product_Name' in df.columns and 'Revenue' in df.columns:
            prod_df = df.groupby('Product_Name').agg(
                Revenue=('Revenue', 'sum'),
                Quantity=('Quantity', 'sum') if 'Quantity' in df.columns else ('Revenue', 'count')
            ).reset_index().sort_values('Revenue', ascending=True).tail(8)
            
            fig_prod = px.bar(
                prod_df,
                x='Revenue',
                y='Product_Name',
                orientation='h',
                labels={'Revenue': 'Total Revenue ($)', 'Product_Name': 'Product'},
                color='Revenue',
                color_continuous_scale='Viridis',
                template='plotly_dark'
            )
            fig_prod.update_layout(
                margin=dict(l=20, r=20, t=30, b=20),
                coloraxis_showscale=False,
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)"
            )
            st.plotly_chart(fig_prod, use_container_width=True)


# ==============================================================================
# TAB 2: GRANULAR SALES EXPLORER
# ==============================================================================

with tab_explorer:
    st.subheader("🔍 Transaction Data Grid & Export")
    
    search_query = st.text_input("🔎 Search by Product, Region, Channel, or ID:", "")
    
    filtered_grid_df = df.copy()
    if search_query:
        mask = filtered_grid_df.astype(str).apply(lambda row: row.str.contains(search_query, case=False).any(), axis=1)
        filtered_grid_df = filtered_grid_df[mask]
        
    st.dataframe(
        filtered_grid_df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Revenue": st.column_config.NumberColumn("Revenue", format="$%.2f"),
            "Cost": st.column_config.NumberColumn("Cost", format="$%.2f"),
            "Net_Profit": st.column_config.NumberColumn("Net Profit", format="$%.2f"),
            "Price": st.column_config.NumberColumn("Unit Price", format="$%.2f"),
            "CAC": st.column_config.NumberColumn("CAC", format="$%.2f")
        }
    )
    
    # Download Buttons (CSV and Excel using openpyxl)
    exp_col1, exp_col2, exp_col3 = st.columns([1, 1, 2])
    
    with exp_col1:
        csv_buffer = filtered_grid_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Export to CSV",
            data=csv_buffer,
            file_name=f"aurasales_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv",
            use_container_width=True
        )
        
    with exp_col2:
        # Excel Export via Openpyxl
        excel_buffer = io.BytesIO()
        with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
            filtered_grid_df.to_excel(writer, index=False, sheet_name='Sales Transactions')
        excel_data = excel_buffer.getvalue()
        
        st.download_button(
            label="📊 Export to Excel (.xlsx)",
            data=excel_data,
            file_name=f"aurasales_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            use_container_width=True
        )


# ==============================================================================
# TAB 3: SCENARIO & WHAT-IF SIMULATOR
# ==============================================================================

with tab_overview if False else tab_simulator:
    st.subheader("📈 Microeconomic Scenario & Demand Forecast Simulator")
    st.write("Simulate the forward 6-month trajectory based on price elasticity, marketing expansion, and conversion optimization.")
    
    sim_col1, sim_col2, sim_col3 = st.columns(3)
    
    with sim_col1:
        price_delta = st.slider("Price Adjustment (%)", min_value=-30, max_value=30, value=5, step=1, help="Positive values increase unit price with elasticity dampening.")
    with sim_col2:
        ad_spend_mult = st.slider("Marketing Ad Spend Multiplier", min_value=0.5, max_value=3.0, value=1.2, step=0.1, help="Ad spend scaler incorporating diminishing returns.")
    with sim_col3:
        elasticity_coeff = st.slider("Price Elasticity (ε)", min_value=-2.5, max_value=-0.5, value=-1.2, step=0.1, help="Standard retail price elasticity is approximately -1.2.")
        
    # Mathematical Demand Simulation Model
    baseline_monthly_rev = total_rev / 12 if total_rev > 0 else 10000
    baseline_monthly_profit = total_profit / 12 if total_profit > 0 else 5000
    
    # Calculate demand volume shift
    volume_delta = (price_delta / 100.0) * elasticity_coeff
    ad_volume_boost = (ad_spend_mult ** 0.6) - 1.0
    net_volume_factor = 1.0 + volume_delta + ad_volume_boost
    
    projected_monthly_rev = baseline_monthly_rev * (1.0 + price_delta / 100.0) * net_volume_factor
    projected_monthly_profit = projected_monthly_rev * (margin_pct / 100.0) - (baseline_monthly_profit * 0.25 * (ad_spend_mult - 1.0))
    
    # Display Projected Deltas
    res_col1, res_col2, res_col3 = st.columns(3)
    with res_col1:
        st.metric(
            "Projected Monthly Revenue",
            f"${projected_monthly_rev:,.2f}",
            delta=f"{((projected_monthly_rev - baseline_monthly_rev)/baseline_monthly_rev * 100):+.1f}% vs Baseline"
        )
    with res_col2:
        st.metric(
            "Projected Monthly Net Profit",
            f"${projected_monthly_profit:,.2f}",
            delta=f"{((projected_monthly_profit - baseline_monthly_profit)/baseline_monthly_profit * 100):+.1f}% vs Baseline"
        )
    with res_col3:
        st.metric(
            "Volume Output Index",
            f"{net_volume_factor:.2f}x",
            delta=f"{(net_volume_factor - 1.0)*100:+.1f}% Demand Shift"
        )
        
    # Projected Forward Chart
    months = ["Month +1", "Month +2", "Month +3", "Month +4", "Month +5", "Month +6"]
    growth_rate = 1.02  # compounding forward trend
    baseline_series = [baseline_monthly_rev * (growth_rate ** i) for i in range(6)]
    simulated_series = [projected_monthly_rev * (growth_rate ** i) for i in range(6)]
    
    sim_chart_df = pd.DataFrame({
        "Month": months * 2,
        "Revenue": baseline_series + simulated_series,
        "Scenario": ["Baseline Trajectory"] * 6 + ["Simulated Scenario"] * 6
    })
    
    fig_sim = px.line(
        sim_chart_df,
        x="Month",
        y="Revenue",
        color="Scenario",
        line_dash="Scenario",
        markers=True,
        template="plotly_dark",
        color_discrete_map={"Baseline Trajectory": "#94a3b8", "Simulated Scenario": "#818cf8"}
    )
    fig_sim.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=30, b=20)
    )
    st.plotly_chart(fig_sim, use_container_width=True)


# ==============================================================================
# TAB 4: METRIC GUARDRAILS & ALERTS
# ==============================================================================

with tab_guardrails:
    st.subheader("🚨 Real-Time Risk Guardrails & Threshold Alerts")
    
    g_col1, g_col2 = st.columns(2)
    with g_col1:
        max_cac_threshold = st.number_input("Maximum Acceptable CAC ($)", value=30.0, step=5.0)
    with g_col2:
        min_margin_threshold = st.number_input("Minimum Gross Margin (%)", value=40.0, step=5.0)
        
    if 'CAC' in df.columns and 'Margin_Percent' in df.columns:
        high_cac_df = df[df['CAC'] > max_cac_threshold]
        low_margin_df = df[df['Margin_Percent'] < min_margin_threshold]
        
        st.markdown(f"**CAC Guardrail Status**: Found `{len(high_cac_df)}` transactions exceeding ${max_cac_threshold:.2f} threshold.")
        if not high_cac_df.empty:
            st.dataframe(high_cac_df[['Transaction_ID', 'Product_Name', 'Channel', 'CAC', 'Revenue']].head(10), use_container_width=True)
            
        st.markdown(f"**Margin Guardrail Status**: Found `{len(low_margin_df)}` transactions falling below {min_margin_threshold:.1f}% gross margin.")
        if not low_margin_df.empty:
            st.dataframe(low_margin_df[['Transaction_ID', 'Product_Name', 'Revenue', 'Cost', 'Margin_Percent']].head(10), use_container_width=True)
    else:
        st.info("Guardrails monitoring requires CAC and Margin_Percent columns in the dataset.")
