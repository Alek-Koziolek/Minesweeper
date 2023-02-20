const minefield = document.querySelector("#minefield");
const selectDiff = document.querySelector("#select-difficulty");
const restartBtn = document.querySelector("#restart-btn");

minefield.addEventListener("contextmenu", event => event.preventDefault());

//default size
let columns = 8;
let rows = 8;
let mines = 10;

let firstMove = false;
let fieldsArray = [];

function placeMine() {
    let x = Math.floor(Math.random() * rows);
    let y = Math.floor(Math.random() * columns);
    let id = "#f" + y.toString() + "-" + x.toString();
    let fld = document.querySelector(id);

    if (!fld.classList.contains("clicked") && !fld.classList.contains("bomb")) {
        fld.className = '';
        fld.classList.add("bomb");
    }
    else placeMine();
}

function generateMines() {
    for (let m = 0; m < mines; m++) {
        placeMine();
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
            if (!(i < 0 || j < 0 || i >= rows || j >= columns)) {
                if (fieldsArray[j][i].classList.contains("bomb") && fieldsArray[j][i].id.toString() !== fld.id.toString()) {
                    howMany++;
                }
            }
        }
    }
    if (!fld.classList.contains("clicked")) {
        if (howMany !== 0) {
            fld.innerText = howMany;
            fld.classList.add("bomb" + howMany.toString(), "clicked");
        }
        else fld.classList.add("clicked");
    }
}

function initializeField(option) {

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

    while (minefield.firstChild) {
        minefield.firstChild.remove();
    }

    fieldsArray = [];
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
                }
                else if (fld.classList.contains("uncertain")) {
                    fld.className = '';
                    fld.classList.add("field");
                }
                else {
                    fld.className = '';
                    fld.classList.add("field", "flag");
                }

            }
            else if (event.button === 0) {
                if (firstMove) generateMines();
                countSurroundingMines(fld);
            }
        })
    });
}

initializeField('1');

restartBtn.addEventListener("click", () => {
    initializeField(selectDiff.options[selectDiff.selectedIndex].value);
});
