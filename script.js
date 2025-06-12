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

// Initialize the tournament data
function initTournament() {
	// Load data from localStorage if it exists
	const savedData = localStorage.getItem("tournamentData");
	if (savedData) {
		tournamentData = JSON.parse(savedData);
	}
	updateDisplay();
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
				tournamentData = newData;
				updateDisplay();
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
