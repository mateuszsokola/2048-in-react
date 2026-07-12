import { drawScoreCard } from "@/lib/score-card";

describe("drawScoreCard", () => {
  const fakeCtx = {
    fillStyle: "",
    font: "",
    textAlign: "" as CanvasTextAlign,
    textBaseline: "" as CanvasTextBaseline,
    fillRect: jest.fn(),
    fillText: jest.fn(),
  };

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = jest.fn(() => fakeCtx) as never;
    HTMLCanvasElement.prototype.toDataURL = jest.fn(
      () => "data:image/png;base64,ABC123",
    ) as never;
  });

  beforeEach(() => jest.clearAllMocks());

  it("returns a PNG data URL", () => {
    const url = drawScoreCard({ score: 4820, won: false });
    expect(url).toMatch(/^data:image\/png/);
  });

  it("prints the score onto the card", () => {
    drawScoreCard({ score: 4820, won: true });
    const printed = fakeCtx.fillText.mock.calls.map((c) => c[0]).join(" ");
    expect(printed).toContain("4820");
  });
});
