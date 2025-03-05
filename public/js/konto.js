const BASE_URL = 'http://localhost:3000';

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        console.log("Data sent")

        const data = await response.json();

        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            messageDiv.textContent = 'Login successful!';
            
            // Optional: Test protected route
            //await testProtectedRoute();
        } else {
            messageDiv.textContent = data.error;
        }
    } catch (error) {
        messageDiv.textContent = 'An error occurred';
        console.error('Error:', error);
    }
});

/*
// Registration Form Handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent = 'Registration successful!';
        } else {
            messageDiv.textContent = data.error;
        }
    } catch (error) {
        messageDiv.textContent = 'An error occurred';
        console.error('Error:', error);
    }
});
*/

// Test Protected Route
async function testProtectedRoute() {
    const token = localStorage.getItem('token');
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${BASE_URL}/protected`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent += ' Protected route access granted!';
        } else {
            messageDiv.textContent += ' Failed to access protected route.';
        }
    } catch (error) {
        messageDiv.textContent += ' Error accessing protected route.';
        console.error('Error:', error);
    }
}