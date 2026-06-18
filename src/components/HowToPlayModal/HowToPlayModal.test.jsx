import { fireEvent, render, screen } from "@testing-library/react";
import HowToPlayModal from "./HowToPlayModal";

describe("HowToPlayModal", () => {
  test("renders nothing when closed", () => {
    render(<HowToPlayModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders the dialog when open", () => {
    render(<HowToPlayModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How to Play" }),
    ).toBeInTheDocument();
  });

  test("close button calls onClose", () => {
    const onClose = vi.fn();
    render(<HowToPlayModal isOpen={true} onClose={onClose} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Close how to play modal" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("clicking the backdrop itself closes the modal", () => {
    const onClose = vi.fn();
    render(<HowToPlayModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("dialog"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("clicking inside the dialog does not close the modal", () => {
    const onClose = vi.fn();
    render(<HowToPlayModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("heading", { name: "How to Play" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  test("Escape key closes the modal", () => {
    const onClose = vi.fn();
    render(<HowToPlayModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("non-Escape keys do not close the modal", () => {
    const onClose = vi.fn();
    render(<HowToPlayModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });
});
