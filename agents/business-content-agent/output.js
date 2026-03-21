const fs = require("fs");
const path = require("path");

function formatContentIdeas(contentIdeas) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lines = [
    `# Content Ideas for Samantha`,
    `*Generated on ${date}*`,
    `---`,
    "",
  ];

  const ideas = Array.isArray(contentIdeas)
    ? contentIdeas
    : contentIdeas.content_ideas ?? contentIdeas.ideas ?? Object.values(contentIdeas)[0];

  ideas.forEach((idea, index) => {
    lines.push(`## Idea ${index + 1}`);
    lines.push("");

    lines.push(`### Hook`);
    lines.push(`> ${idea.hook}`);
    lines.push("");

    lines.push(`### Angle / POV`);
    lines.push(idea.angle ?? idea.core_angle ?? idea.pov ?? idea.angle_or_pov ?? "");
    lines.push("");

    lines.push(`### Talking Points`);
    const points = idea.talking_points ?? idea.bullet_points ?? idea.points ?? [];
    points.forEach((point) => {
      lines.push(`- ${point}`);
    });
    lines.push("");

    lines.push(`### Call to Action`);
    lines.push(idea.call_to_action ?? idea.cta ?? "");
    lines.push("");

    lines.push("---");
    lines.push("");
  });

  return lines.join("\n");
}

function writeOutput(contentIdeas) {
  const outputPath = path.join(__dirname, "output.md");
  const markdown = formatContentIdeas(contentIdeas);
  fs.writeFileSync(outputPath, markdown, "utf8");
  console.log(`Output written to ${outputPath}`);
  return outputPath;
}

module.exports = { writeOutput };
