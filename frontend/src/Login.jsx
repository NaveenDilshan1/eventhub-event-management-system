import React, { useState } from "react";

const Login = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoggedIn(true);
    };

    if (isLoggedIn) {
        // Redirect simulation: change URL or show dashboard text
        window.history.pushState({}, "", "/dashboard");
        return <div id="dashboard">Welcome to Dashboard</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Account Access</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input id="email" type="email" required />
                </div>
                <div>
                    <label>Password:</label>
                    <input id="password" type="password" required />
                </div>
                <button id="loginBtn" type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
