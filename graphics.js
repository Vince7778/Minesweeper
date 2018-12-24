var interval;

function drawBoard() {
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var out = "";
            if (flags[i][j]) { // flagged?
                if (grid[i][j] != -1 && done) {
                    document.getElementById("row"+i+"col"+j).className = "empty";
                    out = "F";
                } else {
                    document.getElementById("row"+i+"col"+j).className = "flag";
                    out = "F";
                }
            } else if (revealed[i][j]) { // revealed?
                if (grid[i][j] == -1) {
                    document.getElementById("row"+i+"col"+j).className = "mine";
                } else if (grid[i][j] == 0) {
                    document.getElementById("row"+i+"col"+j).className = "";
                } else {
                    document.getElementById("row"+i+"col"+j).className = "c"+grid[i][j];
                    out = grid[i][j];
                }
            } else if (printPercents) { // shows best squares
                if (percentages[i][j] == bestPercent && printPercents && !revealed[i][j]) {
                    document.getElementById("row"+i+"col"+j).className = "best";
                } else {
                    document.getElementById("row"+i+"col"+j).className = "empty";
                }
            } else { // unopened squares
                document.getElementById("row"+i+"col"+j).className = "empty";
            }
            
            document.getElementById("row"+i+"col"+j).innerHTML = out;
            if (printPercents && !revealed[i][j] && !flags[i][j] && percentages[i][j] != 1.02) {
                document.getElementById("row"+i+"col"+j).innerHTML += " "+Math.round(100*percentages[i][j]);
            }
        }
    }
    document.getElementById("unflagged").innerHTML = mines - numFlags;
    document.getElementById("revealed").innerHTML = revealedSquares;
    document.getElementById("clicks").innerHTML = clicks;
}

function clearBoard() {
    document.getElementById("board").innerHTML = "";
}

function getReadableTime(diff) { // breaks if over an hour (why)
    var min = Math.floor(diff/60000);
    var sec = Math.round((diff/1000) % 60);
    return zeroFill(min,2) + ":" + zeroFill(sec,2);
}

function showBest() {
    var out = "";
    var out2 = "";
    out2 += "<p class='pmar'>Easy:</p>";
    if (bestTimes[0].length == 0) {
        out2 += "<p class='pmar'>None</p>";
    } else {
        for (var n = 0; n < 8 && n < bestTimes[0].length; n++) {
            out2 += "<p class='pmar'>" + getReadableTime(bestTimes[0][n]) + "</p>";
        }
    }
    for (var i = 0; i <= 1; i++) {
        if (i == 0) {
            out += "<p class='pmar'>Medium:</p>";
        } else if (i == 1) {
            out += "<p class='pmar'>Hard:</p>";
        }
        if (bestTimes[i+1].length == 0) {
            out += "<p class='pmar'>None</p>";
        } else {
            for (var j = 0; j < 8 && j < bestTimes[i+1].length; j++) {
                out += "<p class='pmar'>" + getReadableTime(bestTimes[i+1][j]) + "</p>";
            }
        }
    }
    document.getElementById("besttimes").innerHTML = out;
    document.getElementById("besttimeseasy").innerHTML = out2;
}

function fin(id) {
    if (id == 0) { // win
        document.getElementById("message").innerHTML = "YOU WIN!!! :)";
        document.getElementById("message").style.display = "block";
        done = true;
        clearInterval(interval);
        interval = 0;
        setBest();
    } else if (id == 1) { // lose
        document.getElementById("message").innerHTML = "YOU LOSE!!! :(";
        document.getElementById("message").style.display = "block";
        done = true;
        clearInterval(interval);
        interval = 0;
        drawBoard();
    } else if (id == 2) { // resets game
        document.getElementById("message").style.display = "none";
        document.getElementById("message").innerHTML = "";
        done = false;
    }
    document.getElementById("percents").checked = false;
}

// from stackoverflow
function zeroFill(number, width) {
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}

function incrementTime() {
    var newTime = + new Date();
    var diff = newTime - startTime;
    document.getElementById("time").innerHTML = getReadableTime(diff);
}

function loadGame() {
    $(".gametype").hide();
    $(".starthide").hide();
    if (localStorage.getItem("times") != null) {
        timesFromString(localStorage.getItem("times"));
        showBest();
    }
}