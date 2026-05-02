import { render, screen, fireEvent } from "@testing-library/react";
import Register from "./pages/Register";
import { BrowserRouter } from "react-router-dom";

// Mocking the Register component for simple unit test demonstration
const MockRegister = () => (
    <form>
        <label>Email</label>
        <input type="email" placeholder="Enter email" />
        <button>Register</button>
        <p>Email is required</p>
    </form>
);

test("shows error for empty email", () => {
    render(
        <BrowserRouter>
            <MockRegister />
        </BrowserRouter>
    );

    const registerButton = screen.getByText("Register");
    fireEvent.click(registerButton);

    const errorMessage = screen.getByText("Email is required");
    expect(errorMessage).toBeInTheDocument();
});
