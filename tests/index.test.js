 describe("Authentication", () => {
    test('Should return 200 for sign up', async() => {
        const username = "deetest"+ Math.floor(Math.random() * 1000) + "@gmail.com";
        const password = "123123";
        const response = await axios.post(`${BACKEND_URL}api/v1/auth/signup`, {
            username,
            password
        });
        expect(response.status).toBe(200);
        const updatedResponse = await axios.post(`${BACKEND_URL}api/v1/auth/login`, {
            username,
            password
        });
        expect(updatedResponse.status).toBe(400);
    });

    test('Should return 409 for duplicate sign-up', async () => {
        const username = "duplicate@gmail.com";
        const password = "password123";
    
        // First sign-up
        await axios.post(`${BACKEND_URL}api/v1/auth/signup`, {
            username,
            password
        });
    
        // Attempt duplicate sign-up
        const response = await axios.post(`${BACKEND_URL}api/v1/auth/signup`, {
            username,
            password
        }).catch(err => err.response);
    
        expect(response.status).toBe(409); // Conflict
        expect(response.data.error).toBe("User already exists");
    });

    test('Should return 200 for successful login', async () => {
        const username = "loginuser" + Math.floor(Math.random() * 1000) + "@gmail.com";
        const password = "password123";
    
        // Sign up first
        await axios.post(`${BACKEND_URL}api/v1/auth/signup`, {
            username,
            password
        });
    
        // Attempt login
        const response = await axios.post(`${BACKEND_URL}api/v1/auth/login`, {
            username,
            password
        });
    
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("token"); // JWT token returned
    });

    test('Should return 401 for invalid login credentials', async () => {
        const username = "invaliduser@gmail.com";
        const password = "wrongpassword";
    
        const response = await axios.post(`${BACKEND_URL}api/v1/auth/login`, {
            username,
            password
        }).catch(err => err.response);
    
        expect(response.status).toBe(401); // Unauthorized
        expect(response.data.error).toBe("Invalid credentials");
    });
    
    test('Should return 400 for missing fields in sign-up', async () => {
        const response = await axios.post(`${BACKEND_URL}api/v1/auth/signup`, {
            username: "missingfield@gmail.com"
        }).catch(err => err.response);
    
        expect(response.status).toBe(400); // Bad Request
        expect(response.data.error).toBe("Password is required");
    });
    
    
    
});
