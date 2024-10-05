const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS
app.use(express.json());

app.get("/api/exoplanets", async (req, res) => {
  const { name } = req.query;
  const apiUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT * FROM pscomppars WHERE pl_name='${name}'&format=json`;

  try {
    // Use dynamic import for node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from exoplanet archive:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/all-planets", async (req, res) => {
  const apiUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT pl_name FROM pscomppars&format=json`;

  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching planet names:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
