/*
    Made by Vince7778, 2018
*/

var grid = [];
var revealed = [];
var flags = [];
var percentages = [];
var numFlags = 0;
var clicks = 0;
var mines = 0;
var revealedSquares = 0;
var done = false;
var startTime = 0;
var bestTimes = [[],[],[]];
var usingPreset = 0;
var printPercents = false;
var bestPercent = 101;
var width = 0;
var height = 0;

// begin functions that create games

function preset(i) {
    switch(i) {
        case 0:
            createGame(12,10,10);
            break;
        case 1:
            createGame(85,24,24);
            break;
        case 2:
            createGame(180,50,24);
            break;
        default:
            break;
    }
    usingPreset = i+1;
}

function getGame(i) {
    var w = parseInt(document.getElementById("width").value);
    var h = parseInt(document.getElementById("height").value);
    var m;
    if (i == 0) {
        m = parseInt(document.getElementById("mines").value);
    } else {
        m  = Math.floor(w*h/7);
    }
    usingPreset = 0;
    createGame(m,w,h);
}

function createGame(mineNum, width1, height1) {
    height = height1;
    width = width1;
    mines = mineNum;
    if (mines > width * height) {
        alert("Cannot have more mines than there are grid squares!");
    } else if (mines == width * height) {
        alert("The grid is filled with mines!");
    } else if (mines < 0) {
        alert("You can't have negative mines!");
    } else if (width > 5000 || height > 5000) {
        alert("Literally unplayable");
    } else if (width <= 0 || height <= 0) {
        alert("Dimensions cannot be zero or less!");
    } else if (width != Math.floor(width) || height != Math.floor(height)) {
        alert("Dimensions have to be integers!");
    } else {
        grid = [];
        revealed = [];
        flags = [];
        percentages = [];
        fin(2);
        numFlags = 0;
        revealedSquares = 0;
        createGrid();
        if (printPercents) {
            updatePercents();
        }
        $(".starthide").show();
        drawBoard();
        showBest();
    }
}

function createGrid() {
    clicks = 0;
    clearBoard();
    for (var i = 0; i < height; i++) {
        document.getElementById("board").innerHTML += "<tr id='row" + i + "'></tr>";
        var row = [];
        var revRow = [];
        var revRow2 = [];
        var revRow3 = [];
        for (var j = 0; j < width; j++) {
            row.push(0);
            revRow.push(false);
            revRow2.push(false);
            document.getElementById("row" + i).innerHTML += "<td id='row"+i+"col"+j+"'></td>";
        }
        grid.push(row);
        revealed.push(revRow);
        flags.push(revRow2);
    }
    console.log(flags);
}

// places mines around the grid
function generateMines(num, width, height, xX, xY) {
    while (num-- > 0) {
        var row = Math.floor(Math.random() * height);
        var column = Math.floor(Math.random() * width);
        if (grid[row][column] == -1 || (row == xX && column == xY)) {
            num++;
        } else {
            grid[row][column] = -1;
            incrementNeighbors(width, height, row, column);
        }
    }
}

// initially sets all the grid numbers
function incrementNeighbors(width, height, row, column) {
    for (var i = Math.max(row - 1, 0); i <= row + 1 && i < height; i++) {
        for (var j = Math.max(column - 1, 0); j <= column + 1 && j < width; j++) {
            if (grid[i][j] != -1 && !(i == row && j == column)) {
                grid[i][j]++;
            }
        }
    }
}

// end functions that create the game
// begin functions that deal with clicks

// jquery from stackoverflow that deals with clicks on the table
$(document).on("click", "#board td", function(e) {
    var data = $(this).attr('id');
    separateClick(data,0);
});

$(document).on("contextmenu", "#board td", function(e){
    var data = $(this).attr('id');
    separateClick(data,1);
});

function separateClick(data,type) {
    var foundnum1 = false;
    var endnum1 = false;
    var num1 = "";
    var num2 = "";
    for (var i = 0; i < data.length; i++) {
        if (!isNaN(data.substring(i,i+1))) {
            if (foundnum1 && endnum1) {
                num2 += data.substring(i,i+1);
            } else {
                num1 += data.substring(i,i+1);
                foundnum1 = true;
            }
        } else {
            if (foundnum1) {
                endnum1 = true;
            }
        }
    }
    if (type == 0) {
        click(parseInt(num1),parseInt(num2));
    } else if (type == 1) {
        rclick(parseInt(num1),parseInt(num2));
    }
}

function click(row, column) {
    if (!done) {
        if (!flags[row][column]) {
            if (grid[row][column] == -1) {
                if (clicks == 0) {
                    createGame(mines, width, height);
                    click(row, column);
                } else {
                    revealAll();
                    fin(1);
                }
            } else if (!revealed[row][column]) {
                if (clicks == 0) {
                    startTime = + new Date();
                    interval = setInterval(incrementTime,1000);
                    generateMines(mines, width, height, row, column);
                }
                if (grid[row][column] == 0) {
                    revealed[row][column] = true;
                    revealedSquares++;
                    revealNeighbors(row, column, width, height);
                } else {
                    revealed[row][column] = true;
                    revealedSquares++;
                }
            }
            clicks++;
            if (printPercents) {
                updatePercents();
            }
            drawBoard();
        }
        if (revealedSquares == height * width - mines) {
            revealAll();
            fin(0);
        }
    }
}

function rclick(row, column) {
    if (!done) {
        if (!revealed[row][column]) {
            if (flags[row][column]) {
                flags[row][column] = false;
                numFlags--;
            } else {
                flags[row][column] = true;
                numFlags++;
            }
        }
        drawBoard();
    }
}

