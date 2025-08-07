import re
import sys

def strip_hashtags(input_path: str, output_path: str):
    # Matches a space, #, digits, then the closing quote (and any following punctuation/spaces)
    pattern = re.compile(r'\s+#\d+(\s*")')
    with open(input_path, 'r', encoding='utf-8') as fin, \
         open(output_path, 'w', encoding='utf-8') as fout:
        for line in fin:
            # Replace " text #123"" → " text""
            cleaned = pattern.sub(r'\1', line)
            fout.write(cleaned)

strip_hashtags("items.json", "items_clean.json")
