import { render, screen } from "@testing-library/react";
import { Header } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn().mockImplementation(() => ({
    asPath: "/",
  })),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn().mockImplementation(() => [null, false]),
}));

describe("Header component", () => {
  it("should be able to renders correctly", () => {
    render(<Header />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Posts")).toBeInTheDocument();
  });
});
