const minefield = document.querySelector("#minefield");
const board = document.querySelector("#board");
const selectDiff = document.querySelector("#select-difficulty");
const restartBtn = document.querySelector("#restart-btn");
const minesLeft = document.querySelector("#mines-left");
const timeSpan = document.querySelector("#game-time");
const bestTimesList = document.querySelector("#best-times");
const flagModeBtn = document.querySelector("#flag-mode-btn");
const mobileModeBtn = document.querySelector("#mobile-mode-btn");

const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary-color");
const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue("--secondary-color");

minefield.addEventListener("contextmenu", event => event.preventDefault());

//DEFAULT VALUES
let columns = 8;
let rows = 8;
let mines = 10;
let flags = mines;
let tilesLeft = columns * rows - mines;
let currentGameDiff = 1;
let firstMove = false;
let fieldsArray = [];
let minesArray = [];
let timer = null;
let placeFlags = false;

function placeMine(startingFieldId) {
    let x = Math.floor(Math.random() * columns);
    let y = Math.floor(Math.random() * rows);
    let id = "#f" + y.toString() + "-" + x.toString();
    let fld = document.querySelector(id);

    if (fld.id.toString() !== startingFieldId && !minesArray.includes(fld.id)) {
        // fld.style.backgroundColor = "red"; //Uncomment to reveal bombs
        minesArray.push(fld.id);
    }
    else placeMine(startingFieldId);
}

function generateMines(startingFieldId) {
    for (let m = 0; m < mines; m++) {
        placeMine(startingFieldId);
    }
    firstMove = false;
}

function countSurroundingMines(fld) {
    let fldId = fld.id.toString().substr(1,).split("-");
    let howMany = 0;

    let x = parseInt(fldId[1]);
    let y = parseInt(fldId[0]);

    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (!(i < 0 || j < 0 || i >= columns || j >= rows)) {
                if (minesArray.includes(fieldsArray[j][i].id) && fieldsArray[j][i].id !== fld.id) {
                    howMany++;
                }
            }
        }
    }
    if (!fld.classList.contains("clicked")) {
        tilesLeft--;
        if (howMany !== 0) {
            fld.innerText = howMany;
            fld.classList.add("bomb" + howMany.toString(), "clicked");
        }
        else {
            fld.classList.add("clicked");
            for (let i = x - 1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    if (!(i < 0 || j < 0 || i >= columns || j >= rows)) {
                        countSurroundingMines(fieldsArray[j][i]);
                    }
                }
            }
        }
    }
}

function gameOver(win) {
    if (!win) {
        board.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        minesArray.forEach(fldId => {
            const mineImage = document.createElement("img");
            mineImage.src = "./Images/mine.svg";
            const temp = document.querySelector("#" + fldId);
            temp.innerText = '';
            temp.appendChild(mineImage);
            temp.className = '';
            temp.classList.add("field");
        })
    }
    else {
        minesLeft.innerText = '0';
        board.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
        minesArray.forEach(fldId => {
            const temp = document.querySelector("#" + fldId);
            temp.className = '';
            temp.classList.add("field", "flag");
            temp.innerText = '';
        });
        addBestTime(currentGameDiff, parseInt(timeSpan.innerText));
    }
    minefield.style.pointerEvents = "none"; //blocks clicking on the minefield
}

function gameTimer() {
    timeSpan.innerText = (parseInt(timeSpan.innerText) + 1).toString();
}

function initializeField() {
    minefield.style.pointerEvents = "auto"; //allows to click on the minefield
    timeSpan.innerText = '0';
    board.style.backgroundColor = secondaryColor;
    currentGameDiff = selectDiff.options[selectDiff.selectedIndex].value;
    updateBestTimes(currentGameDiff);

    switch (currentGameDiff) {
        case '1':
            columns = 8;
            rows = 8;
            mines = 10;
            minefield.className = '';
            minefield.classList.add("beginner");
            break;
        case '2':
            columns = 16;
            rows = 16;
            mines = 40;
            minefield.className = '';
            minefield.classList.add("intermediate");
            break;
        case '3':
            columns = 30;
            rows = 16;
            mines = 90;
            minefield.className = '';
            minefield.classList.add("expert");
            break;
        default:
            return;
    }

    flags = mines;
    tilesLeft = columns * rows - mines;
    minesLeft.innerText = flags.toString();

    while (minefield.firstChild) {
        minefield.firstChild.remove();
    }

    fieldsArray = [];
    minesArray = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            const field = document.createElement("div");
            field.classList.add("field");
            field.id = 'f' + r.toString() + '-' + c.toString();
            minefield.appendChild(field);
            row.push(field);
        }
        fieldsArray.push(row);
    }
    firstMove = true;

    let fields = document.querySelectorAll(".field");

    function rightClickOperations(fld) {
        if (!fld.classList.contains("clicked")) {
            if (fld.classList.contains("flag")) {
                fld.className = '';
                fld.classList.add("field", "uncertain");
                flags += 1;
                minesLeft.innerText = flags.toString();
                fld.innerText = '?';
            }
            else if (fld.classList.contains("uncertain")) {
                fld.className = '';
                fld.classList.add("field");
                fld.innerText = '';
            }
            else if (flags > 0) {
                fld.className = '';
                fld.classList.add("field", "flag");
                flags -= 1;
                minesLeft.innerText = flags.toString();
            }
        }
    }

    fields.forEach(fld => {
        fld.addEventListener("mouseup", (event) => {
            if (placeFlags) {
                rightClickOperations(fld);
            }
            else if (event.button === 2) {
                rightClickOperations(fld);
            }
            else if (event.button === 0 && !(fld.classList.contains("flag") || fld.classList.contains("uncertain"))) {
                if (firstMove) {
                    generateMines(fld.id.toString());
                    timer = setInterval(gameTimer, 1000);
                }
                if (!minesArray.includes(fld.id)) countSurroundingMines(fld);
                else {
                    gameOver(false);
                    fld.style.backgroundColor = "red";
                    clearInterval(timer);
                }
                if (tilesLeft === 0) {
                    gameOver(true);
                    clearInterval(timer);
                }

            }
        })
    });
}

