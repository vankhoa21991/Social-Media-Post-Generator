import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { getImageGenerationPrompt } from '../prompts/imagePrompts';


export const getImageGenerationClient = (model: string) => {
  const isGeminiModel = model.includes('gemini');
  const isGPT4Model = model.includes('gpt-4');

  if (isGeminiModel) {
    return {
      type: 'gemini' as const,
      client: new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
      })
    };
  } else if (isGPT4Model) {
    return {
      type: 'openai' as const,
      client: new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
        baseURL: "https://api.openai.com/v1"
      })
    };
  } else {
    // Default to OpenAI for DALL-E models
    return {
      type: 'openai' as const,
      client: new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
        baseURL: "https://api.openai.com/v1"
      })
    };
  }
};

export const generateImageWithGemini = async (
  client: GoogleGenAI,
  description: string,
  platform: string,
  imageBase64?: string
) => {
  const textPrompt = getImageGenerationPrompt(platform, description);

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

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: prompt,
  });

  // Extract image data from response
  if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';

        console.log('Found image data, mimeType:', mimeType);
        return {
          imageData,
          mimeType,
          success: true
        };
      } else if (part.text) {
        console.log('Response contains text instead of image:', part.text);
      }
    }
  }

  throw new Error('No image generated');
};

export const generateImageWithOpenAI = async (
  client: OpenAI,
  description: string,
  platform: string,
  imageBase64?: string,
  model: string = "dall-e-3"
) => {
  const textPrompt = getImageGenerationPrompt(platform, description);

  if (imageBase64 && model.includes('gpt-4')) {
    // Use OpenAI's image editing API with DALL-E 2

    // Extract base64 data and mime type
    let base64Data, mimeType;
    if (imageBase64.includes(',')) {
      const [header, data] = imageBase64.split(',');
      base64Data = data;
      mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
    } else {
      base64Data = imageBase64;
      mimeType = 'image/png';
    }

    try {
      const response = await client.responses.create({
        model: "gpt-4.1", // need to enable this model
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: textPrompt,
              },
              {
                type: "input_image",
                detail: "low",
                image_url: `data:image/jpeg;base64,${base64Data}`,
              }
            ]
          }
        ],
        tools: [{ type: "image_generation" }]
      });

      const imageData = response.output
        .filter((output) => output.type === "image_generation_call")
        .map((output) => output.result);

      if (imageData.length > 0) {
        return {
          imageData: imageData[0],
          mimeType: 'image/png',
          success: true
        };
      }
    } catch (error) {
      console.error('OpenAI image editing failed, falling back to DALL-E 3 generation:', error);
      // Fall back to regular DALL-E 3 generation
    }
  }

  // Regular DALL-E 3 generation (text-only or fallback)
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: textPrompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
    response_format: "b64_json"
  });

  if (response.data && response.data.length > 0) {
    const imageData = response.data[0].b64_json;
    return {
      imageData,
      mimeType: 'image/png',
      success: true
    };
  }

  throw new Error('No image generated');
};

export const generateImage = async (
  model: string,
  description: string,
  platform: string,
  imageBase64?: string
) => {
  const { type, client } = getImageGenerationClient(model);

  if (type === 'gemini') {
    return await generateImageWithGemini(client as GoogleGenAI, description, platform, imageBase64);
  } else {
    return await generateImageWithOpenAI(client as OpenAI, description, platform, imageBase64, model);
  }
};
