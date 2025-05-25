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
      const entries = Array.isArray(data) ? data : Object.values(data)[0]; // get the first array if data is an object
      if (!Array.isArray(entries)) throw new Error("Ban list data is not an array.");
      displayBans(entries);

      searchInput.disabled = false;
      searchInput.oninput = () => filterList(entries);


      searchInput.disabled = false;
      searchInput.oninput = () => filterList(data);
    } catch (err) {
      console.error("Error loading ban list:", err);
    }
  }

  function displayBans(data) {
    banListContainer.innerHTML = "";
    data.forEach(entry => {
      const card = document.createElement("div");
      card.className = "ban-card";

      card.innerHTML = `
        <img src="${entry.avatar}" alt="Avatar" class="avatar">
        <div class="info">
          <h3>${entry.displayName || entry.username}</h3>
          <p>@${entry.username}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        showDetails(entry);
      });

      banListContainer.appendChild(card);
    });
  }

  function filterList(data) {
    const query = searchInput.value.toLowerCase();
    const filtered = data.filter(entry =>
      entry.username.toLowerCase().includes(query) ||
      (entry.displayName && entry.displayName.toLowerCase().includes(query))
    );
    displayBans(filtered);
  }

  function showDetails(entry) {
    const detailBox = document.createElement("div");
    detailBox.className = "detail-overlay";

    detailBox.innerHTML = `
      <div class="detail-content">
        <button class="close-btn">×</button>
        <pre>${JSON.stringify(entry, null, 2)}</pre>
      </div>
    `;

    detailBox.querySelector(".close-btn").onclick = () => detailBox.remove();
    document.body.appendChild(detailBox);
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