"""
AuraSales Python Analytical Processor
Performs data processing, manipulation, and analysis on fictional sales transaction logs.
Requires pandas.
"""

import sys
import os

try:
    import pandas as pd
except ImportError:
    print("[WARNING] Pandas is not installed. To run this script, please install it using: pip install pandas")
    sys.exit(1)

def run_analysis(csv_filepath="fictional_sales_data.csv"):
    if not os.path.exists(csv_filepath):
        print(f"[ERROR] The database file '{csv_filepath}' was not found. Please run 'generate_data.py' first.")
        return

    print("Loading fictional sales transaction logs...")
    # Read the dataset
    df = pd.read_csv(csv_filepath)
    
    # Data Cleaning and Preparation
    df['Date'] = pd.to_datetime(df['Date'])
    df['Margin_Percent'] = (df['Net_Profit'] / df['Revenue']) * 100
    
    print("\n--- GENERAL BUSINESS KPIs SUMMARY ---")
    total_rev = df['Revenue'].sum()
    total_cost = df['Cost'].sum()
    total_profit = df['Net_Profit'].sum()
    total_units = df['Quantity'].sum()
    avg_order_value = df['Revenue'].mean()
    net_margin = (total_profit / total_rev) * 100
    
    print(f"Total Revenue      : ${total_rev:,.2f}")
    print(f"Total Cost of Goods: ${total_cost:,.2f}")
    print(f"Net Operating Profit: ${total_profit:,.2f}")
    print(f"Gross Margin %     : {net_margin:.2f}%")
    print(f"Total Units Sold   : {total_units:,}")
    print(f"Average Order Value: ${avg_order_value:.2f}")
    
    print("\n--- CATEGORY SALES HEALTH INDEX ---")
    cat_df = df.groupby('Category').agg(
        Revenue=('Revenue', 'sum'),
        Net_Profit=('Net_Profit', 'sum'),
        Units_Sold=('Quantity', 'sum')
    ).reset_index()
    cat_df['Margin_Percent'] = (cat_df['Net_Profit'] / cat_df['Revenue']) * 100
    cat_df = cat_df.sort_values(by='Revenue', ascending=False)
    
    for idx, row in cat_df.iterrows():
        print(f"Category: {row['Category']:<18} | Revenue: ${row['Revenue']:>10,.2f} | Profit: ${row['Net_Profit']:>9,.2f} | Margin: {row['Margin_Percent']:>5.1f}%")

    print("\n--- REGIONAL SALES DISTRIBUTION ---")
    reg_df = df.groupby('Region').agg(
        Revenue=('Revenue', 'sum'),
        Net_Profit=('Net_Profit', 'sum')
    ).reset_index().sort_values(by='Revenue', ascending=False)
    
    for idx, row in reg_df.iterrows():
         print(f"Region: {row['Region']:<15} | Revenue: ${row['Revenue']:>10,.2f} | Net Profit: ${row['Net_Profit']:>9,.2f}")

    print("\n--- CUSTOMER ACQUISITION (CAC vs LTV) ---")
    # Filters to new customers to assess CAC metrics
    new_cust_df = df[df['Customer_Segment'] == 'New']
    avg_cac = new_cust_df['CAC'].mean()
    total_marketing_spend = new_cust_df['CAC'].sum()
    
    # Calculate simple customer Lifetime Value (LTV) estimate: AOV * margin_percent * 3 purchases
    estimated_ltv = avg_order_value * (net_margin / 100) * 3
    ltv_cac_ratio = estimated_ltv / avg_cac if avg_cac > 0 else 0
    
    print(f"Total Marketing Budget (Ad CAC): ${total_marketing_spend:,.2f}")
    print(f"Average Acquisition Cost (CAC) : ${avg_cac:.2f} per new customer")
    print(f"Estimated Customer LTV         : ${estimated_ltv:.2f}")
    print(f"System LTV/CAC Ratio           : {ltv_cac_ratio:.2f}x (Health Benchmark: > 3.0x)")

    # Monthly Trends
    print("\n--- MONTHLY SALES VELOCITY (LAST 12 MONTHS) ---")
    df['Month_Year'] = df['Date'].dt.to_period('M')
    monthly_df = df.groupby('Month_Year').agg(
        Revenue=('Revenue', 'sum'),
        Net_Profit=('Net_Profit', 'sum')
    ).reset_index().sort_values(by='Month_Year')
    
    for idx, row in monthly_df.iterrows():
         print(f"Month: {str(row['Month_Year']):<7} | Revenue: ${row['Revenue']:>10,.2f} | Profit: ${row['Net_Profit']:>9,.2f}")

if __name__ == "__main__":
    run_analysis()