// recursive floodfill function
// FIXME: replace with iterative to remove stack overflows
function revealNeighbors(row,column) {
    for (var i = Math.max(row - 1, 0); i <= row + 1 && i < height; i++) {
        for (var j = Math.max(column - 1, 0); j <= column + 1 && j < width; j++) {
            if (grid[i][j] == -1) {
                alert("This should never happen: checked mine!");
            } else if (!revealed[i][j] && !flags[i][j]) {
                revealed[i][j] = true;
                revealedSquares++;
                if (grid[i][j] == 0) {
                    revealNeighbors(i,j,width,height);
                }
            }
        }
    }
}

// end functions that deal with clicks
// begin functions that use percentages

function createPercentGrid() {
    for (var i = 0; i < height; i++) {
        var row = [];
        for (var j = 0; j < width; j++) {
            row.push(0);
        }
        percentages.push(row);
    }
}

function updatePercents() {
    // This prints the percentages that a square is a mine. It doesn't work well and I'm probably going to remove it.
    percentages = [];
    createPercentGrid();
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if (!/[1-8]/.test(grid[i][j]) || !revealed[i][j]) continue;
            var n = [0,1,1,1,0,-1,-1,-1];
            var e = [1,1,0,-1,-1,-1,0,1];
            for (var k = 0; k < 8; k++) {
                if (inBounds(j+e[k],i+n[k])) {
                    percentages[i+n[k]][j+e[k]] = Math.max(percentages[i+n[k]][j+e[k]],grid[i][j]/surroundingSquares(i,j));
                }
            }
        }
    }
    bestPercent = 1.01;
    for (var l = 0; l < height; l++) {
        for (var m = 0; m < width; m++) {
            if (percentages[l][m] == 0) {
                percentages[l][m] = 1.02;
            }
            if (!revealed[l][m]) bestPercent = Math.min(percentages[l][m],bestPercent);
        }
    }
}

function switchPercents() {
    var enable = document.getElementById("percents");
    if (clicks == 0) { // TODO: make it so that you can turn on/off before first click
        enable.checked = false;
        return;
    }

    if (!enable.checked) {
        disablePercents();
    } else {
        enablePercents();
    }
}

function disablePercents() {
    printPercents = false;
    drawBoard();
}

function enablePercents() {
    percentages = [];
    printPercents = true;
    createPercentGrid();
    updatePercents();
    drawBoard();
}

// end functions that deal with percentages
// begin utility functions

// confusing function name: counts the number of revealed squares surrounding a cell
function surroundingSquares(x,y) {
    var n = [0,1,1,1,0,-1,-1,-1];
    var e = [1,1,0,-1,-1,-1,0,1];
    var res = 0;
    for (var k = 0; k < 8; k++) {
        if (inBounds(y+e[k],x+n[k])) {
            if (!revealed[x+n[k]][y+e[k]]) res++;
        }
    }
    return res;
}

function inBounds(x,y) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
        return true;
    }
    return false;
}

function getReadableTime(diff) { // breaks if over an hour (why would a game be that long)
    var min = Math.floor(diff/60000);
    var sec = Math.round((diff/1000) % 60);
    return zeroFill(min,2) + ":" + zeroFill(sec,2);
}

// end utility functions
// begin custom detection functions

// TODO: make it able to count/not count different squares

// end custom detection functions
// begin local storage functions

// localstorage -> page
function timesFromString(s) {
    var i = -1;
    var newBests = [[],[],[]];
    var letterString = "";
    for (var j = 0; j < s.length; j++) {
        var x = s.substring(j,j+1);
        if (x == "x") {
            i++;
        } else if (/[0-9]/.test(x)) {
            letterString += x;
        } else if (x == ",") {
            newBests[i].push(parseInt(letterString));
            letterString = "";
        } else {
            alert("Error reading times from localStorage!");
        }
    }
    bestTimes = newBests;
}

// page -> localstorage
function timesToString() {
    var s = "";
    for (var i = 0; i <= 2; i++) {
        s += "x";
        for (var j = 0; j < bestTimes[i].length; j++) {
            s += bestTimes[i][j] + ",";
        }
    }
    return s;
}

// after game sets best times (top 8) and stores them
function setBest() {
    if (usingPreset != 0) {
        var newTime = + new Date();
        var diff = newTime - startTime;
        var i = usingPreset-1;
        for (var j = 0; j < 8; j++) {
            if (bestTimes[i][j] != undefined) {
                if (bestTimes[i][j] > diff) {
                    bestTimes[i].splice(j, 0, diff);
                    break;
                }
            } else {
                bestTimes[i][j] = diff;
                break;
            }
        }
        showBest();
    }
    localStorage.setItem("times",timesToString());
}

// end local storage functions
// begin other functions

// wow i wonder what this does
function revealAll() {
    for (var i = 0; i < revealed.length; i++) {
        for (var j = 0; j < revealed[i].length; j++) {
            if (grid[i][j] == -1) {
                revealed[i][j] = true;
            }
        }
    }
}

// this was for testing in the early stages of this program
// just prints out a stringified version of the grid
function debugGrid() {
    var out = "";
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if(grid[i][j] == -1) {
                out += "X";
            } else {
                out += grid[i][j];
            }
            if (revealed[i][j]) {
                out += "R ";
            } else {
                out += "  ";
            }
        }
        out += "\n";
    }
    console.log(out);
}

// end other functions
