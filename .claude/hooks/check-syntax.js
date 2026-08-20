import { execFileSync } from "node:child_process";

let data = "";
process.stdin.on("data", (c) => (data += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(data);
  } catch {
    process.exit(0);
  }

  const filePath = input.tool_input?.file_path ?? input.tool_response?.filePath;
  if (!filePath || !/\.(js|mjs|cjs)$/.test(filePath)) {
    process.exit(0);
  }

  try {
    execFileSync("node", ["--check", filePath], { stdio: "pipe" });
  } catch (err) {
    console.log(
      JSON.stringify({
        decision: "block",
        reason: `Syntax error in ${filePath}:\n${err.stderr?.toString() ?? err.message}`,
      })
    );
  }
});
