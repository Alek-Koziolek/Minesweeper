const minefield = document.querySelector("#minefield");
const selectDiff = document.querySelector("#select-difficulty");
const restartBtn = document.querySelector("#restart-btn");

//default size
let columns = 8;
let rows = 8;

function initializeField(option) {

    switch (option) {
        case '1':
            columns = 8;
            rows = 8;
            minefield.className = '';
            minefield.classList.add("beginner");
            break;
        case '2':
            columns = 16;
            rows = 16;
            minefield.className = '';
            minefield.classList.add("intermediate");
            break;
        case '3':
            columns = 30;
            rows = 16;
            minefield.className = '';
            minefield.classList.add("expert");
            break;
        default:
            return;
    }

    while(minefield.firstChild){
        minefield.firstChild.remove();
    }

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            const field = document.createElement("div");
            field.classList.add("field");
            minefield.appendChild(field);
        }
    }
}

initializeField('1');

restartBtn.addEventListener("click", () => {
    initializeField(selectDiff.options[selectDiff.selectedIndex].value);
});