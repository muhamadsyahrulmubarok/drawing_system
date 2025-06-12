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

// Initialize the tournament data
function initTournament() {
	// Load data from localStorage if it exists
	const savedData = localStorage.getItem("tournamentData");
	if (savedData) {
		tournamentData = JSON.parse(savedData);
	}
	updateDisplay();
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

// Handle keyboard navigation
function handleKey(e) {
	if (e.key === "ArrowRight") {
		const currentIndex = allowedSports.indexOf(tournamentData.currentSport);
		const nextIndex = (currentIndex + 1) % allowedSports.length;
		tournamentData.currentSport = allowedSports[nextIndex];
		localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
		updateDisplay();
	} else if (e.key === "ArrowLeft") {
		const currentIndex = allowedSports.indexOf(tournamentData.currentSport);
		const prevIndex =
			(currentIndex - 1 + allowedSports.length) % allowedSports.length;
		tournamentData.currentSport = allowedSports[prevIndex];
		localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
		updateDisplay();
	}
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
	initTournament();
	document.addEventListener("keydown", handleKey);
	startAutoUpdate();
});
