// Copilot: Animated Reatchify logo (circle with rocket) for CLI
// Uses ASCII art and simple frame animation

const frames = [
  `
      (  🚀  )
     (      )
      (    )
        ()
  `,
  `
      ( 🚀   )
     (      )
      (    )
        ()
  `,
  `
      (   🚀 )
     (      )
      (    )
        ()
  `,
  `
      (    🚀)
     (      )
      (    )
        ()
  `,
];

export async function showLogoAnimation() {
  for (let i = 0; i < 2; i++) {
    for (const frame of frames) {
      process.stdout.write("\x1Bc"); // clear screen
      console.log("\x1b[36m" + frame + "\x1b[0m");
      await new Promise((r) => setTimeout(r, 120));
    }
  }
  process.stdout.write("\x1Bc");
  console.log(
    "\x1b[36m      (  🚀  )\n     (      )\n      (    )\n        ()\x1b[0m"
  );
  console.log("\x1b[1mWelcome to Reatchify!\x1b[0m\n");
}
