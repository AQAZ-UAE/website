
import csv
import os
import re

def parse_csv_stock(csv_path):
    left_stock = []
    right_stock = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
        
    start_row_index = 0
    # Find the header row for the left table to be safe, or just assume row 6 (index 5) has data
    # Based on view_file:
    # Row 5 (index 4) has Model...
    # Row 6 (index 5) has data '15'
    
    for i in range(5, len(rows)):
        row = rows[i]
        if not row: continue
        
        # Parse Left Table
        # Indices: 3 (Model), 5 (Storage), 7 (Country), 9 (Colour), 11 (Available)
        if len(row) > 11:
            model = row[3].strip()
            if model and model.lower() != 'model' and model.lower() != 'gadgets' and model.lower() != 'pices':
                item = {
                    'Model': model,
                    'Storage': row[5].strip() if len(row) > 5 else '',
                    'Country': row[7].strip() if len(row) > 7 else '',
                    'Colour': row[9].strip() if len(row) > 9 else '',
                    'Available': row[11].strip() if len(row) > 11 else '0'
                }
                left_stock.append(item)
                
        # Parse Right Table
        # Indices: 16 (Model), 18 (Storage), 20 (Colour), 22 (Available), 24 (Country)
        if len(row) > 22:
            model_r = row[16].strip()
            if model_r and model_r.lower() != 'model':
                item_r = {
                    'Model': model_r,
                    'Storage': row[18].strip() if len(row) > 18 else '',
                    'Colour': row[20].strip() if len(row) > 20 else '',
                    'Available': row[22].strip() if len(row) > 22 else '0',
                    'Country': row[24].strip() if len(row) > 24 else '' # Might be dashed
                }
                right_stock.append(item_r)

    # Gadgets section logic (optional, seemed to be at bottom of left table)
    # The csv view showed "Gadgets" at row 50.
    # I'll just treat them as items in left_stock for now.
    
    return left_stock + right_stock

def parse_txt_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f if l.strip()]
    
    brand = os.path.basename(file_path).replace('.txt', '')
    products = []
    
    current_product = {}
    
    # Heuristic parsing
    # Usually: Model -> Spec -> Colors
    
    curr_model = None
    curr_specs = None
    curr_colors = None
    
    for line in lines:
        # If line is the brand name, skip or reset
        if line.lower() == brand.lower():
            continue
            
        # Check for specs (contains /, +, GB)
        if re.search(r'\d+[ ]*[Gg][Bb]|[0-9]+[ ]*\/[ ]*[0-9]+|[0-9]+[ ]*\+[ ]*[0-9]+', line):
            curr_specs = line
            continue
            
        # Check for colors (surrounded by parenthesis usually, or comma separated string)
        if line.startswith('(') and line.endswith(')'):
            curr_colors = line
            # If we have a model, we can save this entry
            if curr_model:
                products.append({
                    'Brand': brand,
                    'Model': curr_model,
                    'Specs': curr_specs,
                    'Colors': curr_colors
                })
                # Reset simple state
                # curr_model = None # Keep model? No, usually distinct.
                curr_specs = None
                curr_colors = None
                curr_model = None
            continue
        
        # Assume it's a model name if it's not the others
        # Use previous model if we found specs/colors but parsed a text line now
        if curr_model and (curr_specs or curr_colors):
             # Saved already? No, logic above saves ON colors.
             # What if specs come after?
             pass
             
        curr_model = line
        
    return products

def generate_markdown(consolidated_stock, catalog_products):
    md = "# Consolidated Stock Report\n\n"
    
    md += "## 1. Physical Stock Availability (from Excel)\n"
    md += "Derived from `Stocks.xlsx`.\n\n"
    md += "| Model | Storage/Specs | Colour | Country | Available |\n"
    md += "|-------|---------------|--------|---------|-----------|\n"
    
    total_items = 0
    for item in consolidated_stock:
        qty = item['Available']
        try:
            q = float(qty)
            total_items += q
        except:
            pass
        md += f"| {item['Model']} | {item['Storage']} | {item['Colour']} | {item['Country']} | {item['Available']} |\n"
        
    md += "\n"
    md += f"**Total Items Scanned:** {int(total_items)}\n\n"
    
    md += "## 2. Product Catalog / Reference Lists (from Text Files)\n"
    md += "The following items are listed in the brand text files, representing potential range or spec sheets.\n\n"
    
    files = {}
    for p in catalog_products:
        brand = p['Brand']
        if brand not in files:
            files[brand] = []
        files[brand].append(p)
        
    for brand, items in files.items():
        md += f"### {brand}\n"
        for item in items:
            md += f"- **{item['Model']}**\n"
            if item.get('Specs'):
                md += f"  - Specs: {item['Specs']}\n"
            if item.get('Colors'):
                md += f"  - Colors: {item['Colors']}\n"
        md += "\n"

    return md

if __name__ == "__main__":
    current_dir = os.getcwd()
    csv_path = os.path.join(current_dir, 'stocks_output.csv')
    
    stock_list = parse_csv_stock(csv_path)
    
    catalog = []
    txt_files = [f for f in os.listdir(current_dir) if f.endswith('.txt')]
    for tf in txt_files:
        catalog.extend(parse_txt_file(os.path.join(current_dir, tf)))
        
    report = generate_markdown(stock_list, catalog)
    
    with open('CONSOLIDATED_REPORT.md', 'w', encoding='utf-8') as f:
        f.write(report)
        
    print("Report generated: CONSOLIDATED_REPORT.md")
