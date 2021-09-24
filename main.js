var weekPicker = document.getElementById('week-picker');
var gamesRow = document.getElementById('games');

function buildWeekSpinner() {
	for (var i = 0; i < weeks.length; i++){
		var selected = i + 1 == weeks.length;
		weekPicker.innerHTML += `<option ${selected ? 'selected' : ''} value="${i + 1}">Week ${i + 1}</option>`;
	}
}

function buildGameBoxes() {
	gamesRow.innerHTML = '';
	var week = getWeek();

	for (var i = 0; i < week.games.length; i++){
		var homeWinner = week.winners.includes(week.games[i].home);
		var awayWinner = week.winners.includes(week.games[i].away);
		var tied = week.ties.includes(week.games[i].home) || week.ties.includes(week.games[i].away)
		var decided = homeWinner || awayWinner || tied;

		gamesRow.innerHTML += `
			<div class="game">
				<div>${week.games[i].away} @ ${week.games[i].home}</div>
				<div>${week.games[i].away} <input ${decided ? 'disabled' : ''} data-team="${week.games[i].away}" class="game-pick-cb away" onchange="onGameCheckboxChecked(this);" type="checkbox" ${awayWinner ? 'checked' : ''} /></div>
				<div>${week.games[i].home} <input ${decided ? 'disabled' : ''} data-team="${week.games[i].home}" class="game-pick-cb home" onchange="onGameCheckboxChecked(this);" type="checkbox" ${homeWinner ? 'checked' : ''}/></div>
				<div>TIE <input ${decided ? 'disabled' : ''} class="game-pick-cb tie" onchange="onGameCheckboxChecked(this);" type="checkbox" ${(tied || !decided) ? 'checked' : ''} /></div>
			</div>
		`;
	}
}

function calculatePoints() {
	var week = getWeek();

	var checkboxPicks = document.querySelectorAll('.game-pick-cb');
	var pickedWinners = [];

	for (var i = 0; i < checkboxPicks.length; i++) 
		if (checkboxPicks[i].checked)
			pickedWinners.push(checkboxPicks[i].getAttribute('data-team'));

	var pickRankings = [];

	for (var i = 0; i < week.picks.length; i++) {
		var p = week.picks[i];
		var personScore = { 'name': p.name, 'score': 0 };

		for (var j = 0; j < p.games.length; j++)
			if (pickedWinners.includes(p.games[j].team))
				personScore.score += parseInt(p.games[j].points);

		pickRankings.push(personScore);
	}

	pickRankings = pickRankings.sort((x, y) => y.score - x.score);

	var previousScore = 999999;
	var previousRank = 0;

	for (var i = 0; i < pickRankings.length; i++) {
		if (personScore == pickRankings[i].score) {
			pickRankings[i].rank = previousRank;
		}
		else {
			previousRank = i + 1;
			pickRankings[i].rank = previousRank;
			personScore = pickRankings[i].score;
		}
	}

	buildTable(pickRankings);
}

function onGameCheckboxChecked(cb) {
	var gameBox = cb.parentElement.parentElement;
	var allCBs = gameBox.querySelectorAll('.game-pick-cb');

	for (var i = 0; i < allCBs.length; i++)
		if (allCBs[i] != cb)
			allCBs[i].checked = false;

	calculatePoints();
}

function onWeekSpinnerChange() {
	buildGameBoxes();
	calculatePoints();
}

function buildTable(pickRankings) {
	var tbody = document.querySelector('tbody');
	tbody.innerHTML = '';

	for (var i = 0; i < pickRankings.length; i++){
		tbody.innerHTML += `
			<tr>
				<td>${pickRankings[i].rank}</td>
				<td>${pickRankings[i].name}</td>
				<td>${pickRankings[i].score}</td>
			</tr>
		`;
	}
}

function getWeek() {	
	var weekIndex = parseInt(weekPicker.value) - 1;
	return weeks[weekIndex];
}

function initialize() {
	buildWeekSpinner();
	buildGameBoxes();
	calculatePoints();
}

initialize();