
function getPlayerDifficulty() {
    const difficulty = document.querySelectorAll('.difficulty');
    for (let i = 0; i < difficulty.length; i++ ) {
        if (difficulty[i].checked) {
            return Number(difficulty[i].value);
        }
    };
}

async function sendGuessNumberResult(playerChoice, difficulty) {
    try {
        const response = await fetch('/api/games/guess-number', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // send JWT cookie
            body: JSON.stringify({
                guess: Number(playerChoice),
                difficulty: Number(difficulty)
            })
        });

        const data = await response.json();
        document.getElementById('datamaskinValg').innerText = `${data.generatedNumber}`;
        document.getElementById('resultat').innerText = data.result;
    } catch (err) {
        console.error('Error sending guess:', err);
    }
}

const guessButton = document.getElementById('gjett');
guessButton.addEventListener('click', (event) => {
    const playerChoice = document.getElementById('tall').value;
    const difficulty = getPlayerDifficulty();
    sendGuessNumberResult(playerChoice, difficulty);
});