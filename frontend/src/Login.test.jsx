import { render, screen } from "@testing-library/react";
import Login from "./Login";

test("Login button should be visible", () => {
    render(<Login />);
    const buttonElement = screen.getByText(/login/i);
    expect(buttonElement).toBeInTheDocument();
});
