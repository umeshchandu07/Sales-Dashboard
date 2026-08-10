"""
AuraSales Python Unified Analytics & Data Pipeline
Combines transactional sales data generation and analytical processing in a single module.
"""

import os
import sys
import csv
import random
import argparse
from datetime import datetime, timedelta

# ==============================================================================
# 1. DATA GENERATOR MODULE
# ==============================================================================

def generate_fictional_data(output_filepath="fictional_sales_data.csv", transaction_count=1000):
    """
    Generates a structured, fictional transactional sales CSV dataset for Data Science and Analytics.
    Uses standard python libraries for zero-dependency execution.
    """
    categories = ['Electronics', 'Fashion', 'Home & Living', 'Fitness & Sports', 'Beauty & Care']
    
    products = [
        {'id': 'P001', 'name': 'AuraBook Pro 15', 'category': 'Electronics', 'price': 1299, 'cost': 780},
        {'id': 'P002', 'name': 'SoundSync ANC Headphones', 'category': 'Electronics', 'price': 199, 'cost': 85},
        {'id': 'P003', 'name': 'Quantum Charge Wireless Pad', 'category': 'Electronics', 'price': 49, 'cost': 15},
        {'id': 'P004', 'name': 'AeroGlide Smart Watch', 'category': 'Electronics', 'price': 299, 'cost': 130},
        
        {'id': 'P005', 'name': 'Luxe Linen Blazer', 'category': 'Fashion', 'price': 120, 'cost': 40},
        {'id': 'P006', 'name': 'Stratus Comfort Sneakers', 'category': 'Fashion', 'price': 85, 'cost': 30},
        {'id': 'P007', 'name': 'Core Denim Slim Fit', 'category': 'Fashion', 'price': 65, 'cost': 22},
        {'id': 'P008', 'name': 'Voyager Anti-Theft Backpack', 'category': 'Fashion', 'price': 75, 'cost': 25},
        
        {'id': 'P009', 'name': 'Nova Glow LED Desk Lamp', 'category': 'Home & Living', 'price': 45, 'cost': 14},
        {'id': 'P010', 'name': 'Ember Ceramic Coffee Mug Set', 'category': 'Home & Living', 'price': 35, 'cost': 10},
        {'id': 'P011', 'name': 'Helix Memory Foam Pillow', 'category': 'Home & Living', 'price': 80, 'cost': 32},
        {'id': 'P012', 'name': 'Breeze Mist Ultrasonic Diffuser', 'category': 'Home & Living', 'price': 50, 'cost': 18},
        
        {'id': 'P013', 'name': 'IronPulse Adjustable Dumbbell', 'category': 'Fitness & Sports', 'price': 249, 'cost': 120},
        {'id': 'P014', 'name': 'FlexiCore Anti-Slip Yoga Mat', 'category': 'Fitness & Sports', 'price': 40, 'cost': 12},
        {'id': 'P015', 'name': 'HydroDash Insulated Flask', 'category': 'Fitness & Sports', 'price': 30, 'cost': 8},
        {'id': 'P016', 'name': 'SonicPulse Smart Jump Rope', 'category': 'Fitness & Sports', 'price': 45, 'cost': 15},
        
        {'id': 'P017', 'name': 'DermaBright Serum Duo', 'category': 'Beauty & Care', 'price': 55, 'cost': 14},
        {'id': 'P018', 'name': 'HydroBloom Nourishing Cream', 'category': 'Beauty & Care', 'price': 38, 'cost': 10},
        {'id': 'P019', 'name': 'SilkDuo Ionic Hair Dryer', 'category': 'Beauty & Care', 'price': 110, 'cost': 48},
        {'id': 'P020', 'name': 'HerbalPure Charcoal Mask Set', 'category': 'Beauty & Care', 'price': 28, 'cost': 6}
    ]
    
    regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America']
    channels = ['Online', 'In-Store', 'Affiliate']
    segments = ['New', 'Returning']
    
    start_date = datetime.now() - timedelta(days=365)
    
    with open(output_filepath, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([
            'Transaction_ID', 'Date', 'Product_ID', 'Product_Name', 'Category', 
            'Quantity', 'Price', 'Revenue', 'Cost', 'Net_Profit', 'Region', 
            'Channel', 'Customer_Segment', 'CAC'
        ])
        
        random.seed(42)  # Reproducible results
        generated_count = 0
        
        for i in range(transaction_count):
            progress = i / transaction_count
            delta_days = progress * 365
            trans_date = start_date + timedelta(days=delta_days)
            
            # Apply seasonality factors
            month = trans_date.month
            seasonality = 1.0
            if month in [11, 12]:  # Holiday season spike
                seasonality = 1.45
            elif month in [3, 4]:  # Spring surge
                seasonality = 1.15
            
            # Skip random dates based on seasonality triggers
            if random.random() > (0.85 * seasonality):
                continue
                
            product = random.choice(products)
            region = random.choice(regions)
            channel = random.choice(channels)
            segment = random.choice(segments)
            
            # Custom adjustments
            if product['category'] == 'Electronics' and random.random() < 0.45:
                region = 'North America'
            if product['category'] == 'Fashion' and random.random() < 0.4:
                region = 'Europe'
                
            # Quantity Logic
            if product['price'] < 50:
                qty = random.choice([1, 1, 2, 2, 3, 5])
            elif product['price'] < 200:
                qty = random.choice([1, 1, 1, 2, 3])
            else:
                qty = random.choice([1, 1, 2])
                
            # Discount Logic (15% of transactions)
            price = product['price']
            if random.random() < 0.15:
                discount_rate = random.choice([0.05, 0.10, 0.15])
                price = int(price * (1 - discount_rate))
                
            revenue = price * qty
            cost = product['cost'] * qty
            profit = revenue - cost
            
            # CAC Calculation
            cac = 0
            if segment == 'New':
                if channel == 'Online':
                    cac = random.randint(15, 35)
                elif channel == 'Affiliate':
                    cac = int(revenue * 0.12)
                else:
                    cac = random.randint(5, 15)
                    
            writer.writerow([
                f"TX-{100000 + i}",
                trans_date.strftime('%Y-%m-%d %H:%M:%S'),
                product['id'],
                product['name'],
                product['category'],
                qty,
                price,
                revenue,
                cost,
                profit,
                region,
                channel,
                segment,
                cac
            ])
            generated_count += 1
            
    print(f"[SUCCESS] Generated {generated_count} transactional sales records in '{output_filepath}'.")
    return output_filepath

# ==============================================================================
# 2. DATA ANALYSIS MODULE
# ==============================================================================

def run_analysis(csv_filepath="fictional_sales_data.csv"):
    """
    Performs analytical processing and business KPI calculations on the sales dataset.
    Uses pandas when available, with clear reporting.
    """
    if not os.path.exists(csv_filepath):
        print(f"[ERROR] The database file '{csv_filepath}' was not found.")
        print(f"Generating a new dataset at '{csv_filepath}' first...")
        generate_fictional_data(csv_filepath)

    try:
        import pandas as pd
    except ImportError:
        print("[WARNING] Pandas is not installed. Running lightweight standard analysis.")
        _run_standard_analysis(csv_filepath)
        return

    print(f"\nLoading sales transaction logs from '{csv_filepath}' via Pandas...")
    df = pd.read_csv(csv_filepath)
    
    # Data Cleaning and Preparation
    df['Date'] = pd.to_datetime(df['Date'])
    df['Margin_Percent'] = (df['Net_Profit'] / df['Revenue']) * 100
    
    print("\n" + "=" * 55)
    print("        AURA SALES BUSINESS ANALYTICS REPORT        ")
    print("=" * 55)
    
    print("\n--- GENERAL BUSINESS KPIs SUMMARY ---")
    total_rev = df['Revenue'].sum()
    total_cost = df['Cost'].sum()
    total_profit = df['Net_Profit'].sum()
    total_units = df['Quantity'].sum()
    avg_order_value = df['Revenue'].mean()
    net_margin = (total_profit / total_rev) * 100
    
    print(f"Total Revenue       : ${total_rev:,.2f}")
    print(f"Total Cost of Goods : ${total_cost:,.2f}")
    print(f"Net Operating Profit: ${total_profit:,.2f}")
    print(f"Gross Margin %      : {net_margin:.2f}%")
    print(f"Total Units Sold    : {total_units:,}")
    print(f"Average Order Value : ${avg_order_value:.2f}")
    
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
    new_cust_df = df[df['Customer_Segment'] == 'New']
    avg_cac = new_cust_df['CAC'].mean() if len(new_cust_df) > 0 else 0
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
    print("=" * 55 + "\n")


def _run_standard_analysis(csv_filepath):
    """Fallback analyzer using pure standard library Python."""
    total_rev = 0
    total_cost = 0
    total_profit = 0
    total_units = 0
    row_count = 0
    categories = {}
    regions = {}

    with open(csv_filepath, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row_count += 1
            rev = float(row['Revenue'])
            cost = float(row['Cost'])
            profit = float(row['Net_Profit'])
            qty = int(row['Quantity'])
            cat = row['Category']
            reg = row['Region']

            total_rev += rev
            total_cost += cost
            total_profit += profit
            total_units += qty

            categories.setdefault(cat, {'revenue': 0, 'profit': 0, 'units': 0})
            categories[cat]['revenue'] += rev
            categories[cat]['profit'] += profit
            categories[cat]['units'] += qty

            regions.setdefault(reg, {'revenue': 0, 'profit': 0})
            regions[reg]['revenue'] += rev
            regions[reg]['profit'] += profit

    avg_order_value = total_rev / row_count if row_count else 0
    net_margin = (total_profit / total_rev * 100) if total_rev else 0

    print("\n--- GENERAL BUSINESS KPIs SUMMARY (Standard Lib) ---")
    print(f"Total Transactions  : {row_count:,}")
    print(f"Total Revenue       : ${total_rev:,.2f}")
    print(f"Total Cost of Goods : ${total_cost:,.2f}")
    print(f"Net Operating Profit: ${total_profit:,.2f}")
    print(f"Gross Margin %      : {net_margin:.2f}%")
    print(f"Total Units Sold    : {total_units:,}")
    print(f"Average Order Value : ${avg_order_value:.2f}")

# ==============================================================================
# 3. UNIFIED CLI INTERFACE & ENTRYPOINT
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AuraSales Unified Data Generator & Analytical Processor",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python sales_analytics.py                   # Run complete pipeline (generate if needed + analyze)
  python sales_analytics.py --generate        # Generate transactional dataset
  python sales_analytics.py --analyze         # Run analytics report
  python sales_analytics.py --all --count 500 # Generate 500 transactions and analyze
        """
    )
    parser.add_argument("-g", "--generate", action="store_true", help="Generate fictional sales data CSV")
    parser.add_argument("-a", "--analyze", action="store_true", help="Run sales and financial analysis")
    parser.add_argument("--all", action="store_true", help="Generate fresh dataset and run analysis")
    parser.add_argument("-f", "--file", default="fictional_sales_data.csv", help="Target CSV file path (default: fictional_sales_data.csv)")
    parser.add_argument("-c", "--count", type=int, default=1000, help="Number of transactions to generate (default: 1000)")

    args = parser.parse_args()

    if args.all:
        generate_fictional_data(output_filepath=args.file, transaction_count=args.count)
        run_analysis(csv_filepath=args.file)
    elif args.generate:
        generate_fictional_data(output_filepath=args.file, transaction_count=args.count)
    elif args.analyze:
        run_analysis(csv_filepath=args.file)
    else:
        # Default behavior: If CSV doesn't exist, generate it; then run analysis
        if not os.path.exists(args.file):
            print(f"[INFO] '{args.file}' not found. Generating dataset first...")
            generate_fictional_data(output_filepath=args.file, transaction_count=args.count)
        run_analysis(csv_filepath=args.file)

if __name__ == "__main__":
    main()
