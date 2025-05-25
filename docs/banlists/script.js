// File: Docs/banlists.js

document.addEventListener("DOMContentLoaded", () => {
  const gameSelect = document.getElementById("gameSelect");
  const modeSelect = document.getElementById("modeSelect");
  const searchInput = document.getElementById("searchInput");
  const banListContainer = document.getElementById("banListContainer");

  const games = ["roblox", "vrchat"];

  games.forEach(game => {
    const option = document.createElement("option");
    option.value = game;
    option.textContent = game.charAt(0).toUpperCase() + game.slice(1);
    gameSelect.appendChild(option);
  });

  gameSelect.addEventListener("change", () => {
    const game = gameSelect.value;
    modeSelect.innerHTML = '<option disabled selected>Select Mode</option>';
    modeSelect.disabled = true;
    searchInput.disabled = true;
    banListContainer.innerHTML = '';

    fetch(`https://api.github.com/repos/tomanyy/SafeWatch/contents/BanLists/${game}`)
      .then(res => res.json())
      .then(data => {
        data.filter(file => file.name.endsWith(".json"))
            .forEach(file => {
              const mode = file.name.replace(".json", "");
              const option = document.createElement("option");
              option.value = mode;
              option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
              modeSelect.appendChild(option);
            });
        modeSelect.disabled = false;
      });
  });

  modeSelect.addEventListener("change", () => {
    const game = gameSelect.value;
    const mode = modeSelect.value;

    fetch(`https://raw.githubusercontent.com/tomanyy/SafeWatch/main/BanLists/${game}/${mode}.json`)
      .then(res => res.json())
      .then(data => {
        searchInput.disabled = false;
        displayBans(data);
        searchInput.oninput = () => {
          const query = searchInput.value.toLowerCase();
          const filtered = data.filter(entry =>
            entry.username.toLowerCase().includes(query) ||
            (entry.displayName && entry.displayName.toLowerCase().includes(query))
          );
          displayBans(filtered);
        };
      });
  });

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
        alert(JSON.stringify(entry, null, 2));
      });

      banListContainer.appendChild(card);
    });
  }
});
