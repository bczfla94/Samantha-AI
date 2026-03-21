const { runResearch } = require("./research");
const { synthesizeResearch } = require("./synthesize");
const { generateContent } = require("./generate");
const { writeOutput } = require("./output");

async function main() {
  const focusInstructions = process.argv[2] ?? null;

  console.log("Starting content research agent...");
  if (focusInstructions) {
    console.log(`Focus instructions: "${focusInstructions}"`);
  }

  console.log("\n[1/4] Running research...");
  const rawResults = await runResearch();

  console.log("\n[2/4] Synthesizing research...");
  const synthesizedData = await synthesizeResearch(rawResults);

  console.log("\n[3/4] Generating content ideas...");
  const contentIdeas = await generateContent(synthesizedData, focusInstructions);

  console.log("\n[4/4] Writing output...");
  const outputPath = writeOutput(contentIdeas);

  console.log(`\nDone! Open ${outputPath} to see your content ideas.`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
