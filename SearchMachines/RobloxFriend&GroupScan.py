import requests

def get_friends(user_id):
    url = f"https://friends.roblox.com/v1/users/{user_id}/friends"
    response = requests.get(url)
    
    if response.status_code == 200:
        friends_data = response.json()
        print(f"Raw friends data: {friends_data}")  # Debug
        friend_ids = [friend["id"] for friend in friends_data.get("data", [])]
        return friend_ids
    else:
        print(f"Failed to fetch friends for User ID {user_id}: {response.status_code}")
        return []


def get_group_members(group_id):
    url = f"https://groups.roblox.com/v1/groups/{group_id}/users"
    member_ids = []
    while url:
        response = requests.get(url)
        
        if response.status_code == 200:
            group_data = response.json()
            print(f"Raw group data: {group_data}")  # Debug
            member_ids.extend([member["user"].get("userId") for member in group_data.get("data", []) if "user" in member])
            url = group_data.get('nextPageCursor')
            if url:
                url = f"https://groups.roblox.com/v1/groups/{group_id}/users?cursor={url}"
        else:
            print(f"Failed to fetch members for Group ID {group_id}: {response.status_code}")
            break
    return member_ids


def main():
    choice = input("Do you want to fetch friends (F) or group members (G)? ").strip().lower()
    
    if choice == 'f':
        user_ids = input("Enter Roblox user IDs (comma-separated): ").split(',')
        user_ids = [uid.strip() for uid in user_ids]
        
        all_friend_ids = []
        
        for user_id in user_ids:
            friends = get_friends(user_id)
            print(f"Friends of {user_id}: {friends}")
            all_friend_ids.extend(friends)
        
        filename = "friend_ids.txt"
        with open(filename, "w") as file:
            for friend_id in all_friend_ids:
                file.write(f"{friend_id}\n")
        
        print(f"Friend IDs saved to {filename}")
    
    elif choice == 'g':
        group_id = input("Enter Roblox group ID: ").strip()
        
        members = get_group_members(group_id)
        print(f"Members of group {group_id}: {members}")
        
        filename = "group_members.txt"
        with open(filename, "w") as file:
            for member_id in members:
                file.write(f"{member_id}\n")
        
        print(f"Group member IDs saved to {filename}")
    else:
        print("Invalid choice. Please enter 'F' for friends or 'G' for group members.")


if __name__ == "__main__":
    main()
