document.addEventListener('DOMContentLoaded', async () => {
    // Fetch current preference
    const res = await fetch('/api/user/ip-preference');
    const data = await res.json();
    document.getElementById('saveIp').checked = data.saveIp;

    // Handle preference change
    document.getElementById('ipPrefForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveIp = document.getElementById('saveIp').checked;
        const res = await fetch('/api/user/ip-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ saveIp })
        });
        const data = await res.json();
        alert(data.message);
    });

    // Handle account deletion
    document.getElementById('deleteAccount').addEventListener('click', async () => {
        if (confirm('Er du sikker på at du vil slette kontoen din? Dette kan ikke angres!')) {
            const res = await fetch('/api/user/delete', { method: 'DELETE' });
            if (res.ok) {
                alert('Kontoen din er slettet.');
                window.location.href = '/registrer';
            } else {
                alert('Noe gikk galt ved sletting av konto.'); 
            }
        }
    });
});