// LocalStorage related functions
function updateBestTimes(option) {
    let timesArray = [];
    switch (option) {
        case '1':
            if (localStorage.getItem("beginnerTimesArray") !== null) {
                timesArray = JSON.parse(localStorage.getItem("beginnerTimesArray"));
            }
            break;
        case '2':
            if (localStorage.getItem("intermediateTimesArray") !== null) {
                timesArray = JSON.parse(localStorage.getItem("intermediateTimesArray"));
            }
            break;
        case '3':
            if (localStorage.getItem("expertTimesArray") !== null) {
                timesArray = JSON.parse(localStorage.getItem("expertTimesArray"));
            }
            break;
        default:
            return;
    }

    while (bestTimesList.firstChild) {
        bestTimesList.firstChild.remove();
    }

    if (timesArray.length > 0) {
        timesArray.forEach(element => {
            const olElem = document.createElement("li");
            let minutes = Math.floor(element / 60);
            let seconds = element - minutes * 60;
            if (minutes) olElem.textContent = minutes + 'm ' + seconds + 's';
            else olElem.textContent = seconds + 's';
            bestTimesList.appendChild(olElem);
        });
    } else {
        const placeholder = document.createElement("p");
        placeholder.innerHTML = "Win a game to set a new <b>best time</b>!";
        bestTimesList.appendChild(placeholder);
    }

}

function addBestTime(option, time) {
    let timesArray = [];
    switch (option) {
        case '1':
            if (localStorage.getItem("beginnerTimesArray") !== null) {
                timesArray = JSON.parse(localStorage.getItem("beginnerTimesArray"));
            }
            timesArray.push(time);
            timesArray.sort(function (a, b) { return a - b });
            timesArray.splice(5,);
            localStorage.setItem("beginnerTimesArray", JSON.stringify(timesArray));
            break;
        case '2':
            if (localStorage.getItem("intermediateTimesArray") !== null) {
                timesArray = JSON.parse(localStorage.getItem("intermediateTimesArray"));
            }
            timesArray.push(time);
            timesArray.sort(function (a, b) { return a - b });
            timesArray.splice(5,);
            localStorage.setItem("intermediateTimesArray", JSON.stringify(timesArray));
            break;
        case '3':
            if (localStorage.getItem("expertTimesArray") !== null) {
                timesArray = JSON.parse(localStorage.getItem("expertTimesArray"));
            }
            timesArray.push(time);
            timesArray.sort(function (a, b) { return a - b });
            timesArray.splice(5,);
            localStorage.setItem("expertTimesArray", JSON.stringify(timesArray));
            break;
        default:
            return;
    }
    updateBestTimes(option);
}

// Event Listeners
restartBtn.addEventListener("click", event => {
    initializeField();
    clearInterval(timer);
});

document.addEventListener('keyup', event => {
    if (event.key === "r") {
        initializeField();
        clearInterval(timer);
    }
});

mobileModeBtn.addEventListener("click", () => {
    if (flagModeBtn.style.display === "none" || flagModeBtn.style.display === "") {
        flagModeBtn.style.display = "inline-block";
        mobileModeBtn.style.backgroundColor = secondaryColor;
        mobileModeBtn.style.color = primaryColor;
    }
    else {
        flagModeBtn.style.display = "none";
        mobileModeBtn.style.backgroundColor = primaryColor;
        mobileModeBtn.style.color = secondaryColor;
    }
});

flagModeBtn.addEventListener("click", () => {
    placeFlags = !placeFlags;

    if (placeFlags) {
        flagModeBtn.style.backgroundColor = "red";
        flagModeBtn.style.color = secondaryColor;
    } else {
        flagModeBtn.style.backgroundColor = secondaryColor;
        flagModeBtn.style.color = "black";
    }
});

initializeField();