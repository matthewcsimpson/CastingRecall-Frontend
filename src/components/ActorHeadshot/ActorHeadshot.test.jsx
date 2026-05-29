import { render, screen } from "@testing-library/react";
import ActorHeadshot from "./ActorHeadshot";

const buildActor = (overrides = {}) => ({
  id: 1,
  name: "Tom Hanks",
  profile_path: "/tomhanks.jpg",
  sanitizedCharacter: "Woody",
  ...overrides,
});

describe("ActorHeadshot", () => {
  test("builds the headshot URL from profile_path", () => {
    render(<ActorHeadshot actor={buildActor()} revealCharNamesVisible={true} />);

    const image = screen.getByRole("img", { name: "Tom Hanks" });
    expect(image.getAttribute("src").endsWith("/tomhanks.jpg")).toBe(true);
  });

  test("uses the placeholder image when profile_path is missing", () => {
    render(
      <ActorHeadshot
        actor={buildActor({ profile_path: null })}
        revealCharNamesVisible={true}
      />,
    );

    const image = screen.getByRole("img", { name: "Tom Hanks" });
    expect(image.getAttribute("src")).toContain("profile-placeholder");
  });

  test("reveals the character name when visible", () => {
    render(<ActorHeadshot actor={buildActor()} revealCharNamesVisible={true} />);

    expect(screen.getByText("Woody")).toBeInTheDocument();
  });

  test("obscures the character name when not visible", () => {
    render(
      <ActorHeadshot actor={buildActor()} revealCharNamesVisible={false} />,
    );

    expect(screen.queryByText("Woody")).not.toBeInTheDocument();
    expect(screen.getByText("xxxxx")).toBeInTheDocument();
  });
});
