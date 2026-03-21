const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic.default();

async function synthesizeResearch(rawResults) {
  const prompt = `You are a research analyst working for Samantha, a fitness business coach who helps female fitness coaches stuck under $5k months reach consistent $10k months.

You have just completed research on what is currently performing in the online fitness business coaching niche on TikTok and Instagram.

Here are the raw search results from your research:

[RESEARCH RESULTS]
${rawResults}
[END RESEARCH RESULTS]

Your job is to analyze these results and extract only what is useful for content creation. You are looking for signal, not noise.

Return your response as valid JSON only. No preamble, no explanation, just JSON.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.content.find((block) => block.type === "text")?.text ?? "";
  const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

  return JSON.parse(cleaned);
}

module.exports = { synthesizeResearch };
