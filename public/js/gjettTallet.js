
function getComputerChoice() {
    const numberRange = [1, 100];
    return (Math.floor(Math.random() * numberRange[1])+1+numberRange[0]);
}

function getPlayerDifficulty() {
    const difficulty = document.querySelectorAll('.difficulty');
    for (let i = 0; i < difficulty.length; i++ ) {
        if (difficulty[i].checked) {
            return Number(difficulty[i].value);
        }
    };
}

function playGame(playerChoice) {
    const computerChoice = getComputerChoice();
    const playerDifficulty = getPlayerDifficulty();
    let result = '';

    if (Math.abs(playerChoice - computerChoice) <= playerDifficulty) {
        result = 'Du vant!';
    } else {
        result = 'Du tapte!';
    }

    document.getElementById('datamaskinValg').innerText = `${computerChoice}`;
    document.getElementById('resultat').innerText = `${result}`;
}

const guessButton = document.getElementById('gjett');
guessButton.addEventListener('click', (event) => {
    const playerChoice = document.getElementById('tall').value;
    playGame(playerChoice);
});