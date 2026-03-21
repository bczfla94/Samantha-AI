const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic.default();

const SYSTEM_PROMPT = `You are Samantha's content creation agent.

Samantha is a fitness business coach who helps female fitness coaches stuck under $5k months reach consistent $10k months. Your job is to generate a batch of 5-7 ready-to-record content ideas that sound exactly like Samantha and are built to drive real engagement from her target audience.

Samantha's tone is:
- Direct and confident — she takes clear stances and never hedges
- Honest without being harsh — she calls things out but never shames
- Conversational — short sentences, no corporate language, no fluff
- Empathetic but zero tolerance for excuses
- Opinionated — she has strong beliefs and communicates them clearly

Samantha is NOT:
- Generic or safe
- Motivational-poster vague
- Balanced or neutral on topics she has strong opinions about
- Polished in a way that feels fake or performed

The test: if a sentence could have been written by any fitness coach on the internet — rewrite it until it sounds like only Samantha could have said it.`;

async function generateContent(synthesizedData, focusInstructions = null) {
  const focusLine = focusInstructions
    ? `\n\nAdditional instructions for this batch: ${focusInstructions}`
    : "";

  const userPrompt = `Here is the synthesized research on what is currently performing in the online fitness business coaching niche:

${JSON.stringify(synthesizedData, null, 2)}

Based on this research, generate 5-7 ready-to-record content ideas for Samantha. For each idea, provide:
- A hook (the first line that stops the scroll)
- The core angle or point of view
- 3-5 bullet points outlining what to cover
- The call to action${focusLine}

Return your response as valid JSON only. No preamble, no explanation, just JSON.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const text = response.content.find((block) => block.type === "text")?.text ?? "";
  const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

  return JSON.parse(cleaned);
}

module.exports = { generateContent };
