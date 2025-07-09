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
	confetti({
		particleCount: 100,
		spread: 70,
		origin: { y: 0.6 },
		colors: ["#ffd700", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
	});
}

// Function to close modal
function closeModal() {
	const modal = document.getElementById("updateModal");
	modal.classList.remove("show");
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
	initTournament();
	document.addEventListener("keydown", handleKey);
	startAutoUpdate();
});

// Make closeModal function globally available
window.closeModal = closeModal;
