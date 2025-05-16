try {
// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    //const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`/api/login`, {
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

            window.location.href = '/';
        } else {
            console.log(data.error)
        }
    } catch (error) {
        console.log("error occured")
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

    const neccecaryData = document.getElementById('nececarryData').checked;
    if (!neccecaryData) {
        alert("Du må tillate nødvendig data å bli lagret.")
        return
    }
    const optionalData = document.getElementById('optionalData').checked;

    let optionalDataNum = optionalData ? 1 : 0

    optionalDataNum = optionalData.toString()

    console.log(optionalData, optionalDataNum)
    
    try {
        const response = await fetch(`/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, optionalDataNum })
        });

        console.log("Data sent bitch", username, email, password, optionalDataNum)

        const data = await response.json();

        if (response.ok) {
            console.log("Sucsess")
            window.location.href = '/';
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
        const response = await fetch(`/protected`, {
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
