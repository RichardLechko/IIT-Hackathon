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
      // Text description for this image
      content.push({
        type: "text",
        text: `Image ${i + 1}:`
      });
      
      // The image itself
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: image.mediaType,
          data: image.imageData
        }
      });
    });
    
    // Add the instruction at the end
    content.push({
      type: "text",
      text: "For each food image, analyze it and provide:\n1. A brief description of what you see\n2. An estimation of its approximate shelf life based on visual characteristics\n3. FINAL VERDICT: Clearly state either 'COMPOST' (if it has gone bad) or 'SAVE' (if it can still be safely given to someone)\n\nFor each image, end your analysis with a clear, bold final verdict on its own line stating: **FINAL VERDICT: COMPOST** or **FINAL VERDICT: SAVE**"
    });
    
    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 200,
      temperature: 0.7,
      system: "You are a food safety inspector specializing in reducing food waste. Analyze each food image carefully and provide a verdict on whether the food should be composted or if it can be saved and given to someone else. Your analysis MUST end with a clear 'FINAL VERDICT: COMPOST' or 'FINAL VERDICT: SAVE' statement. Be practical and realistic in your assessment.",
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