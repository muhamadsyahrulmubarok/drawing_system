// Load tournament data from data.json
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

// Initialize the tournament data
function initTournament() {
	// Load data from localStorage if it exists
	const savedData = localStorage.getItem("tournamentData");
	if (savedData) {
		tournamentData = JSON.parse(savedData);
		previousData = JSON.parse(JSON.stringify(tournamentData));
	}
	updateDisplay();
}

// Function to detect changes and find updated team names
function detectChanges(newData) {
	const changes = [];

	// Check each sport
	Object.keys(newData.sports).forEach((sportName) => {
		const newSport = newData.sports[sportName];
		const oldSport = previousData.sports[sportName];

		// Check teams
		newSport.teams.forEach((team, index) => {
			if (team && team !== oldSport.teams[index]) {
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

	return changes;
}

// Function to show modal with confetti
function showUpdateModal(changes) {
	if (changes.length === 0) return;

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
function changeSport() {
	const sportSelect = document.getElementById("sportSelect");
	tournamentData.currentSport = sportSelect.value;
	localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
	updateDisplay();
}

// Save teams from admin panel
function saveTeams() {
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
	localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
	updateDisplay();
	alert("Teams saved successfully!");
}

// Save match results from admin panel
function saveResults() {
	console.log("Saving results...");
	const winners = {
		match1: document.getElementById("winner1").value,
		match2: document.getElementById("winner2").value,
		final: document.getElementById("champion").value,
	};

	console.log("Winners to save:", winners);
	tournamentData.sports[tournamentData.currentSport].winners = winners;
	localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
	updateDisplay();
	alert("Results saved successfully!");
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
function startAutoUpdate() {
	setInterval(() => {
		const savedData = localStorage.getItem("tournamentData");
		if (savedData) {
			const newData = JSON.parse(savedData);
			if (JSON.stringify(newData) !== JSON.stringify(tournamentData)) {
				// Detect changes before updating
				const changes = detectChanges(newData);

				// Update the data
				tournamentData = newData;
				updateDisplay();

				// Show modal if there are changes
				if (changes.length > 0) {
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
