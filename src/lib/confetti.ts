// Lightweight DOM confetti burst shared by celebration moments
// (rank ascension, reward redemption). No dependencies.
export function triggerConfetti() {
  if (typeof document === "undefined") return;
  const colors = ["#00ff87", "#00d4ff", "#fbbf24", "#f472b6", "#a78bfa"];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement("div");
    el.style.cssText = `position: fixed; width: 8px; height: 8px; border-radius: 50%; background: ${colors[Math.floor(Math.random() * colors.length)]}; left: 50%; top: 50%; pointer-events: none; z-index: 9999; animation: confettiBurst 1.2s ease-out forwards; --tx: ${(Math.random() - 0.5) * 400}px; --ty: ${(Math.random() - 0.5) * 400}px;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
  if (!document.getElementById("confetti-style")) {
    const style = document.createElement("style");
    style.id = "confetti-style";
    style.textContent = `@keyframes confettiBurst { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }`;
    document.head.appendChild(style);
  }
}
