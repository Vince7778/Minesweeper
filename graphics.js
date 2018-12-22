var interval;

function drawBoard() {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[0].length; j++) {
            var out = "";
            if (flags[i][j]) {
                if (grid[i][j] != -1 && done) {
                    document.getElementById("row"+i+"col"+j).className = "empty";
                    out = "F";
                } else {
                    document.getElementById("row"+i+"col"+j).className = "flag";
                    out = "F";
                }
            } else if (revealed[i][j]) {
                if (grid[i][j] == -1) {
                    document.getElementById("row"+i+"col"+j).className = "mine";
                } else if (grid[i][j] == 0) {
                    document.getElementById("row"+i+"col"+j).className = "";
                } else {
                    document.getElementById("row"+i+"col"+j).className = "c"+grid[i][j];
                    out = grid[i][j];
                }
            } else if (printPercents) {
                if (percentages[i][j] == bestPercent && printPercents && !revealed[i][j]) {
                    document.getElementById("row"+i+"col"+j).className = "best";
                } else {
                    document.getElementById("row"+i+"col"+j).className = "empty";
                }
            } else {
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

function getReadableTime(diff) {
    var min = Math.floor(diff/60000);
    var sec = Math.round((diff/1000) % 60);
    return zeroFill(min,2) + ":" + zeroFill(sec,2);
}

function showBest() {
    var out = "";
    for (var i = 0; i <= 2; i++) {
        if (i == 0) {
            out += "<p class='pmar'>Easy:</p>";
        } else if (i == 1) {
            out += "<p class='pmar'>Medium:</p>";
        } else if (i == 2) {
            out += "<p class='pmar'>Hard:</p>";
        }
        if (bestTimes[i].length == 0) {
            out += "<p class='pmar'>None</p>";
        } else {
            for (var j = 0; j < 8 && j < bestTimes[i].length; j++) {
                out += "<p class='pmar'>" + getReadableTime(bestTimes[i][j]) + "</p>";
            }
        }
    }
    document.getElementById("besttimes").innerHTML = out;
}

function fin(id) {
    if (id == 0) {
        document.getElementById("message").innerHTML = "YOU WIN!!! :)";
        done = true;
        clearInterval(interval);
        interval = 0;
        setBest();
    } else if (id == 1) {
        document.getElementById("message").innerHTML = "YOU LOSE!!! :(";
        done = true;
        clearInterval(interval);
        interval = 0;
        drawBoard();
    } else if (id == 2) {
        document.getElementById("message").innerHTML = "";
        done = false;
    }
    document.getElementById("percents").checked = false;
    disablePercents();
}

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