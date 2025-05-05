document.addEventListener('DOMContentLoaded', function() {
    const gameFilter = document.getElementById('game-filter');
    const sortBy = document.getElementById('sort-by');
    
    // Load leaderboard data on page load
    loadLeaderboard();
    
    // Add event listeners for filters
    gameFilter.addEventListener('change', loadLeaderboard);
    sortBy.addEventListener('change', loadLeaderboard);
    
    // Function to load leaderboard data from API
    function loadLeaderboard() {
        const gameId = gameFilter.value;
        const sortOption = sortBy.value;
        
        // Show loading indicator
        document.getElementById('leaderboard-body').innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading leaderboard data...</td></tr>';
        
        // Build query parameters
        const params = new URLSearchParams();
        if (gameId && gameId !== 'all') {
            params.append('gameId', gameId);
        }
        params.append('sortBy', sortOption);
        
        // Fetch leaderboard data from API
        fetch(`/api/leaderboard?${params.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displayLeaderboard(data);
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
                document.getElementById('leaderboard-body').innerHTML = 
                    '<tr><td colspan="7" style="text-align: center;">Error loading leaderboard data. Please try again.</td></tr>';
            });
    }
    
    // Function to display leaderboard data in the table
    function displayLeaderboard(data) {
        const leaderboardBody = document.getElementById('leaderboard-body');
        
        // Clear previous data
        leaderboardBody.innerHTML = '';
        
        // Check if there's data to display
        if (!data || data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No leaderboard data available</td></tr>';
            return;
        }
        
        // Populate table with leaderboard data
        data.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            // Add special class for top 3 ranks
            if (index === 0) {
                row.classList.add('rank-1');
            } else if (index === 1) {
                row.classList.add('rank-2');
            } else if (index === 2) {
                row.classList.add('rank-3');
            }
            
            // Calculate total games and win rate
            const totalGames = entry.wins + entry.losses + entry.draw;
            const winRate = totalGames > 0 ? ((entry.wins / totalGames) * 100).toFixed(1) : '0.0';
            
            // Create table cells
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.username}</td>
                <td>${entry.wins}</td>
                <td>${entry.losses}</td>
                <td>${entry.draw}</td>
                <td>${totalGames}</td>
                <td>${winRate}%</td>
            `;
            
            leaderboardBody.appendChild(row);
        });
    }
});