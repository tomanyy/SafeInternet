# This script requires python

import re
import json

INPUT_FILE = "Default.raw.txt"
OUTPUT_FILE = "default.json"
DATE_FLAGGED = "2025-05-25" # the date when i created the script and transfered the archive to the new ban list style, im not gonna bother making this automatic

def parse_ids(filename):
    user_ids = []
    with open(filename, "r", encoding="utf-8") as f:
        lines = f.readlines()
        for line in lines:
            line = line.strip()
            if not line:
                continue
            match = re.match(r"^(?:id\s*)?(\d+)$", line, re.IGNORECASE)
            if match:
                user_ids.append(int(match.group(1)))
            else:
                print(f"Skipping invalid line: '{line}'")
    return user_ids

def build_user_objects(user_ids):
    users = []
    for uid in user_ids:
        user = {
            "userId": uid,
            "dateFlagged": DATE_FLAGGED,
            "username": f"User{uid}",  # Placeholder, replace with Roblox API call if needed
            "displayName": f"User {uid}",  # Placeholder
            "avatar": f"https://www.roblox.com/headshot-thumbnail/image?userId={uid}&width=150&height=150&format=png"  # Placeholder URL pattern
        }
        users.append(user)
    return users

def main():
    user_ids = parse_ids(INPUT_FILE)
    user_objects = build_user_objects(user_ids)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(user_objects, f, indent=2)
    print(f"Converted {len(user_objects)} users to JSON in {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

