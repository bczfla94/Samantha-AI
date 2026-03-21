const Anthropic = require("@anthropic-ai/sdk");
const { searchQueries } = require("./config");

const client = new Anthropic.default();

async function runResearch() {
  const results = [];

  for (const query of searchQueries) {
    console.log(`Researching: ${query}`);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      tools: [{ type: "web_search_20260209", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `Search for and summarize what's currently working and trending for this topic: ${query}. Focus on specific tactics, formats, and patterns that are getting high engagement right now.`,
        },
      ],
    });

    const textBlocks = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    results.push(`=== QUERY: ${query} ===\n${textBlocks}`);

    await new Promise((resolve) => setTimeout(resolve, 30000));
  }

  return results.join("\n\n");
}

module.exports = { runResearch };
