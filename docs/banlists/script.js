// Games and their modes (simulate fetching folder contents)
// You can replace this with an API or a static JSON file later
const games = {
  roblox: ["player", "group", "game"],
  vrchat: ["player", "world"],
  // add more games here
};

// UI elements
const gameSelect = document.getElementById("game-select");
const modeSelectContainer = document.getElementById("mode-select-container");
const banListContainer = document.getElementById("ban-list-container");
const userInfoContainer = document.getElementById("user-info-container");
const searchInput = document.getElementById("search-input");

let currentBanList = [];  // Stores currently loaded banlist entries (for searching)

// Populate game dropdown
function populateGames() {
  for (const gameName in games) {
    const option = document.createElement("option");
    option.value = gameName;
    option.textContent = gameName.charAt(0).toUpperCase() + gameName.slice(1);
    gameSelect.appendChild(option);
  }
}

// Load modes for selected game
function loadModes() {
  const selectedGame = gameSelect.value;
  modeSelectContainer.innerHTML = "";
  banListContainer.innerHTML = "";
  userInfoContainer.innerHTML = "";
  searchInput.value = "";

  if (!selectedGame) return;

  const modes = games[selectedGame];
  if (!modes) return;

  const label = document.createElement("label");
  label.setAttribute("for", "mode-select");
  label.textContent = "Select Mode:";
  modeSelectContainer.appendChild(label);

  const modeSelect = document.createElement("select");
  modeSelect.id = "mode-select";
  modeSelect.onchange = () => loadBanList(selectedGame, modeSelect.value);
  modeSelectContainer.appendChild(modeSelect);

  // Add options
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- Select Mode --";
  modeSelect.appendChild(defaultOption);

  modes.forEach(mode => {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    modeSelect.appendChild(option);
  });
}

// Load banlist JSON and render list
function loadBanList(game, mode) {
  banListContainer.innerHTML = "";
  userInfoContainer.innerHTML = "";
  searchInput.value = "";

  if (!game || !mode) return;

  const url = `https://raw.githubusercontent.com/tomanyy/SafeWatch/main/BanLists/${game}/${mode}.json`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch ban list");
      return res.json();
    })
    .then(data => {
      // Data assumed to be an array of banned users/objects
      currentBanList = data;
      renderBanList(data);
      searchInput.disabled = false;
    })
    .catch(err => {
      banListContainer.textContent = "Error loading ban list: " + err.message;
      currentBanList = [];
      searchInput.disabled = true;
    });
}

// Render the list of banned users/objects (show avatar, username, display name)
function renderBanList(list) {
  banListContainer.innerHTML = "";

  if (!list.length) {
    banListContainer.textContent = "No banned users/objects found.";
    return;
  }

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "banlist-card";
    card.style.cursor = "pointer";

    const avatar = document.createElement("img");
    avatar.src = item.avatar || "https://via.placeholder.com/48?text=No+Avatar";
    avatar.alt = item.username || "Avatar";
    avatar.width = 48;
    avatar.height = 48;
    avatar.style.borderRadius = "50%";
    avatar.style.marginRight = "1rem";
    avatar.style.verticalAlign = "middle";

    const textContainer = document.createElement("span");
    textContainer.style.verticalAlign = "middle";

    const displayName = item.displayName || "—";
    const username = item.username || "Unknown";

    textContainer.innerHTML = `<strong>${displayName}</strong> (${username})`;

    card.appendChild(avatar);
    card.appendChild(textContainer);

    // On click, show detailed info
    card.addEventListener("click", () => {
      showUserInfo(item);
    });

    banListContainer.appendChild(card);
  });
}

// Show detailed info for selected user/object
function showUserInfo(item) {
  userInfoContainer.innerHTML = "";

  if (!item) return;

  const title = document.createElement("h3");
  title.textContent = item.displayName || item.username || "User Info";
  userInfoContainer.appendChild(title);

  const avatar = document.createElement("img");
  avatar.src = item.avatar || "https://via.placeholder.com/96?text=No+Avatar";
  avatar.alt = item.username || "Avatar";
  avatar.width = 96;
  avatar.height = 96;
  avatar.style.borderRadius = "50%";
  userInfoContainer.appendChild(avatar);

  const infoList = document.createElement("ul");

  // Display available fields except avatar (already shown)
  for (const key in item) {
    if (key === "avatar") continue;

    const li = document.createElement("li");
    li.innerHTML = `<strong>${key}:</strong> ${item[key]}`;
    infoList.appendChild(li);
  }

  userInfoContainer.appendChild(infoList);
}

// Filter banlist by search input
function searchBanList() {
  const query = searchInput.value.toLowerCase();
  if (!query) {
    renderBanList(currentBanList);
    return;
  }

  const filtered = currentBanList.filter(item => {
    return (
      (item.username && item.username.toLowerCase().includes(query)) ||
      (item.displayName && item.displayName.toLowerCase().includes(query))
    );
  });

  renderBanList(filtered);
}

// Initialize page
function init() {
  populateGames();

  searchInput.disabled = true;
  searchInput.addEventListener("input", searchBanList);

  gameSelect.addEventListener("change", () => {
    loadModes();
    banListContainer.innerHTML = "";
    userInfoContainer.innerHTML = "";
    searchInput.value = "";
    searchInput.disabled = true;
  });
}

document.addEventListener("DOMContentLoaded", init);
