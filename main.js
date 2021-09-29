var weekPicker = document.getElementById('week-picker');
var gamesRow = document.getElementById('games');
var sorting = "position ascending";
var pickRankings = [];

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
	pickRankings = [];

	for (var i = 0; i < checkboxPicks.length; i++) 
		if (checkboxPicks[i].checked)
			pickedWinners.push(checkboxPicks[i].getAttribute('data-team'));

	for (var i = 0; i < week.picks.length; i++) {
		var p = week.picks[i];
		var personScore = { 'name': p.name, 'score': 0, 'ytdScore': getYTDPerson(week.ytd, p.name).total };

		for (var j = 0; j < p.games.length; j++)
			if (pickedWinners.includes(p.games[j].team)) {
				var awardedPoints = parseInt(p.games[j].points);
				personScore.score += awardedPoints;
				personScore.ytdScore += awardedPoints;
			}


		pickRankings.push(personScore);
	}

	pickRankings = pickRankings.sort((x, y) => y.ytdScore - x.ytdScore);

	var previousScore = 999999;
	var previousRank = 0;

	for (var i = 0; i < pickRankings.length; i++) {
		if (previousScore == pickRankings[i].ytdScore) {
			pickRankings[i].ytdRank = previousRank;
		}
		else {
			previousRank = i + 1;
			pickRankings[i].ytdRank = previousRank;
			previousScore = pickRankings[i].ytdScore;
		}
	}

	pickRankings = pickRankings.sort((x, y) => y.score - x.score);

	previousScore = 999999;
	previousRank = 0;

	for (var i = 0; i < pickRankings.length; i++) {
		if (previousScore == pickRankings[i].score) {
			pickRankings[i].rank = previousRank;
		}
		else {
			previousRank = i + 1;
			pickRankings[i].rank = previousRank;
			previousScore = pickRankings[i].score;
		}
	}

	buildTable();
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

function buildTable() {
	pickRankings = pickRankings.sort(getSortingMethod(sorting));

	var tbody = document.querySelector('tbody');
	tbody.innerHTML = '';

	for (var i = 0; i < pickRankings.length; i++){
		tbody.innerHTML += `
			<tr>
				<td>${pickRankings[i].rank}</td>
				<td>${pickRankings[i].name}</td>
				<td>${pickRankings[i].score}</td>
				<td>${pickRankings[i].ytdScore}</td>
				<td>${pickRankings[i].ytdRank}</td>
			</tr>
		`;
	}

	if (document.getElementById('search-input').value && document.getElementById('search-input').value.length > 0)
		search();
}

function getWeek() {	
	var weekIndex = parseInt(weekPicker.value) - 1;
	return weeks[weekIndex];
}

function getYTDPerson(weekytdArray, name) {
	for (var i = 0; i < weekytdArray.length; i ++)
		if (weekytdArray[i].name == name)
			return weekytdArray[i];
}

function getSortingMethod() {

	switch (sorting) {
		case "position ascending":
			return (x, y) => y.score - x.score;
			break;
		case "position descending":
			return (x, y) => x.score - y.score;
			break;
		case "name ascending":
			return (a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
			break;
		case "name descending":
			return (a, b) => (b.name.toLowerCase() > a.name.toLowerCase()) ? 1 : -1;
			break;
		case "score ascending":
			return (x, y) => y.score - x.score;
			break;
		case "score descending":
			return (x, y) => x.score - y.score;
			break;
		case "ytd-score ascending":
			return (x, y) => y.ytdScore - x.ytdScore;
			break;
		case "ytd-score descending":
			return (x, y) => x.ytdScore - y.ytdScore;
			break;
		case "ytd-position ascending":
			return (x, y) => y.ytdScore - x.ytdScore;
			break;
		case "ytd-position descending":
			return (x, y) => x.ytdScore - y.ytdScore;
			break;
		default: 
			break;
	}

}

function sortClick(th) {
	var column = th.getAttribute('data-column');
	var sortClass = '';

	if (th.classList.contains('sort-ascending')) {
		sortClass = 'sort-descending';
		sorting = `${column} descending`
	}
	else {
		sortClass = 'sort-ascending';
		sorting = `${column} ascending`
	}

	var ths = document.querySelectorAll('th');

	for (var i = 0; i < ths.length; i++){
		ths[i].classList.remove('sort-ascending');
		ths[i].classList.remove('sort-descending');
	}

	th.classList.add(sortClass);

	buildTable();
}

function search() {
	var searchText = document.getElementById('search-input').value.toLowerCase();
	var rows = document.querySelectorAll('tbody tr');

	for (var i = 0; i < rows.length; i++){
		var name = rows[i].querySelectorAll('td')[1].innerText.toLowerCase();

		if (name.includes(searchText))
			rows[i].classList.remove('hide');
		else 
			rows[i].classList.add('hide');
	}
}

function initialize() {
	document.querySelector('th').classList.add('sort-ascending');
	buildWeekSpinner();
	buildGameBoxes();
	calculatePoints();
}

initialize();
