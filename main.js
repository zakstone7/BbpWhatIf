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
	var pickedWinners = buildWinningTeamsFromCheckBoxes();
	pickRankings = calculatePointTotalsFromWinningTeams(pickedWinners);

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

function buildWinningTeamsFromCheckBoxes() {
	var checkboxPicks = document.querySelectorAll('.game-pick-cb');
	var pickedWinners = [];

	for (var i = 0; i < checkboxPicks.length; i++) 
		if (checkboxPicks[i].checked)
			pickedWinners.push(checkboxPicks[i].getAttribute('data-team'));

	return pickedWinners;
}

function calculatePointTotalsFromWinningTeams(pickedWinners) {
	var pickRankings = [];
	var week = getWeek();

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

	return pickRankings;
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
				<td><a href="javascript:toggleAnaylysisPage('${pickRankings[i].name}');">Analysis</a></td>
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

function toggleAnaylysisPage(name) {
	document.getElementById('main').style.display = 'none';
	document.getElementById('analysis-form').style.display = 'flex';
	var analysisDiv = document.getElementById('analysis');
	analysisDiv.style.display = 'block';

	analysisDiv.querySelector('h1').innerText = `Paths To Victory For ${name}`;
	document.getElementById('anaylsis-name-input').value = name;
}

function analyze() {
	setTimeout(() => {
		document.getElementById('analysis-form').style.display = 'none';
	}, 10);

	var name = document.getElementById('anaylsis-name-input').value;
	var includeTies = document.getElementById('include-ties-cb').checked;

	var week = getWeek();

	var undecidedGames = [];
	for (var i = 0; i < week.games.length; i ++)
		if (!week.winners.includes(week.games[i].home) && !week.winners.includes(week.games[i].away)
			&& !week.ties.includes(week.games[i].home) && !week.ties.includes(week.games[i].away))
			undecidedGames.push(week.games[i]);

	var numberOfPosssibleScenarios = Math.pow(includeTies ? 3 : 2, undecidedGames.length);
	numberOfPosssibleScenarios = numberOfPosssibleScenarios == 1 ? 0 : numberOfPosssibleScenarios;
	var winningScenarios = [];

	displayAnalysisProgressIntial(0, numberOfPosssibleScenarios, 0);

	if (undecidedGames.length > 0) {
		runScenarios(name, includeTies, undecidedGames, winningScenarios, week.winners, week.games.length, week.ties);

		var mustWins = findMustWinGames(week.games, winningScenarios);
		displayMustWinGames(mustWins, week.games);

		if (week.games.length > mustWins.length) {
			displayWinningScenarios(winningScenarios, mustWins, week.games);
		}
	}
}

function incrementNumberSearched() {
	setTimeout(function() {	    
		var searchedSpan = document.getElementById('number-searched');
		searchedSpan.innerText = parseInt(searchedSpan.innerText) + 1;   
	}, 1);
}

function incrementWinningNumber() {
	setTimeout(function() {
		var winningNumberSpan = document.getElementById('winning-scenario-number');
		winningNumberSpan.innerText = parseInt(winningNumberSpan.innerText) + 1;
	}, 1);
}

function displayAnalysisProgressIntial(numberSearched, numberPossible, winningNumber) {
	document.querySelector('#analysis h4').innerHTML = `<span id="number-searched">${numberSearched}</span> of ${numberPossible} possible outcomes tested.  <span id="winning-scenario-number">${winningNumber}</span> winning outcomes found.`;
}

function runScenarios(name, includeTies, undecidedGames, winningScenarios, currentWinningStack, totalGames, currentTiesStack) {
	if (currentWinningStack.length + undecidedGames.length + currentTiesStack.length != totalGames) return;

	if (undecidedGames.length == 0){
		incrementNumberSearched();

		if (personWon(calculatePointTotalsFromWinningTeams(currentWinningStack), name)) {
			winningScenarios.push({ winners: currentWinningStack });
			incrementWinningNumber();
		}
	}
	else {
		while (undecidedGames.length > 0) {
			var currentGame = undecidedGames.shift();

			var clonedWiners = cloneArray(currentWinningStack);
			clonedWiners.push(currentGame.home);

			runScenarios(name, includeTies, cloneArray(undecidedGames), winningScenarios, clonedWiners, totalGames, cloneArray(currentTiesStack));

			var clonedWiners2 = cloneArray(currentWinningStack);
			clonedWiners2.push(currentGame.away);

			runScenarios(name, includeTies, cloneArray(undecidedGames), winningScenarios, clonedWiners2, totalGames, currentTiesStack, cloneArray(currentTiesStack));

			if (includeTies) {
				runScenarios(name, includeTies, cloneArray(undecidedGames), winningScenarios, cloneArray(currentWinningStack), totalGames, cloneArray(currentTiesStack));
			}
		}
	}
}

function personWon(scores, name){
	var max = Math.max.apply(Math, scores.map(function(o) { return o.score; }));
	return scores.find(x => x.name == name).score == max;
}

function findMustWinGames(games, winningScenarios) {
	var mustWins = [];

	for (var i = 0; i < games.length; i++) {
		if (isMustWin(games[i].home, winningScenarios)) {
			mustWins.push(games[i].home)
		}
		else if (isMustWin(games[i].away, winningScenarios)) {
			mustWins.push(games[i].away)
		}
	}

	return mustWins;
}

function isMustWin(team, winningScenarios) {
	for (var i = 0; i < winningScenarios.length; i++) {
		if (!winningScenarios[i].winners.includes(team)){
			return false;
		}
	}
	return true;
}

function findOponentByTeam(team, games) {
	var game = games.find(x => x.home == team || x.away == team);
	return game.home == team ? game.away : game.home;
}

function displayMustWinGames(mustWinTeams, games) {
	setTimeout(() => {
		if (mustWinTeams.length > 0){
			document.getElementById('must-win-games-outer').style.display = 'flex';
		}

		var mustWinGamesUL = document.getElementById('must-win-games');
		for (var i = 0; i < mustWinTeams.length; i++) {
			mustWinGamesUL.innerHTML += `<li>${mustWinTeams[i]} defeats ${findOponentByTeam(mustWinTeams[i], games)}</li>`;
		}
	}, 10);
}

function displayWinningScenarios(winningScenarios, mustWins, games) {
	setTimeout(() => {
		document.getElementById('winning-scenarios-outer').style.display = 'flex';
		var winningScenariosDiv = document.getElementById('winning-scenarios');

		for (var i = 0; i < winningScenarios.length; i ++){
			var scenario = winningScenarios[i];
			var htmlString = '<ol class="winning-scenario">';

			for (var j = 0; j < scenario.winners.length; j++){
				if (!mustWins.includes(scenario.winners[j])){
					htmlString += `<li>${scenario.winners[j]} defeats ${findOponentByTeam(scenario.winners[j], games)}`;
				}
			}

			htmlString += '</ol>';

			winningScenariosDiv.innerHTML += htmlString;
		}

	}, 1000)
}

function cloneArray(array) {
	var newArrary = [];

	for (var i = 0; i < array.length; i++) {
		newArrary.push(array[i]);
	}

	return newArrary;
}

function initialize() {
	buildWeekSpinner();
	queryESPN(querySuccessCallback, queryFailureCallback, queryFinallyCallback);
}

function queryESPN(callback, failureCallback, finallyCallback) {
	var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
           		var responseObject = JSON.parse(xmlhttp.responseText)
           		callback(responseObject);
           }
           else {
               failureCallback();
           }

           finallyCallback();
        }
    };

    xmlhttp.open("GET", "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard", true);
    xmlhttp.send();
}

function querySuccessCallback(response) {
	try {
		if (response.week.number == weekPicker.value) {
			for (var i = 0; i < response.events.length; i++) {
				if (response.events[i].status.type.completed) {
					var winner = response.events[i].competitions[0].competitors.find(x => x.winner);

					if (winner) {
						getWeek().winners.push(winner.team.abbreviation);
					}
				}
			}
		}
	}
	catch {}
}

function queryFailureCallback() {
	alert('Could not reach ESPN for live updates.');
}

function queryFinallyCallback() {
	document.querySelector('th').classList.add('sort-ascending');
	buildGameBoxes();
	calculatePoints();
}

initialize();
