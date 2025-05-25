async function loadModes(game) {
  const modeSelect = document.getElementById('mode');
  modeSelect.innerHTML = '<option value="">Loading...</option>';
  modeSelect.disabled = true;

  const url = `https://api.github.com/repos/tomanyy/SafeWatch/contents/BanLists/${game}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    const modes = data
      .filter(item => item.name.endsWith('.json') && !['users.json', 'groups.json', 'games.json'].includes(item.name))
      .map(item => {
        const base = item.name.replace('.json', '');
        return base.charAt(0).toUpperCase() + base.slice(1);
      });

    modeSelect.innerHTML = '<option value="">--Choose Mode--</option>' + modes.map(mode =>
      `<option value="${mode.toLowerCase()}">${mode}</option>`).join('');
    modeSelect.disabled = false;
  } catch (err) {
    console.error('Failed to fetch modes:', err);
    modeSelect.innerHTML = '<option value="">Error loading modes</option>';
  }
}

async function loadBanList() {
  const game = document.getElementById('game').value;
  const mode = document.getElementById('mode').value;
  const listContainer = document.getElementById('banList');
  listContainer.innerHTML = '<p>Loading...</p>';

  const listUrl = `https://raw.githubusercontent.com/tomanyy/SafeWatch/main/BanLists/${game}/${mode}.json`;
  const infoUrl = `https://raw.githubusercontent.com/tomanyy/SafeWatch/main/BanLists/${game}/users.json`;

  try {
    const [listRes, infoRes] = await Promise.all([
      fetch(listUrl),
      fetch(infoUrl)
    ]);

    const bannedIds = await listRes.json();
    const userInfo = await infoRes.json();

    const cards = bannedIds.map(id => {
      const user = userInfo[id] || {};
      return `
        <div class="user-card" onclick="toggleDetails(this)">
          <img src="${user.avatar || ''}" alt="${user.username || 'User'}" />
          <strong>${user.displayName || 'N/A'}</strong>
          <p>@${user.username || 'Unknown'}</p>
          <div class="user-details">
            <p>User ID: ${user.userId || 'N/A'}</p>
            ${user.notes ? `<p>${user.notes}</p>` : ''}
          </div>
        </div>`;
    }).join('');

    listContainer.innerHTML = cards || '<p>No data available.</p>';
  } catch (err) {
    console.error('Error loading ban list:', err);
    listContainer.innerHTML = '<p>Error loading data.</p>';
  }
}

function toggleDetails(card) {
  card.classList.toggle('expanded');
}

function filterUsers() {
  const term = document.getElementById('search').value.toLowerCase();
  const cards = document.querySelectorAll('.user-card');

  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(term) ? 'block' : 'none';
  });
}
