var games = [];
var gamesTables = document.getElementById('nflheader').querySelectorAll('table.gameScore');
var weekNumber = document.getElementById('fantasyPageHeaderDynamic').querySelector('.filters form > div > div > span').innerText;

for (var i = 0; i < gamesTables.length; i++){
	var cells = gamesTables[i].querySelectorAll('td');
	var away = cells[0].innerText;
	var home = cells[2].innerText;
	games.push({ 'away': away, 'home': home });
}


function parsePick(text) {
	var team = text.replace(/[^a-zA-Z]+/g, '');
	var points = text.replace(/\D/g, "");
	return { 'team': team, 'points': points };
}

var picks = [];
var ytd = [];

var table = document.getElementById('nflplayerRows');
var pickRows = table.querySelectorAll('tr.bg2, tr.bgFan');

for (var i = 0; i < pickRows.length; i++) {
	var row = pickRows[i];
	var cells = row.querySelectorAll('td')
	var name = cells[0].innerText;
	var pick = { "name": name, 'games': [] };
	ytd.push({ "name": name, "total": parseInt(cells[cells.length-1].innerText)});

	for (var j = 1; j < cells.length - 3; j++) {
		var parsedPick = parsePick(cells[j].innerText)
		pick.games.push({ 'team': parsedPick.team, 'points': parsedPick.points });
	}

	picks.push(pick);
}

console.log(`var week${parseInt(weekNumber) + 1}ytd = ${JSON.stringify(ytd)};`)

var javascriptWeekString = 
`var week${weekNumber}Games = ${JSON.stringify(games)};
var week${weekNumber}Picks = ${JSON.stringify(picks)};
var week${weekNumber}Winners = [];
var week${weekNumber}Ties = [];

weeks.push({ 'games': week${weekNumber}Games, 'picks': week${weekNumber}Picks, 'winners': week${weekNumber}Winners, 'ties': week${weekNumber}Ties, 'ytd': week${weekNumber}ytd });`

console.log(javascriptWeekString);
