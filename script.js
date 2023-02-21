/*
TODO:
1. Add a timer to measure the game time
2. Add best times to the local storage and display them on page
3. Styles need to be worked on
4. Maybe add a fancy way of revealing mines upon losing the game
*/

const minefield = document.querySelector("#minefield");
const selectDiff = document.querySelector("#select-difficulty");
const restartBtn = document.querySelector("#restart-btn");
const tilesLeft = document.querySelector("#tiles-left");

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
        tilesLeft.innerText = "Game Over";
        minesArray.forEach(fldId => {
            document.querySelector("#" + fldId).classList.add("bomb");
        })
    }
    else tilesLeft.innerText = "Congratulations, You Win!";

    minefield.style.pointerEvents = "none";
}

function initializeField(option) {
    minefield.style.pointerEvents = "auto";

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
            if (event.button === 2) {
                if (fld.classList.contains("flag")) {
                    fld.className = '';
                    fld.classList.add("field", "uncertain");
                    flags += 1;
                }
                else if (fld.classList.contains("uncertain")) {
                    fld.className = '';
                    fld.classList.add("field");
                }
                else if(flags > 0){
                    fld.className = '';
                    fld.classList.add("field", "flag");
                    flags -= 1;
                }
            }
            else if (event.button === 0) {
                if (firstMove) generateMines(fld.id.toString());
                if (!minesArray.includes(fld.id)) countSurroundingMines(fld);
                else gameOver(false);
                if (tilesLeft.innerText === "0") gameOver(true);
            }
        })
    });
}

initializeField('1');

restartBtn.addEventListener("click", () => {
    initializeField(selectDiff.options[selectDiff.selectedIndex].value);
});

document.addEventListener('keyup', (event) => {
    if (event.key === "r") {
        initializeField(selectDiff.options[selectDiff.selectedIndex].value);
    }
});