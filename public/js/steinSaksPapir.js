
async function sendRPSResult(playerChoice) {
    try {
        const response = await fetch('/api/games/rps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // send JWT cookie
            body: JSON.stringify({ choice: playerChoice })
        });

        const data = await response.json();
        document.getElementById('datamaskinValg').innerText =
            `${data.computerChoice.charAt(0).toUpperCase() + data.computerChoice.slice(1)}`;
        document.getElementById('resultat').innerText = data.result;
    } catch (err) {
        console.error('Error playing RPS:', err);
    }
}


const choiseButtons = document.querySelectorAll('.valg');
choiseButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        const playerChoice = event.target.innerText.toLowerCase();
        sendRPSResult(playerChoice);
    });
});