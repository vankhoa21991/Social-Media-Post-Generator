import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSystemPrompt } from '../../../prompts/systemPrompt';
import { getPromptForPlatform } from '../../../prompts/platformPrompts';

const getChatAIClient = (model: string) => {
  const isGeminiModel = model.includes('gemini');

  if (isGeminiModel) {
    return new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });
  } else {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.openai.com/v1"
    });
  }
};


export async function POST(req: Request) {
  try {
    const {
      platform,
      description,
      makeThread,
      wordLimit,
      tone,
      model,
      includeHashtags,
      includeEmoji,
      imageBase64,
    } = await req.json();

    console.log('Post generation request:', { platform, description, tone, model });

    const prompt = getPromptForPlatform(
      platform,
      description,
      makeThread,
      wordLimit,
      tone,
      includeHashtags,
      includeEmoji
    );

    const systemPrompt = getSystemPrompt(
      tone,
      includeEmoji,
      includeHashtags,
      platform,
      makeThread
    );

    const openai = getChatAIClient(model || "gemini-2.5-flash");

    // Prepare messages array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add user message with or without image
    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64
            }
          }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: prompt
      });
    }

    const completion = await openai.chat.completions.create({
      messages,
      model: model,
      temperature: 0.7,
    });

    return NextResponse.json({ content: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
