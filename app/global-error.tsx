"use client";

/** Shown only when the root layout itself fails; kept plain so it cannot fail again. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#1f2b4d", background: "#fff" }}>
        <main style={{ maxWidth: 640, margin: "20vh auto", padding: "0 24px" }}>
          <p style={{ fontSize: 13, color: "#646b81" }}>EngineMarket</p>
          <h1 style={{ fontWeight: 400, fontSize: 40, lineHeight: 1.1 }}>Something broke on our side</h1>
          <p style={{ fontSize: 18 }}>The page did not load. Try again, or call +421 2 3300 4400 if it keeps happening.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ height: 44, padding: "0 24px", border: 0, borderRadius: 8, background: "#f7941d", color: "#1f2b4d", font: "500 16px system-ui", cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
