import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to offline mock responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback offline generator in case API key is missing or calls limit reached
const OFFLINE_CAPTIONS = [
  "Building the future, one bracket at a time. 🚀 #typescript #codingstyle",
  "Consistency beats intensity. Pushed 12 modifications and feel fantastic. 💪 #development #dailygrind",
  "Nothing like early morning coffee and full-stack architecture mapping. ☕✨ #minimalist #designer",
  "They told me to get a hobby, so I started compiling state machines. 🤖 #nerdpoetry"
];

const OFFLINE_IDEAS = [
  "A quick tutorial showing how to configure lazy initializers in custom ESM routes.",
  "Your minimalist mechanical keyboard layout showcasing custom custom resin keycaps.",
  "A vertical reel detailing 3 crucial extensions in VSCode that save 10 hours a week.",
  "An anonymous confession sharing your deepest imposter-syndrome and how you overcame it."
];

export async function generateCaption(topic: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return OFFLINE_CAPTIONS[Math.floor(Math.random() * OFFLINE_CAPTIONS.length)] + ` (About: ${topic})`;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate an engaging social media caption about the following brand or concept. Keep it concise, creative, and under 30 words. Topic: "${topic}"`,
    });
    return response.text || "Coding my way through the stack.";
  } catch (err) {
    console.error("Gemini Caption generation failed:", err);
    return `Building awesome projects centered on ${topic}! #developer`;
  }
}

export async function generateHashtags(topic: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return ["coding", topic.toLowerCase().replace(/\s+/g, ""), "developer", "instapro"];
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `List 5 popular social media hashtags related to "${topic}". Return ONLY a JSON array of strings, without any markdown or backticks. Example shape: ["tag1", "tag2"]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    try {
      const text = response.text?.trim() || "[]";
      return JSON.parse(text);
    } catch {
      // Manual regex fallback if json schema parsing fails
      const cleaned = response.text?.replace(/[\[\]"]/g, "") || "";
      return cleaned.split(",").map(t => t.trim()).filter(Boolean);
    }
  } catch (err) {
    console.error("Gemini Hashtags generation failed, using defaults:", err);
    return [topic.toLowerCase().replace(/\s+/g, ""), "trend", "builds", "instapro"];
  }
}

export async function generateBio(skills: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `Full stack developer specializing in ${skills}. Constantly coding, pushing metrics! ✨`;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a premium, modern, bio for my profile based on these skills or interests. Keep it punchy, smart, under 80 characters, and include 1 emoji. Skills: "${skills}"`,
    });
    return response.text?.trim() || "Crafting experiences on InstaPro.";
  } catch (err) {
    console.error("Gemini Bio generation failed:", err);
    return `Full-stack wizard focused on ${skills}. Let's build.`;
  }
}

export async function getContentSuggestions(niche: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return OFFLINE_IDEAS;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Based on the user's interest niche or profile topics, generate 4 creative post ideas or content themes for stories, posts, or reels. Return ONLY a JSON array of 4 strings. Niche: "${niche}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text?.trim() || "[]");
  } catch (err) {
    console.error("Gemini Suggestions failed:", err);
    return OFFLINE_IDEAS;
  }
}

export interface ModerationResult {
  isSpam: boolean;
  score: number; // 0 to 100
  reason: string;
  recommendation: "approve" | "flag" | "block";
}

export async function moderateComment(text: string): Promise<ModerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Basic offline local filter list
    const badWords = ["spam", "buy followers", "crypto rich", "click link", "scam"];
    const isSpam = badWords.some(w => text.toLowerCase().includes(w));
    return {
      isSpam,
      score: isSpam ? 95 : 12,
      reason: isSpam ? "Contains unauthorized advertising/scam keywords" : "Comment appears respectful",
      recommendation: isSpam ? "block" : "approve"
    };
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Examine this text block for spam, self-promotion, link farming, hate speech, or abuse. Determine a spam/toxicity score from 0 to 100, a recommendation, and action reason. Text to inspect: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSpam: { type: Type.BOOLEAN },
            score: { type: Type.INTEGER },
            reason: { type: Type.STRING },
            recommendation: { type: Type.STRING, description: "Must be one of 'approve', 'flag', 'block'" }
          },
          required: ["isSpam", "score", "reason", "recommendation"]
        }
      }
    });

    return JSON.parse(response.text?.trim() || "{}") as ModerationResult;
  } catch (err) {
    console.error("Gemini Moderation failed:", err);
    return {
      isSpam: false,
      score: 10,
      reason: "Bypassed due to system error",
      recommendation: "approve"
    };
  }
}

export interface ProfileReviewResult {
  score: number; // 0 to 100
  critique: string;
  actionableUpgrades: string[];
}

export async function reviewProfile(username: string, bio: string, website: string, followers: number, following: number): Promise<ProfileReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Offline local assessment
    return {
      score: bio ? 75 : 40,
      critique: "Your profile has good basic specs but lacks clear technical positioning tags.",
      actionableUpgrades: [
        "Include relevant system hashtags in your bio like #typescript or #design.",
        "Add a valid secure landing website URL to foster trust with followers.",
        "Include verified achievement badges on our communities views."
      ]
    };
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Act as a senior branding expert. Critique the insta/threads social presence of username "@${username}". Bio: "${bio}". Web: "${website}". Followers: ${followers}. Following: ${following}. rate quality score (0 to 100), give critique, and list exactly 3 distinct actionable upgrades to increase engagement.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            critique: { type: Type.STRING },
            actionableUpgrades: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "critique", "actionableUpgrades"]
        }
      }
    });

    return JSON.parse(response.text?.trim() || "{}") as ProfileReviewResult;
  } catch (err) {
    console.error("Gemini Profile review failed:", err);
    return {
      score: 65,
      critique: "Review failed to compile. Maintain consistency in your postings and engaging commentary.",
      actionableUpgrades: ["Refresh bio with active hashtags.", "Engage with verification badges.", "Upload more direct code reels."]
    };
  }
}
