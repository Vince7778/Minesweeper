/*
    Made by Vince7778, 2018
    if you steal my code at least credit me
    you shouldn't steal the code anyways
    unless you're being held at gunpoint
    also don't hack, please

    why would you want to steal my horrible code
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

function switchPercents() {
    var enable = document.getElementById("percents");
    if (clicks == 0) {
        enable.checked = false;
        return;
    }

    if (!enable.checked) {
        disablePercents();
    } else {
        enablePercents();
    }
}

function inBounds(x,y) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
        return true;
    }
    return false;
}

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
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if (percentages[i][j] == 0) {
                percentages[i][j] = 1.02;
            }
            if (!revealed[i][j]) bestPercent = Math.min(percentages[i][j],bestPercent);
        }
    }
}

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

$(document).on("click", "#board td", function(e) {
    var data = $(this).attr('id');
    separateClick(data,0);
});

$(document).on("contextmenu", "#board td", function(e){
    var data = $(this).attr('id');
    separateClick(data,1);
});

$(function() {
    $('#typeselect').change(function(){
        $('.gametype').hide();
        $('#' + $(this).val()).show();
    });
});

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
                    generateMines(mines, width, height, row, column)
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
            // putting this here 'cause i'm lazy
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

// recursive function
// TODO: replace with iterative to remove stack overflows
function incrementNeighbors(width, height, row, column) {
    for (var i = Math.max(row - 1, 0); i <= row + 1 && i < height; i++) {
        for (var j = Math.max(column - 1, 0); j <= column + 1 && j < width; j++) {
            if (grid[i][j] != -1 && !(i == row && j == column)) {
                grid[i][j]++;
            }
        }
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
    console.log(flags)
}

function createPercentGrid() {
    for (var i = 0; i < height; i++) {
        var row = [];
        for (var j = 0; j < width; j++) {
            row.push(0);
        }
        percentages.push(row);
    }
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
        alert("You can't have negative mines!")
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