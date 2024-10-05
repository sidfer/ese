const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS
app.use(express.json());

app.post("/api/run-script", async (req, res) => {
  const { ra_exo, dec_exo, distance_exo } = req.body;

  // Ensure the parameters are provided
  if (
    ra_exo === undefined ||
    dec_exo === undefined ||
    distance_exo === undefined
  ) {
    return res
      .status(400)
      .send(
        "Missing parameters: ra_exo, dec_exo, and distance_exo are required."
      );
  }

  // Build the command with arguments
  const command = `python3 script.py ${ra_exo} ${dec_exo} ${distance_exo}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).send("Error executing script");
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
      return res.status(500).send("Error in script execution");
    }
    console.log(`Script output: ${stdout}`);
    res.send("Script executed successfully");
  });
});
app.post("/api/run-script", async (req, res) => {
  const { ra_exo, dec_exo, distance_exo } = req.body;

  // Ensure the parameters are provided
  if (
    ra_exo === undefined ||
    dec_exo === undefined ||
    distance_exo === undefined
  ) {
    return res
      .status(400)
      .send(
        "Missing parameters: ra_exo, dec_exo, and distance_exo are required."
      );
  }

  // Build the command with arguments
  const command = `python script.py ${ra_exo} ${dec_exo} ${distance_exo}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).send("Error executing script");
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
      return res.status(500).send("Error in script execution");
    }
    console.log(`Script output: ${stdout}`);
    res.send("Script executed successfully");
  });
});

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
