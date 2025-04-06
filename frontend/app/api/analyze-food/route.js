import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic with server-side API key
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true 
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
      return Response.json({ error: 'Missing image data' }, { status: 400 });
    }
    
    const content = [];

    // Add each image to the content array
    body.images.forEach((image, i) => {
      content.push({
        type: "text",
        text: `Image ${i + 1}:`
      });

      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: image.mediaType,
          data: image.imageData
        }
      });
    });

    // Add instruction
    content.push({
      type: "text",
      text: `You are a food safety inspector specializing in reducing food waste. 
For each image, give a very short, natural-language summary (2–3 sentences max) of what you see, 
including whether the food appears fresh and safe to eat. 
Be casual, clear, and human — no bullet points, no markdown, no section titles.
At the end of each analysis, write either: FINAL VERDICT: UNSAFE or FINAL VERDICT: SAFE.`
    });

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 200,
      temperature: 0.7,
      system: "You are a food safety inspector tasked with determining if food can be safely eaten or should be thrown out.",
      messages: [
        {
          role: "user",
          content: content
        }
      ]
    });

    return Response.json({ result: response.content[0].text });

  } catch (error) {
    console.error("Error analyzing food images:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
