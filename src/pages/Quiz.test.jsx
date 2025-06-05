import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Quiz from "./Quiz";
import "@testing-library/jest-dom";

// 🧪 Mock Supabase
jest.mock("../supabaseClient", () => ({
    supabase: {
        from: () => ({
            select: () => ({
                data: [
                    {
                        sector: "Health",
                        county: "Limerick",
                        location_type: "Ireland",
                        "languages/tools": "React, Java",
                    },
                ],
                error: null,
            }),
        }),
    },
}));

afterEach(() => {
    jest.resetAllMocks();
    global.fetch = undefined; // 🔄 Ensures clean fetch state
});

describe("Quiz Component", () => {
    test("renders main heading", async () => {
        await act(async () => {
            render(<Quiz />);
        });
        expect(screen.getByText(/residency quiz/i)).toBeInTheDocument();
    });

    test("renders location, sector, and tool inputs", async () => {
        await act(async () => {
            render(<Quiz />);
        });

        await waitFor(() => {
            expect(screen.getByTestId("slider-location-Limerick")).toBeInTheDocument();
            expect(screen.getByTestId("slider-sector-Health")).toBeInTheDocument();
            expect(screen.getByTestId("checkbox-React")).toBeInTheDocument();
        });
    });

    test("selects duration from dropdown", async () => {
        await act(async () => {
            render(<Quiz />);
        });
        const dropdown = screen.getByDisplayValue("Residency 1");
        fireEvent.change(dropdown, { target: { value: "Residency 2" } });
        expect(dropdown.value).toBe("Residency 2");
    });

    test("submits form and displays results", async () => {
        await act(async () => {
            render(<Quiz />);
        });

        await waitFor(() => {
            expect(screen.getByTestId("slider-location-Limerick")).toBeInTheDocument();
            expect(screen.getByTestId("slider-sector-Health")).toBeInTheDocument();
            expect(screen.getByTestId("checkbox-React")).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId("slider-location-Limerick"), {
            target: { value: 4 },
        });
        fireEvent.change(screen.getByTestId("slider-sector-Health"), {
            target: { value: 4 },
        });
        fireEvent.click(screen.getByTestId("checkbox-React"));

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        "Company A",
                        "Company B",
                    ]),
            })
        );

        const button = screen.getByRole("button", { name: /find matches/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText("Company A")).toBeInTheDocument();
            expect(screen.getByText("Company B")).toBeInTheDocument();
        });
    });
});
