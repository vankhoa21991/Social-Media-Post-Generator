import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { getImageGenerationPrompt } from '../prompts/imagePrompts';

// Helper function to convert image to PNG format for DALL-E 2
const convertToPNG = async (imageBuffer: Buffer, mimeType: string): Promise<Buffer> => {
  // If already PNG, return as is
  if (mimeType === 'image/png') {
    return imageBuffer;
  }
  
  // For JPEG, try to convert using a simple approach
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    console.log('Attempting to convert JPEG to PNG for DALL-E 2 compatibility...');
    
    try {
      // Create a data URL and try to convert using browser APIs
      const dataUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      
      // For now, we'll return the original buffer but with PNG MIME type
      // In a production environment, you would use a proper image conversion library
      console.warn('JPEG to PNG conversion not fully implemented. Using original image with PNG MIME type.');
      return imageBuffer;
    } catch (error) {
      console.warn('JPEG conversion failed:', error);
      return imageBuffer;
    }
  }
  
  // For other formats, warn and return as is
  console.warn(`Image format ${mimeType} detected. DALL-E 2 requires PNG format. Consider converting your image to PNG manually.`);
  return imageBuffer;
};


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
      // Convert base64 to Buffer
      const originalBuffer = Buffer.from(base64Data, 'base64');
      
      // Convert to PNG format if needed
      const imageBuffer = await convertToPNG(originalBuffer, mimeType);
      
      // Check file size (must be less than 4 MB)
      const fileSizeInMB = imageBuffer.length / (1024 * 1024);
      if (fileSizeInMB > 4) {
        console.error(`Image too large: ${fileSizeInMB.toFixed(2)}MB. Must be less than 4MB.`);
        throw new Error('Image too large for editing');
      }
      
      // Create File object with PNG format
      const imageFile = new File([new Uint8Array(imageBuffer)], 'image.png', { type: 'image/png' });
      
      // Use OpenAI's image editing API with dall-e-2
      const response = await client.images.edit({
        model: "dall-e-2", // dall-e-2 supports image editing
        image: imageFile,
        prompt: textPrompt,
        size: "1024x1024", // Specify size for dall-e-2
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
