/**
 * Extracts and parses JSON from an AI response string.
 * Handles both raw JSON and JSON wrapped in markdown code blocks.
 */
export function parseJsonResponse(content: string): any {
  let cleaned = content.trim();
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) cleaned = jsonBlockMatch[1].trim();
  return JSON.parse(cleaned);
}
