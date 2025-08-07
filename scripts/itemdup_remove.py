import json

def remove_duplicates_from_json(input_file, output_file=None):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    seen = set()
    unique_data = []

    for item in data:
        if item not in seen:
            seen.add(item)
            unique_data.append(item)

    out_file = output_file if output_file else input_file
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(unique_data, f, indent=4, ensure_ascii=False)

    print(f"Removed duplicates. Cleaned data saved to {out_file}")

if __name__ == "__main__":
    # Replace with your actual JSON file path:
   
    remove_duplicates_from_json("items.json")
