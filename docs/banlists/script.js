const gameSelect = document.getElementById("gameSelect");
const modeSelect = document.getElementById("modeSelect");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");
const infoContainer = document.getElementById("infoContainer");

let games = {};

function fetchGames() {
  fetch("https://raw.githubusercontent.com/tomanyy/SafeWatch/main/data/games.json")
    .then(res => {
      if (!res.ok) throw new Error("Could not load games.json");
      return res.json();
    })
    .then(data => {
      games = data;
      populateGames();
    })
    .catch(err => {
      console.error("Error loading games.json:", err);
    });
}

const userData = {}; // Placeholder for users.json data
const groupData = {}; // Placeholder for groups.json data

function populateGames() {
  for (const game in games) {
    const opt = document.createElement("option");
    opt.value = game;
    opt.textContent = game;
    gameSelect.appendChild(opt);
  }
}

function populateModes() {
  modeSelect.innerHTML = '<option disabled selected>Select a mode</option>';
  const selectedGame = gameSelect.value;
  if (selectedGame && games[selectedGame]) {
    modeSelect.disabled = false;
    games[selectedGame].forEach(mode => {
      const opt = document.createElement("option");
      opt.value = mode;
      opt.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
      modeSelect.appendChild(opt);
    });
  }
}

function fetchBanList(game, mode) {
  const path = `/SafeWatch/BanLists/${game}/${mode}.json`;
  fetch(path)
    .then(res => res.json())
    .then(data => {
      displayResults(data, mode);
    })
    .catch(err => {
      resultsContainer.innerHTML = `<p>Error loading ban list: ${err}</p>`;
    });
}

function displayResults(bannedItems, mode) {
  resultsContainer.innerHTML = "";
  bannedItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.textContent = item.name || item.username || `ID: ${item.id}`;
    div.addEventListener("click", () => showDetails(item, mode));
    resultsContainer.appendChild(div);
  });
}

function showDetails(item, mode) {
  const infoHTML = `
    <h3>Details</h3>
    <p><strong>ID:</strong> ${item.id}</p>
    <p><strong>Name:</strong> ${item.username || item.name}</p>
    ${item.avatar ? `<img src="${item.avatar}" alt="Avatar" style="max-width:100px;">` : ""}
    <p><strong>Reason:</strong> ${item.reason || "N/A"}</p>
  `;
  infoContainer.innerHTML = infoHTML;
}

function handleSearch() {
  const term = searchInput.value.toLowerCase();
  const allItems = Array.from(resultsContainer.children);
  allItems.forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(term) ? "block" : "none";
  });
}

// Event Listeners
gameSelect.addEventListener("change", () => {
  populateModes();
  modeSelect.disabled = false;
});

modeSelect.addEventListener("change", () => {
  const game = gameSelect.value;
  const mode = modeSelect.value;
  if (game && mode) {
    fetchBanList(game, mode);
  }
});

searchInput.addEventListener("input", handleSearch);

// Init
populateGames();
fetchGames();
