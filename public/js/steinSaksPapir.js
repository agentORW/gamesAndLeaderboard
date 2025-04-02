
function getComputerChoice() {
    const choices = ['stein', 'saks', 'papir'];
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

function playGame(playerChoice) {
    const computerChoice = getComputerChoice();
    let result = '';

    if (playerChoice === computerChoice) {
        result = 'Uavgjort!';
    } else if (
        (playerChoice === 'stein' && computerChoice === 'saks') ||
        (playerChoice === 'papir' && computerChoice === 'stein') ||
        (playerChoice === 'saks' && computerChoice === 'papir')
    ) {
        result = 'Du vant!';
    } else {
        result = 'Du tapte!';
    }

    document.getElementById('datamaskinValg').innerText = `${computerChoice.charAt(0).toUpperCase() + String(computerChoice).slice(1)}`;
    document.getElementById('resultat').innerText = `${result}`;
}

function sendScore(result) {

}

const choiseButtons = document.querySelectorAll('.valg');
choiseButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        const playerChoice = event.target.innerText.toLowerCase();
        playGame(playerChoice);
    });
});