/*
    Made by Vince7778, 2018-2019
*/

/*  On roadmap
    DONE: challenge mode w/ no flags - finished 1-6-19
    TODO: keyboard control
    TODO: "real" offline multiplayer - side by side, keyboard control
    TODO: replay function, can see what moves happened when and replay back @ different speeds
    TODO: support for custom mine detection layouts (not for a while)
    TODO: "fake" offline multiplayer, challenges for other players
        - generates code with same mines and board so that people can have a fair race
        - uses replay function to side-by-side compare
    TODO: online multiplayer?
*/

var grid = [];
var revealed = [];
var flags = [];
var percentages = [];
var numFlags = 0;
var clicks = 0;
var mines = 0;
var revealedSquares = 0;
var done = true;
var startTime = 0;
var bestTimes = [[],[],[]];
var usingPreset = 0;
var printPercents = false;
var bestPercent = 101;
var width = 0;
var height = 0;
var challenge = false;
var chalTimes = [[],[],[]];
var selected = [0,0];
var showSelected = false;

// begin functions that create games

function preset(i) {
    switch(i) {
        case 0:
            createGame(12,10,10);
            break;
        case 1:
            if (challenge) {
                createGame(40,17,17);
                break;
            }
            createGame(60,20,20);
            break;
        case 2:
            if (challenge) {
                createGame(115,40,20);
                break;
            }
            createGame(145,50,20);
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
    showSelected = false;
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
                    // this should really never happen
                    alert("This should never happen! Clicked on mine before they were generated!");
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
                    incrementTime();
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
        if (!revealed[row][column] && !challenge) {
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

// from stackoverflow
function zeroFill(number, width) {
    width -= number.toString().length;
    if ( width > 0 )
    {
      return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + ""; // always return a string
}

// end utility functions
// begin local storage functions

// localstorage -> page
function timesFromString(s,chal) {
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
    if (!chal) {
        bestTimes = newBests;
    } else {
        chalTimes = newBests;
    }
}

// page -> localstorage
function timesToString(chal) {
    var s = "";
    for (var i = 0; i <= 2; i++) {
        s += "x";
        if (!chal) {
            for (var j = 0; j < bestTimes[i].length && j < 8; j++) {
                s += bestTimes[i][j] + ",";
            }
        } else {
            for (var k = 0; k < chalTimes[i].length && k < 8; k++) {
                s += chalTimes[i][k] + ",";
            }
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
        if (!challenge) {
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
        } else {
            for (var k = 0; k < 8; k++) {
                if (chalTimes[i][k] != undefined) {
                    if (chalTimes[i][k] > diff) {
                        chalTimes[i].splice(k, 0, diff);
                        break;
                    }
                } else {
                    chalTimes[i][k] = diff;
                    break;
                }
            }
        }
        showBest();
    }
    if (!challenge) {
        localStorage.setItem("times",timesToString(false));
    } else {
        localStorage.setItem("chal",timesToString(true));
    }
    
}

function clearBest() {
    if (confirm("Are you sure you want to delete all your times?")) {
        bestTimes = [[],[],[]];
        localStorage.setItem("times","");
    }
}

// end local storage functions
// begin keyboard navigation functions

window.onkeydown = function(e){
    showSelected = true;
    if ((e.keyCode == 37 || e.keyCode == 65) && inBounds(selected[0],selected[1]-1)) {
        selected[1]--;
    } else if ((e.keyCode == 38 || e.keyCode == 87) && inBounds(selected[0]-1,selected[1])) {
        selected[0]--;
    } else if ((e.keyCode == 39 || e.keyCode == 68) && inBounds(selected[0],selected[1]+1)) {
        selected[1]++;
    } else if ((e.keyCode == 40 || e.keyCode == 83) && inBounds(selected[0]+1,selected[1])) {
        selected[0]++;
    } else if (e.keyCode == 32 || e.keyCode == 13) {
        click(selected[0],selected[1]);
    } else if (e.keyCode == 70) {
        rclick(selected[0],selected[1]);
    }
    drawBoard();
};

// so that pressing space won't trigger selected button
window.onkeyup = function(e) {
    if (e.keyCode == 32 || e.keyCode == 13) {
        e.preventDefault();
    }
};

// end keyboard navigation functions
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

// activates and deactivates challenge mode
function switchChal() {
    done = true;
    revealAll();
    clearInterval(interval);
    document.getElementById("percents").checked = false;
    switchPercents();
    if (document.getElementById("chalBox").checked) {
        challenge = true;
        showBest();
    } else {
        challenge = false;
        showBest();
    }
}

// end other functions
