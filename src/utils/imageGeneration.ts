import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

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
  const textPrompt = `Create a professional, high-quality image for a ${platform} social media post about: ${description}. 
The image should be:
- Visually appealing and modern
- Relevant to the topic: ${description}
- Appropriate for ${platform} platform
- Professional and engaging
- High resolution and clear
- Suitable for social media sharing`;

  if (imageBase64 && model.includes('gpt-4')) {
    // Use GPT-4.1 with vision for image editing
    const editPrompt = `Analyze this image and create a detailed description for editing it to match: ${description}. 
    The edited image should be suitable for a ${platform} social media post. 
    Provide specific instructions for how to modify the image to make it more relevant to: ${description}`;

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
      // Use GPT-4.1 with vision to analyze the image and provide editing instructions
      const visionResponse = await client.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: editPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const editingInstructions = visionResponse.choices[0].message.content;
      
      // Now use DALL-E 3 to generate a new image based on the analysis
      const enhancedPrompt = `${textPrompt}. Based on the analysis: ${editingInstructions}`;
      
      const response = await client.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
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
          success: true,
          editingInstructions // Include the analysis for debugging
        };
      }
    } catch (error) {
      console.error('GPT-4.1 vision analysis failed, falling back to DALL-E 3:', error);
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
