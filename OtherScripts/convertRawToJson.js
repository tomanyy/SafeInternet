// Node.js is required for this script
// Use "node convertRawToJson.js" to run the script!

const fs = require("fs");
const https = require("https");

const inputFile = "Default.raw.json";
const outputFile = "Default.converted.json";

const dateFlagged = "2025-05-25";

const lines = fs.readFileSync(inputFile, "utf8").split("\n").filter(Boolean);

const userIds = lines.map(line => {
  const match = line.match(/ID\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}).filter(Boolean);

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", reject);
  });
}

async function getUserData(userId) {
  const [userInfo, avatarInfo] = await Promise.all([
    fetchJSON(`https://users.roblox.com/v1/users/${userId}`),
    fetchJSON(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png`)
  ]);

  return {
    userId,
    dateFlagged,
    username: userInfo.name,
    displayName: userInfo.displayName,
    avatar: avatarInfo.data[0]?.imageUrl || ""
  };
}

(async () => {
  const results = [];

  for (const id of userIds) {
    try {
      console.log(`Fetching data for ID ${id}...`);
      const data = await getUserData(id);
      results.push(data);
    } catch (err) {
      console.error(`Failed to fetch data for ID ${id}:`, err.message);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`Output written to ${outputFile}`);
})();
