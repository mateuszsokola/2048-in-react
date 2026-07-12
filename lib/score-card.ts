const CARD_WIDTH = 600;
const CARD_HEIGHT = 315;

const COLORS = {
  background: "#faf8ef",
  won: "#edc22e",
  text: "#776e65",
  light: "#f9f6f2",
};

export function drawScoreCard({
  score,
  won,
}: {
  score: number;
  won: boolean;
}): string {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }

  ctx.fillStyle = won ? COLORS.won : COLORS.background;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = won ? COLORS.light : COLORS.text;
  ctx.font = "bold 96px system-ui, sans-serif";
  ctx.fillText("2048", CARD_WIDTH / 2, 90);

  ctx.font = "bold 48px system-ui, sans-serif";
  ctx.fillText(`I scored ${score}!`, CARD_WIDTH / 2, 180);

  ctx.font = "32px system-ui, sans-serif";
  ctx.fillText(
    won ? "I won \u{1F389}" : "Can you beat me?",
    CARD_WIDTH / 2,
    250,
  );

  return canvas.toDataURL("image/png");
}
