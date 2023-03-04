const minefield = document.querySelector("#minefield");
const board = document.querySelector("#board");
const selectDiff = document.querySelector("#select-difficulty");
const restartBtn = document.querySelector("#restart-btn");
const tilesLeft = document.querySelector("#tiles-left");
const timeSpan = document.querySelector("#game-time");
const bestTimesList = document.querySelector("#best-times");

minefield.addEventListener("contextmenu", event => event.preventDefault());

//DEFAULT VALUES
let columns = 8;
let rows = 8;
let mines = 10;
let flags = mines;
////////////////

let firstMove = false;
let fieldsArray = [];
let minesArray = [];
let timer = null;

function placeMine(startingFieldId) {
    let x = Math.floor(Math.random() * columns);
    let y = Math.floor(Math.random() * rows);
    let id = "#f" + y.toString() + "-" + x.toString();
    let fld = document.querySelector(id);

    if (fld.id.toString() !== startingFieldId && !minesArray.includes(fld.id)) {
        // fld.className = '';
        // fld.classList.add("bomb", "field");
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
        tilesLeft.innerText = tilesLeft.innerText - 1;
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
        board.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
        minesArray.forEach(fldId => {
            const temp = document.querySelector("#" + fldId);
            temp.className = '';
            temp.classList.add("field", "flag");
            temp.innerText = '';
        });
        addBestTime(selectDiff.options[selectDiff.selectedIndex].value, parseInt(timeSpan.innerText));
    }
    minefield.style.pointerEvents = "none";
}

function gameTimer() {
    timeSpan.innerText = (parseInt(timeSpan.innerText) + 1).toString();
}

function initializeField(option) {
    minefield.style.pointerEvents = "auto";
    timeSpan.innerText = '0';
    board.style.backgroundColor = "rgb(255, 255, 255)";
    updateBestTimes(option);

    switch (option) {
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
    tilesLeft.innerText = (columns * rows - mines).toString();

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

    fields.forEach(fld => {
        fld.addEventListener("mouseup", (event) => {
            if (event.button === 2 && !fld.classList.contains("clicked")) {
                if (fld.classList.contains("flag")) {
                    fld.className = '';
                    fld.classList.add("field", "uncertain");
                    flags += 1;
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
                }
            }
            else if (event.button === 0 && !(fld.classList.contains("flag") || fld.classList.contains("uncertain"))) {
                if (firstMove) {
                    generateMines(fld.id.toString());
                    timer = setInterval(gameTimer, 1000);
                }
                if (!minesArray.includes(fld.id)) countSurroundingMines(fld);
                else {
                    gameOver(false);
                    fld.classList.add("bomb");
                    clearInterval(timer);
                }
                if (tilesLeft.innerText === "0") {
                    gameOver(true);
                    clearInterval(timer);
                }
            }
        })
    });
}

initializeField('1');

restartBtn.addEventListener("click", event => {
    initializeField(selectDiff.options[selectDiff.selectedIndex].value);
    clearInterval(timer);
});

document.addEventListener('keyup', event => {
    if (event.key === "r") {
        initializeField(selectDiff.options[selectDiff.selectedIndex].value);
    }
});

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
            olElem.textContent = element.toString() + 's';
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