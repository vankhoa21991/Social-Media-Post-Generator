import { NextResponse } from 'next/server';
import { generateImage } from '../../../utils/imageGeneration';

export async function POST(req: Request) {
  try {
    const { description, platform, imageBase64, model } = await req.json();
    console.log('Image generation request:', { description, platform, hasImage: !!imageBase64, model });

    // Check if required API keys are configured
    const isGeminiModel = (model || "gemini-2.5-flash-image-preview").includes('gemini');
    const requiredApiKey = isGeminiModel ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
    
    if (!process.env[requiredApiKey]) {
      return NextResponse.json(
        { error: `${requiredApiKey} not configured` },
        { status: 500 }
      );
    }

    const result = await generateImage(
      model || "gemini-2.5-flash-image-preview",
      description,
      platform,
      imageBase64
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
