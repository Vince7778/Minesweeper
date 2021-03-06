var interval;

function drawBoard() {
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var out = "";
            var ele = document.getElementById("row"+i+"col"+j);
            if (flags[i][j]) { // flagged?
                if (grid[i][j] != -1 && done) {
                    ele.className = "empty";
                    out = "F";
                } else {
                    ele.className = "flag";
                    out = "F";
                }
            } else if (revealed[i][j]) { // revealed?
                if (grid[i][j] == -1) {
                    ele.className = "mine";
                } else {
                    if (grid[i][j] == 0) {
                        ele.className = "";
                    } else {
                        ele.className = "c"+grid[i][j];
                        out = grid[i][j];
                    }
                    ele.className += " revealed";
                }
            } else if (printPercents) { // shows best squares
                if (percentages[i][j] == bestPercent && printPercents && !revealed[i][j]) {
                    ele.className = "best";
                } else {
                    ele.className = "empty";
                }
            } else { // unopened squares
                ele.className = "empty";
            }
            if (selected[0] == i && selected[1] == j && showSelected) {
                ele.className += " selected";
            }
            
            ele.innerHTML = out;
            if (printPercents && !revealed[i][j] && !flags[i][j] && percentages[i][j] != 1.02) {
                ele.innerHTML += " "+Math.round(100*percentages[i][j]);
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

function showBest() {
    if (challenge) {
        showBestChal();
        return;
    }
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

function showBestChal() {
    var out = "";
    var out2 = "";
    out2 += "<p class='pmar'>Easy:</p>";
    if (chalTimes[0].length == 0) {
        out2 += "<p class='pmar'>None</p>";
    } else {
        for (var n = 0; n < 8 && n < chalTimes[0].length; n++) {
            out2 += "<p class='pmar'>" + getReadableTime(chalTimes[0][n]) + "</p>";
        }
    }
    for (var i = 0; i <= 1; i++) {
        if (i == 0) {
            out += "<p class='pmar'>Medium:</p>";
        } else if (i == 1) {
            out += "<p class='pmar'>Hard:</p>";
        }
        if (chalTimes[i+1].length == 0) {
            out += "<p class='pmar'>None</p>";
        } else {
            for (var j = 0; j < 8 && j < chalTimes[i+1].length; j++) {
                out += "<p class='pmar'>" + getReadableTime(chalTimes[i+1][j]) + "</p>";
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
        setBest();
        showSelected = false;
        drawBoard();
    } else if (id == 1) { // lose
        document.getElementById("message").innerHTML = "YOU LOSE!!! :(";
        document.getElementById("message").style.display = "block";
        done = true;
        clearInterval(interval);
        drawBoard();
    } else if (id == 2) { // resets game
        document.getElementById("message").style.display = "none";
        document.getElementById("message").innerHTML = "";
        done = false;
    }
    document.getElementById("percents").checked = false;
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
        timesFromString(localStorage.getItem("times"), false);
        showBest();
    }
    if (localStorage.getItem("chal") != null) {
        timesFromString(localStorage.getItem("chal"), true);
    }
    document.getElementById("chalBox").checked = false;
}

$(function() {
    $('#typeselect').change(function(){
        $('.gametype').hide();
        $('#' + $(this).val()).show();
    });
});
