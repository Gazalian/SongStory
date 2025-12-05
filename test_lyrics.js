const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyBOjNPqD-ZQECAs_2cElaPHhiVjeHpFhGw";
const genAI = new GoogleGenerativeAI(apiKey);

async function testLyrics() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const title = "Hello";
    const artist = "Adele";

    const prompt = `Analyze the lyrics of "${title}" by "${artist}" section by section.

    Return a JSON array where each object has:
    {
      "section": "section name (e.g., Verse 1, Chorus, Bridge)",
      "text": "the actual lyrics for this section",
      "analysis": "detailed interpretation and meaning"
    }

    Include all major sections of the song.`;

    console.log("Sending prompt...");
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Response received:");
        console.log(text);
    } catch (error) {
        console.error("Error:", error);
    }
}

testLyrics();
