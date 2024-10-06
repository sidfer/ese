let scene, camera, renderer, stars;
const starCount = 10000; // Number of stars
let exoplanets = []; // Store all fetched exoplanets
let currentIndex = 0;
const loadCount = 10; // Number of exoplanets to load each time

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('starMap'), alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);

    addStars();
    animate();

    window.addEventListener('resize', onWindowResize, false);
}

function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const cameraZ = camera.position.z; // Initial z position of stars relative to the camera
    const fov = camera.fov * (Math.PI / 180); // Convert FOV to radians
    const aspectRatio = window.innerWidth / window.innerHeight;

    // Calculate the visible height and width at the camera's z-position
    const visibleHeight = 2 * Math.tan(fov / 2) * cameraZ;
    const visibleWidth = visibleHeight * aspectRatio;

    for (let i = 0; i < starCount; i++) {
        // Spread stars across the entire screen at random positions
        positions[i * 3] = (Math.random() - 0.5) * visibleWidth * 10;  // x spread out more
        positions[i * 3 + 1] = (Math.random() - 0.5) * visibleHeight * 10; // y spread out more
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 100; // z in depth

        sizes[i] = Math.random() * 0.5 + 0.1; // Random smaller star sizes
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');

    const starMaterial = new THREE.PointsMaterial({
        size: 0.5, // Smaller initial size
        sizeAttenuation: true,
        map: starTexture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function animate() {
    requestAnimationFrame(animate);

    // Move each star towards the camera and reset stars individually
    stars.geometry.attributes.position.array.forEach((value, index) => {
        if (index % 3 === 2) { // Only update the z-coordinate
            stars.geometry.attributes.position.array[index] += 0.05; // Speed of movement

            // Smoothly reset stars individually if they move past the camera
            if (stars.geometry.attributes.position.array[index] > 5) {
                stars.geometry.attributes.position.array[index] = -100; // Push far back in the scene

                // Ensure stars respawn within the visible screen area
                const cameraZ = camera.position.z;
                const fov = camera.fov * (Math.PI / 180);
                const aspectRatio = window.innerWidth / window.innerHeight;
                const visibleHeight = 2 * Math.tan(fov / 2) * cameraZ;
                const visibleWidth = visibleHeight * aspectRatio;

                stars.geometry.attributes.position.array[index - 1] = (Math.random() - 0.5) * visibleHeight * 10; // Randomize y position
                stars.geometry.attributes.position.array[index - 2] = (Math.random() - 0.5) * visibleWidth * 10;  // Randomize x position
            }
        }
    });

    stars.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = init;

// Function to search for a selected planet
async function searchPlanet(planetName) {
    console.log("Searching for planet:", planetName);
    const apiUrl = `http://localhost:3000/api/exoplanets?name=${planetName}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        if (data.length === 0) {
            document.getElementById("result").innerHTML = "No planet found!";
        }

        const scriptRunUrl = `http://localhost:3000/api/run-script`;
        const scriptResponse = await fetch(scriptRunUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ra_exo: data[0].ra,
                dec_exo: data[0].dec,
                distance_exo: data[0].sy_dist,
            }),
        });

        if (!scriptResponse.ok) {
            throw new Error(`Failed to run Python script: ${scriptResponse.status}`);
        }
        const scriptOutput = await scriptResponse.text();
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("result").innerHTML = "An error occurred: " + error.message;
    }
}

// Function to fetch all planets initially and setup lazy loading
async function fetchAllPlanets() {
  const apiUrl = "http://localhost:3000/api/all-planets"; // Your API endpoint
  try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      const planetOptions = document.getElementById("planetOptions");
      planetOptions.innerHTML = ''; // Clear existing options

      if (data.length === 0) {
          console.error("No planets found!");
          return; // Exit if no planets
      }

      // Populate the dropdown with planet names
      data.forEach((planet) => {
          const option = document.createElement("li");
          option.className = "p-4 text-white cursor-pointer hover:bg-blue-500";
          option.textContent = planet.pl_name;
          option.onclick = () => {
            console.log(`Planet selected: ${planet.pl_name}`); // Log the planet name
            selectPlanet(planet.pl_name); // Call selectPlanet to handle selection
        };
          planetOptions.appendChild(option);
      });
  } catch (error) {
      console.error("Error fetching planets:", error);
  }
}

// Show or hide the dropdown menu
function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("hidden");
}

// Select planet and hide dropdown
function selectPlanet(planetName) {
  document.getElementById("dropdownButton").textContent = planetName;
  document.getElementById("dropdownMenu").classList.add("hidden");
  searchPlanet(planetName); // Call the search function with the selected planet
}

// Close the dropdown when clicking outside
window.onclick = function(event) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (!event.target.matches('#dropdownButton') && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.add("hidden");
  }
};

// Call the fetchAllPlanets on window load
window.onload = async function() {
    init(); // Initialize Three.js
    await fetchAllPlanets(); // Fetch all exoplanets
    document.getElementById("dropdownButton").onclick = toggleDropdown; // Toggle dropdown on button click
};
