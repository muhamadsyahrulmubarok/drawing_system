// Load tournament data from data.json via action.php
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
		console.log("Fetched data:", data);

		// Convert data.json structure to our internal structure
		if (data.sports) {
			data.sports.forEach((sport) => {
				if (sport.brackets && sport.brackets.length >= 3) {
					const round1 = sport.brackets[0].matches;
					const round2 = sport.brackets[1].matches;
					const round3 = sport.brackets[2].matches;
					console.log("Processing sport:", sport.name, "round1:", round1);

					tournamentData.sports[sport.name] = {
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

		return data;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

// Function to save data to action.php
async function saveData() {
	try {
		// Convert our internal structure to data.json structure
		const dataToSave = {
			sports: Object.keys(tournamentData.sports).map((sportName) => {
				const sportData = tournamentData.sports[sportName];
				return {
					name: sportName,
					brackets: [
						{
							round: 1,
							matches: [
								{
									team1: sportData.teams[0] || "",
									team2: sportData.teams[2] || "",
								},
								{
									team1: sportData.teams[1] || "",
									team2: sportData.teams[3] || "",
								},
							],
						},
						{
							round: 2,
							matches: [
								{
									team1: sportData.winners.match1 || "Winner 1",
									team2: sportData.winners.match2 || "Winner 2",
								},
							],
						},
						{
							round: 3,
							matches: [
								{
									team1: sportData.winners.final || "Champion",
								},
							],
						},
					],
				};
			}),
		};

		const response = await fetch("action.php?action=write", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(dataToSave),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		return result.status === "success";
	} catch (error) {
		console.error("Error saving data:", error);
		return false;
	}
}

// Initialize the tournament data
async function initTournament() {
	await fetchData();
	previousData = JSON.parse(JSON.stringify(tournamentData));
	updateDisplay();
}

// Function to detect changes and find updated team names
function detectChanges(newData) {
	const changes = [];
	console.log("Detecting changes between:", newData, "and", previousData);

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
				console.log("Team change detected:", team, "in", sportName);
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
				console.log(
					"Winner change detected:",
					newSport.winners[winnerKey],
					"in",
					sportName
				);
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

	console.log("Changes detected:", changes);
	return changes;
}

// Function to show modal with confetti
function showUpdateModal(changes) {
	if (changes.length === 0) return;

	console.log("Showing modal for changes:", changes);

	// Create modal if it doesn't exist
	let modal = document.getElementById("updateModal");
	if (!modal) {
		modal = document.createElement("div");
		modal.id = "updateModal";
		modal.className = "modal-overlay";
		modal.innerHTML = `
			<div class="modal-content">
				<div class="modal-title">🎉 Tim Terpilih! 🎉</div>
				<div class="modal-team" id="modalTeamName"></div>
				<div class="modal-message"></div>
				<button class="modal-close" onclick="closeModal()">Close</button>
			</div>
		`;
		document.body.appendChild(modal);

		// Add modal styles if they don't exist
		if (!document.getElementById("modalStyles")) {
			const style = document.createElement("style");
			style.id = "modalStyles";
			style.textContent = `
				.modal-overlay {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: rgba(0, 0, 0, 0.7);
					display: flex;
					justify-content: center;
					align-items: center;
					z-index: 1000;
					opacity: 0;
					visibility: hidden;
					transition: all 0.3s ease;
				}
				
				.modal-overlay.show {
					opacity: 1;
					visibility: visible;
				}
				
				.modal-content {
					background: linear-gradient(135deg, #23326e 0%, #0a1026 100%);
					border: 2px solid rgba(255, 140, 0, 0.5);
					border-radius: 16px;
					padding: 30px;
					text-align: center;
					max-width: 400px;
					width: 90%;
					transform: scale(0.7);
					transition: transform 0.3s ease;
					box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
				}
				
				.modal-overlay.show .modal-content {
					transform: scale(1);
				}
				
				.modal-title {
					color: #ffd700;
					font-size: 1.5em;
					font-weight: bold;
					margin-bottom: 10px;
					text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
				}
				
				.modal-team {
					color: #f3f6fa;
					font-size: 2em;
					font-weight: bold;
					margin: 20px 0;
					text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
					animation: pulse 1.5s infinite;
				}
				
				@keyframes pulse {
					0% { transform: scale(1); }
					50% { transform: scale(1.05); }
					100% { transform: scale(1); }
				}
				
				.modal-message {
					color: #ccc;
					font-size: 1.1em;
					margin-bottom: 20px;
				}
				
				.modal-close {
					background: rgba(255, 140, 0, 0.2);
					color: #f3f6fa;
					border: 1px solid rgba(255, 140, 0, 0.5);
					border-radius: 8px;
					padding: 10px 20px;
					font-size: 1em;
					cursor: pointer;
					transition: all 0.3s ease;
				}
				
				.modal-close:hover {
					background: rgba(255, 140, 0, 0.3);
					transform: translateY(-2px);
				}
			`;
			document.head.appendChild(style);
		}
	}

	const modalTeamName = document.getElementById("modalTeamName");

	// Show the first change (or combine multiple)
	const change = changes[0];
	modalTeamName.textContent = change.name;

	// Show modal
	modal.classList.add("show");

	// Trigger confetti if confetti function exists
	if (typeof confetti !== "undefined") {
		triggerConfetti();
	}

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

// Change sport in admin panel
async function changeSport() {
	const sportSelect = document.getElementById("sportSelect");
	tournamentData.currentSport = sportSelect.value;
	await saveData();
	updateDisplay();
}

// Save teams from admin panel
async function saveTeams() {
	console.log("Saving teams...");
	// Read values from <select> elements for team inputs
	const teams = [
		document.getElementById("team1Input").value,
		document.getElementById("team2Input").value,
		document.getElementById("team3Input").value,
		document.getElementById("team4Input").value,
	];

	console.log("Teams to save:", teams);
	tournamentData.sports[tournamentData.currentSport].teams = teams;
	const success = await saveData();
	if (success) {
		updateDisplay();
		alert("Teams saved successfully!");
	} else {
		alert("Error saving teams!");
	}
}

// Save match results from admin panel
async function saveResults() {
	console.log("Saving results...");
	const winners = {
		match1: document.getElementById("winner1").value,
		match2: document.getElementById("winner2").value,
		final: document.getElementById("champion").value,
	};

	console.log("Winners to save:", winners);
	tournamentData.sports[tournamentData.currentSport].winners = winners;
	const success = await saveData();
	if (success) {
		updateDisplay();
		alert("Results saved successfully!");
	} else {
		alert("Error saving results!");
	}
}

// Update the display on both pages
function updateDisplay() {
	console.log("Updating display...");
	console.log("Current tournament data:", tournamentData);

	const currentSportData = tournamentData.sports[tournamentData.currentSport];

	// Update frontend display
	if (document.getElementById("team1")) {
		console.log("Updating frontend display...");
		const team1 = document.getElementById("team1");
		const team2 = document.getElementById("team2");
		const team3 = document.getElementById("team3");
		const team4 = document.getElementById("team4");

		team1.textContent = currentSportData.teams[0] || "Team 1";
		team2.textContent = currentSportData.teams[1] || "Team 2";
		team3.textContent = currentSportData.teams[2] || "Team 3";
		team4.textContent = currentSportData.teams[3] || "Team 4";

		document.getElementById("final1").textContent =
			currentSportData.winners.match1 || "Winner 1";
		document.getElementById("final2").textContent =
			currentSportData.winners.match2 || "Winner 2";
		document.getElementById("champion").textContent =
			currentSportData.winners.final || "Champion";
	}

	// Update admin panel
	if (document.getElementById("team1Input")) {
		console.log("Updating admin panel...");
		const sportSelect = document.getElementById("sportSelect");
		sportSelect.value = tournamentData.currentSport;

		// Set the value of <select> elements for team inputs
		document.getElementById("team1Input").value = currentSportData.teams[0];
		document.getElementById("team2Input").value = currentSportData.teams[1];
		document.getElementById("team3Input").value = currentSportData.teams[2];
		document.getElementById("team4Input").value = currentSportData.teams[3];

		// Update winner select options
		updateWinnerOptions("winner1", [
			currentSportData.teams[0],
			currentSportData.teams[1],
		]);
		updateWinnerOptions("winner2", [
			currentSportData.teams[2],
			currentSportData.teams[3],
		]);
		updateWinnerOptions("champion", [
			currentSportData.winners.match1,
			currentSportData.winners.match2,
		]);

		// Set selected values for winner selects
		document.getElementById("winner1").value = currentSportData.winners.match1;
		document.getElementById("winner2").value = currentSportData.winners.match2;
		document.getElementById("champion").value = currentSportData.winners.final;
	}

	// Update the main display
	updateMainDisplay();
}

// Update winner select options
function updateWinnerOptions(selectId, teams) {
	const select = document.getElementById(selectId);
	if (!select) return;

	// Clear existing options except the first one (placeholder)
	while (select.options.length > 1) {
		select.remove(1);
	}

	// Add new options for each team (skip empty strings)
	teams.forEach((team) => {
		if (team) {
			const option = document.createElement("option");
			option.value = team;
			option.textContent = team;
			select.appendChild(option);
		}
	});
}

// Update the main display
function updateMainDisplay() {
	const container = document.getElementById("sportsContainer");
	if (!container) return;

	container.innerHTML = "";

	Object.entries(tournamentData.sports).forEach(([sportName, sportData]) => {
		const sportSection = document.createElement("div");
		sportSection.className = "sport-section";

		const title = document.createElement("h2");
		title.className = "sport-title";
		title.textContent = sportName;
		sportSection.appendChild(title);

		const bracket = document.createElement("div");
		bracket.className = "bracket";

		// First Round
		const round1 = document.createElement("div");
		round1.className = "round";

		// Match 1: Team 1 vs Team 3
		const match1 = document.createElement("div");
		match1.className = "match";
		match1.innerHTML = `
			<div class="team">${sportData.teams[0] || "Team 1"}</div>
			<div class="team">${sportData.teams[2] || "Team 3"}</div>
		`;
		round1.appendChild(match1);

		// Match 2: Team 2 vs Team 4
		const match2 = document.createElement("div");
		match2.className = "match";
		match2.innerHTML = `
			<div class="team">${sportData.teams[1] || "Team 2"}</div>
			<div class="team">${sportData.teams[3] || "Team 4"}</div>
		`;
		round1.appendChild(match2);
		bracket.appendChild(round1);

		// Final Round
		const round2 = document.createElement("div");
		round2.className = "round";
		const finalMatch = document.createElement("div");
		finalMatch.className = "match final";
		finalMatch.innerHTML = `
			<div class="team">${sportData.winners.match1 || "Winner 1"}</div>
			<div class="team">${sportData.winners.match2 || "Winner 2"}</div>
		`;
		round2.appendChild(finalMatch);
		bracket.appendChild(round2);

		// Champion
		const round3 = document.createElement("div");
		round3.className = "round";
		const championMatch = document.createElement("div");
		championMatch.className = "match champion";
		championMatch.innerHTML = `
			<div class="team">${sportData.winners.final || "Champion"}</div>
		`;
		round3.appendChild(championMatch);
		bracket.appendChild(round3);

		sportSection.appendChild(bracket);
		container.appendChild(sportSection);
	});
}

// Check for updates every second
async function startAutoUpdate() {
	setInterval(async () => {
		const newData = await fetchData();
		if (newData) {
			// Convert the fetched data to our internal structure for comparison
			const convertedData = {
				currentSport: tournamentData.currentSport,
				sports: {},
			};

			if (newData.sports) {
				newData.sports.forEach((sport) => {
					if (sport.brackets && sport.brackets.length >= 3) {
						const round1 = sport.brackets[0].matches;
						const round2 = sport.brackets[1].matches;
						const round3 = sport.brackets[2].matches;

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

			console.log("Converted data:", convertedData);
			console.log("Current tournament data:", tournamentData);

			if (JSON.stringify(convertedData) !== JSON.stringify(tournamentData)) {
				console.log("Data changed, detecting changes...");
				// Detect changes before updating
				const changes = detectChanges(convertedData);

				console.log("Changes detected:", changes);
				// Update the data
				tournamentData = convertedData;
				updateDisplay();

				// Show modal if there are changes
				if (changes.length > 0) {
					console.log("Showing modal for changes:", changes);
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
	console.log("DOM Content Loaded");
	initTournament();
	startAutoUpdate();
});

// Make closeModal function globally available
window.closeModal = closeModal;
