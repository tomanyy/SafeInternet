document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const platform = document.getElementById("platform").value;
    const details = document.getElementById("details").value.trim();
    const type = document.getElementById("type").value; // "Report" or "Appeal"

    if (!username || !platform || !details || !type) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      username,
      platform,
      details,
      type
    };

    try {
      const response = await fetch("https://workers-playground-icy-boat-b200.tomikquu.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`${type} submitted successfully.`);
        form.reset();
      } else {
        alert(`Failed to submit ${type}. Please try again later.`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again later.");
    }
  });
});
