// ── AI Provider abstraction ─────────────────────────────────────────────────
// Swap providers by changing the implementation here.

export interface AIProvider {
  complete(prompt: string): Promise<string>;
}

export function createGeminiProvider(apiKey: string): AIProvider {
  return {
    async complete(prompt: string): Promise<string> {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Gemini API error:", JSON.stringify(data));
        throw new Error(
          `Gemini API ${response.status}: ${data?.error?.message ?? "unknown error"}`
        );
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.error("Unexpected Gemini response:", JSON.stringify(data));
        throw new Error("No text in Gemini response");
      }

      return text;
    },
  };
}
