import { render, screen } from "@testing-library/react";
import LoadingScreen from "./LoadingScreen";

describe("LoadingScreen", () => {
  test("renders the loading image", () => {
    render(<LoadingScreen />);

    expect(screen.getByRole("img", { name: "loading" })).toBeInTheDocument();
  });
});
