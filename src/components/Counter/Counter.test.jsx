import { render, screen } from "@testing-library/react";
import Counter from "./Counter";

describe("Counter", () => {
  test("renders correct, incorrect, and hint guess rows", () => {
    render(
      <Counter
        guesses={[
          { id: 1, original_title: "Correct Movie", correct: true },
          { id: 2, original_title: "Wrong Movie", correct: false },
          { id: "hint-1", type: "hint", correct: null },
        ]}
      />,
    );

    expect(screen.getByText("✅ Correct Movie")).toBeInTheDocument();
    expect(screen.getByText("🟥 Wrong Movie")).toBeInTheDocument();
    expect(screen.getByText("💡 Hint used")).toBeInTheDocument();
  });

  test("ignores entries that do not match known display states", () => {
    render(
      <Counter
        guesses={[
          {
            id: 1,
            original_title: "Unknown State",
            correct: null,
            type: "movie",
          },
        ]}
      />,
    );

    expect(screen.queryByText("Unknown State")).not.toBeInTheDocument();
    expect(screen.queryByText("💡 Hint used")).not.toBeInTheDocument();
  });
});
