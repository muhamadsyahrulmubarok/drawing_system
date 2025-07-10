const allowedSports = [
	"Tarik Tambang",
	"Badminton Ganda Putra",
	"Badminton Campuran",
	"Futsal",
];

let tournamentData = {
	currentSport: "Tarik Tambang",
	sports: {
		"Tarik Tambang": {
			teams: ["", "", "", ""],
			winners: {
				match1: "",
				match2: "",
				final: "",
			},
		},
		"Badminton Ganda Putra": {
			teams: ["", "", "", ""],
			winners: {
				match1: "",
				match2: "",
				final: "",
			},
		},
		"Badminton Campuran": {
			teams: ["", "", "", ""],
			winners: {
				match1: "",
				match2: "",
				final: "",
			},
		},
		Futsal: {
			teams: ["", "", "", ""],
			winners: {
				match1: "",
				match2: "",
				final: "",
			},
		},
	},
};

// Store previous data for comparison
let previousData = JSON.parse(JSON.stringify(tournamentData));

// Function to fetch data from action.php
async function fetchData() {
	try {
		const response = await fetch("action.php?action=read");
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		// console.log("Fetched data:", data);

		// Convert data.json structure to our internal structure
		const convertedData = {
			currentSport: tournamentData.currentSport,
			sports: {},
		};

		if (data.sports) {
			data.sports.forEach((sport) => {
				if (sport.brackets && sport.brackets.length >= 3) {
					const round1 = sport.brackets[0].matches;
					const round2 = sport.brackets[1].matches;
					const round3 = sport.brackets[2].matches;
					// console.log("Processing sport:", sport.name, "round1:", round1);

					convertedData.sports[sport.name] = {
						teams: [
							round1[0]?.team1 || "",
							round1[1]?.team1 || "",
							round1[0]?.team2 || "",
							round1[1]?.team2 || "",
						],
						winners: {
							match1: round2[0]?.team1 || "",
							match2: round2[0]?.team2 || "",
							final: round3[0]?.team1 || "",
						},
					};
				}
			});
		}

		return convertedData;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

// Initialize the tournament data
async function initTournament() {
	const data = await fetchData();
	if (data) {
		tournamentData = data;
		previousData = JSON.parse(JSON.stringify(tournamentData));
		updateDisplay();
	}
}

// Update the display
function updateDisplay() {
	const currentSportData = tournamentData.sports[tournamentData.currentSport];
	const titleDiv = document.getElementById("sportTitle");
	const bracketDiv = document.getElementById("bracketContainer");

	// Update title
	titleDiv.textContent = tournamentData.currentSport;

	// Create bracket HTML
	let html = "<div class='bracket'>";

	// First Round
	html += "<div class='round'>";
	// Match 1: Team 1 vs Team 3
	html += `<div class='match'><div class='team'>${
		currentSportData.teams[0] || "Team 1"
	}</div><div class='team'>${
		currentSportData.teams[2] || "Team 3"
	}</div></div>`;
	// Match 2: Team 2 vs Team 4
	html += `<div class='match'><div class='team'>${
		currentSportData.teams[1] || "Team 2"
	}</div><div class='team'>${
		currentSportData.teams[3] || "Team 4"
	}</div></div>`;
	html += "</div>";

	// Final Round
	html += "<div class='round'>";
	html += `<div class='match final'><div class='team'>${
		currentSportData.winners.match1 || "Winner 1"
	}</div><div class='team'>${
		currentSportData.winners.match2 || "Winner 2"
	}</div></div>`;
	html += "</div>";

	// Champion
	html += "<div class='round'>";
	html += `<div class='match champion'><div class='team'>${
		currentSportData.winners.final || "Champion"
	}</div></div>`;
	html += "</div>";

	html += "</div>";
	bracketDiv.innerHTML = html;
}

// Function to detect changes and find updated team names
function detectChanges(newData) {
	const changes = [];
	// console.log("Detecting changes between:", newData, "and", previousData);

	// Check each sport
	Object.keys(newData.sports).forEach((sportName) => {
		const newSport = newData.sports[sportName];
		const oldSport = previousData.sports[sportName];

		if (!oldSport) {
			// New sport added
			newSport.teams.forEach((team, index) => {
				if (team) {
					changes.push({
						type: "team",
						name: team,
						sport: sportName,
						position: `Team ${index + 1}`,
					});
				}
			});
			return;
		}

		// Check teams
		newSport.teams.forEach((team, index) => {
			if (team && team !== oldSport.teams[index]) {
				// console.log("Team change detected:", team, "in", sportName);
				changes.push({
					type: "team",
					name: team,
					sport: sportName,
					position: `Team ${index + 1}`,
				});
			}
		});

		// Check winners
		Object.keys(newSport.winners).forEach((winnerKey) => {
			if (
				newSport.winners[winnerKey] &&
				newSport.winners[winnerKey] !== oldSport.winners[winnerKey]
			) {
				// console.log(
				// 	"Winner change detected:",
				// 	newSport.winners[winnerKey],
				// 	"in",
				// 	sportName
				// );
				changes.push({
					type: "winner",
					name: newSport.winners[winnerKey],
					sport: sportName,
					position:
						winnerKey === "final"
							? "Champion"
							: `Winner ${winnerKey.replace("match", "")}`,
				});
			}
		});
	});

	// console.log("Changes detected:", changes);
	return changes;
}

// Function to show modal with confetti
function showUpdateModal(changes) {
	if (changes.length === 0) return;

	// console.log("Showing modal for changes:", changes);

	const modal = document.getElementById("updateModal");
	const modalTeamName = document.getElementById("modalTeamName");

	// Show the first change (or combine multiple)
	const change = changes[0];
	modalTeamName.textContent = change.name;

	// Show modal
	modal.classList.add("show");

	// Trigger confetti
	triggerConfetti();

	// Auto-hide modal after 5 seconds
	setTimeout(() => {
		closeModal();
	}, 5000);
}

// Function to trigger confetti
function triggerConfetti() {
	if (typeof confetti !== "undefined") {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: [
				"#ffd700",
				"#ff6b6b",
				"#4ecdc4",
				"#45b7d1",
				"#96ceb4",
				"#feca57",
			],
		});
	}
}

