// File: Docs/banlists.js

document.addEventListener("DOMContentLoaded", () => {
  const gameSelect = document.getElementById("gameSelect");
  const modeSelect = document.getElementById("modeSelect");
  const searchInput = document.getElementById("searchInput");
  const banListContainer = document.getElementById("banListContainer");

  async function loadGames() {
    try {
      const res = await fetch("https://api.github.com/repos/tomanyy/SafeWatch/contents/BanLists");
      const data = await res.json();

      const games = data.filter(item => item.type === "dir");

      games.forEach(game => {
        const option = document.createElement("option");
        option.value = game.name;
        option.textContent = capitalize(game.name);
        gameSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load games:", err);
    }
  }

  async function loadModes(game) {
    try {
      const res = await fetch(`https://api.github.com/repos/tomanyy/SafeWatch/contents/BanLists/${game}`);
      const data = await res.json();

      modeSelect.innerHTML = '<option disabled selected>Select Mode</option>';
      data.filter(file => file.name.endsWith(".json"))
          .forEach(file => {
            const mode = file.name.replace(".json", "");
            const option = document.createElement("option");
            option.value = mode;
            option.textContent = capitalize(mode);
            modeSelect.appendChild(option);
          });

      modeSelect.disabled = false;
    } catch (err) {
      console.error("Failed to load modes:", err);
    }
  }

  async function loadBanList(game, mode) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/tomanyy/SafeWatch/main/BanLists/${game}/${mode}.json`);
      const data = await res.json();
    
      // Extract array if data is an object (e.g. { users: [...] })
      const list = Array.isArray(data)
        ? data
        : Object.values(data).find(v => Array.isArray(v));
    
      if (!Array.isArray(list)) {
        throw new Error("Ban list data is not an array.");
      }
    
      displayBans(list);
    
      searchInput.disabled = false;
      searchInput.oninput = () => filterList(list);
    } catch (err) {
      console.error("Error loading ban list:", err);
    }
  }


  async function displayBans(data) {
    banListContainer.innerHTML = "";

    for (const entry of data) {
      const enriched = await enrichUserData(entry);
      const card = document.createElement("div");
      card.className = "ban-card";

      card.innerHTML = `
        <img src="${enriched.avatar}" alt="Avatar" class="avatar">
        <div class="info">
          <h3>${enriched.displayName}</h3>
          <p>@${enriched.username}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        showDetails(enriched);
      });

      banListContainer.appendChild(card);
    }
  }

  async function enrichUserData(entry) {
    const userId = entry.userId;

    let username = entry.username || null;
    let displayName = entry.displayName || null;

    if (!username || !displayName) {
      try {
        const res = await fetch(`https://users.roblox.com/v1/users/${userId}`);
        const info = await res.json();
        username = username || info.name;
        displayName = displayName || info.displayName;
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    }

    const avatarURL = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=png`;

    return {
      userId,
      username,
      displayName,
      dateFlagged: entry.dateFlagged,
      avatar: avatarURL
    };
  } 



  function filterList(data) {
    const query = searchInput.value.toLowerCase();
    const filtered = data.filter(entry =>
      entry.username.toLowerCase().includes(query) ||
      (entry.displayName && entry.displayName.toLowerCase().includes(query))
    );
    displayBans(filtered);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Event bindings
  gameSelect.addEventListener("change", () => {
    const game = gameSelect.value;
    modeSelect.disabled = true;
    searchInput.disabled = true;
    banListContainer.innerHTML = "";
    loadModes(game);
  });

  modeSelect.addEventListener("change", () => {
    const game = gameSelect.value;
    const mode = modeSelect.value;
    loadBanList(game, mode);
  });

  loadGames();
});