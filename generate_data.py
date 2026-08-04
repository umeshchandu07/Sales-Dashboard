"""
AuraSales Python Data Generator
Generates a structured, fictional transactional sales CSV dataset for Data Science and Analytics.
Supports standard python libraries for zero-dependency execution.
"""

import csv
import random
from datetime import datetime, timedelta

def generate_fictional_data(output_filepath="fictional_sales_data.csv", transaction_count=1000):
    # Setup data structures
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
    
    # Starting date (12 months ago)
    start_date = datetime.now() - timedelta(days=365)
    
    # Open CSV writer
    with open(output_filepath, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        # Write CSV headers
        writer.writerow([
            'Transaction_ID', 'Date', 'Product_ID', 'Product_Name', 'Category', 
            'Quantity', 'Price', 'Revenue', 'Cost', 'Net_Profit', 'Region', 
            'Channel', 'Customer_Segment', 'CAC'
        ])
        
        random.seed(42) # Reproducible results
        
        for i in range(transaction_count):
            # Calculate dynamic date increments
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
            
    print(f"Success! Fictional sales dataset written to '{output_filepath}'.")

if __name__ == "__main__":
    generate_fictional_data()