// Function to close modal
function closeModal() {
	const modal = document.getElementById("updateModal");
	if (modal) {
		modal.classList.remove("show");
	}
}

// Handle keyboard navigation
async function handleKey(e) {
	if (e.key === "ArrowRight") {
		const currentIndex = allowedSports.indexOf(tournamentData.currentSport);
		const nextIndex = (currentIndex + 1) % allowedSports.length;
		tournamentData.currentSport = allowedSports[nextIndex];
		updateDisplay();
	} else if (e.key === "ArrowLeft") {
		const currentIndex = allowedSports.indexOf(tournamentData.currentSport);
		const prevIndex =
			(currentIndex - 1 + allowedSports.length) % allowedSports.length;
		tournamentData.currentSport = allowedSports[prevIndex];
		updateDisplay();
	}
}

// Check for updates every second
async function startAutoUpdate() {
	setInterval(async () => {
		const newData = await fetchData();
		if (newData) {
			// console.log("Converted data:", newData);
			// console.log("Current tournament data:", tournamentData);

			if (JSON.stringify(newData) !== JSON.stringify(tournamentData)) {
				// console.log("Data changed, detecting changes...");
				// Detect changes before updating
				const changes = detectChanges(newData);

				// console.log("Changes detected:", changes);
				// Update the data
				tournamentData = newData;
				updateDisplay();

				// Show modal if there are changes
				if (changes.length > 0) {
					// console.log("Showing modal for changes:", changes);
					showUpdateModal(changes);
				}

				// Update previous data for next comparison
				previousData = JSON.parse(JSON.stringify(tournamentData));
			}
		}
	}, 1000);
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", function () {
	initTournament();
	document.addEventListener("keydown", handleKey);
	startAutoUpdate();
});

// Make closeModal function globally available
window.closeModal = closeModal;
