import { NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { description, platform, imageBase64 } = await req.json();
    console.log('Image generation request:', { description, platform, hasImage: !!imageBase64 });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Create a platform-specific image prompt
    const textPrompt = `Create a professional, high-quality image for a ${platform} social media post about: ${description}. 
    The image should be:
    - Visually appealing and modern
    - Relevant to the topic: ${description}
    - Appropriate for ${platform} platform
    - Professional and engaging
    - High resolution and clear
    - Suitable for social media sharing`;

    // Build the prompt array based on whether we have an input image
    let prompt;
    if (imageBase64) {
      // Extract base64 data and mime type (remove data:image/...;base64, prefix if present)
      let base64Data, mimeType;
      if (imageBase64.includes(',')) {
        const [header, data] = imageBase64.split(',');
        base64Data = data;
        mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
      } else {
        base64Data = imageBase64;
        mimeType = 'image/png';
      }
      
      prompt = [
        { text: textPrompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
      ];
    } else {
      // Text-only prompt
      prompt = textPrompt;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    console.log('Response from Gemini:', JSON.stringify(response, null, 2));

    // Extract image data from response
    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        console.log('Part:', JSON.stringify(part, null, 2));
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          
          console.log('Found image data, mimeType:', mimeType);
          return NextResponse.json({ 
            imageData,
            mimeType,
            success: true 
          });
        } else if (part.text) {
          console.log('Response contains text instead of image:', part.text);
        }
      }
    } else {
      console.log('No candidates found in response');
    }

    return NextResponse.json(
      { error: 'No image generated' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
