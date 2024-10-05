const { spawn } = require("child_process"); // Use CommonJS syntax

function selectPlanet(planetName) {
	document.getElementById("planetName").value = planetName;
	//select the search button
	document.getElementById("searchButton").click();
	// document.getElementById("planetList").classList.add("hidden");
}

async function searchPlanet() {
	const planetName = document.getElementById("planetName").value;
	console.log("Searching for planet:", planetName);
	// console.log("Searching for planet:", planetName);
	const apiUrl = `http://localhost:3000/api/exoplanets?name=${planetName}`;

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error(
				`HTTP error! Status: ${response.status} - ${response.statusText}`
			);
		}

		const data = await response.json();
		console.log(data);

		if (data.length === 0) {
			document.getElementById("result").innerHTML = "No planet found!";
		} else {
			document.getElementById(
				"result"
			).innerHTML = `Planet: ${data[0].pl_name}, RA: ${data[0].ra}, Dec: ${data[0].dec}, Distance: ${data[0].sy_dist}`;
		}

		// call the pythonscript
		const pythonProcess = spawn("python3", ["script.py"]);
		console.log(pythonProcess);
	} catch (error) {
		console.error("Error fetching data:", error);
		document.getElementById("result").innerHTML =
			"An error occurred: " + error.message;
	}
}

async function fetchAllPlanets() {
	const apiUrl = "http://localhost:3000/api/all-planets";
	try {
		// Fetch data from your API endpoint
		const response = await fetch(apiUrl);
		const data = await response.json();

		const planetList = document.getElementById("planetList");
		const planetOptions = document.getElementById("planetOptions");

		// Clear existing options
		planetOptions.innerHTML = "";

		if (data.length === 0) {
			// If no planets are found
			planetOptions.innerHTML =
				"<li class='text-gray-500'>No planets found!</li>";
		} else {
			// Populate with data from JSON
			data.forEach((planet) => {
				const li = document.createElement("li");
				li.textContent = planet.pl_name; // Assuming each planet has a 'name' property
				li.classList.add("text-gray-500"); // Add class for text color
				li.classList.add("cursor-pointer");
				li.onclick = () => selectPlanet(planet.pl_name);
				planetOptions.appendChild(li);
			});
		}

		// Show the dropdown
		planetList.classList.remove("hidden");
	} catch (error) {
		console.error("Error fetching planets:", error);
		const planetOptions = document.getElementById("planetOptions");
		planetOptions.innerHTML =
			"<li class='text-gray-500'>Error fetching data!</li>";
		// Optionally show the dropdown even on error to display the error message
		planetList.classList.remove("hidden");
	}
}
