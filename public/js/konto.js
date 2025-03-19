const BASE_URL = 'http://localhost:3000';

try {
// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    //const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        console.log("Data sent")
        console.log(email, password)

        const data = await response.json();

        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            console.log("Sucsess");
            
            // Optional: Test protected route
            await testProtectedRoute();
        } else {
            console.log(data.error)
        }
    } catch (error) {
        console("error occured")
        console.error('Error:', error);
    }
});
}
catch(err) {
    console.log(err.message);
}

try {
// Registration Form Handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });

        console.log("Data sent bitch", username, email, password)

        const data = await response.json();

        if (response.ok) {
            console.log("Sucsess")
        } else {
            console.log(data.error)
        }
    } catch (error) {
        //messageDiv.textContent = 'An error occurred';
        console.error('Error:', error);
    }
});
}
catch(err) {
    console.log(err.message);
}

// Test Protected Route
async function testProtectedRoute() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/protected`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Protected route access granted!');
        } else {
            console.log('Failed to access protected route.');
        }
    } catch (error) {
        console.error('Error accessing protected route:', error);
    }
}
