import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { description, platform, strategy, imageBase64 } = await req.json();
    console.log('Image generation request:', { description, platform, strategy, hasImage: !!imageBase64 });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const textStrategyPrompt1 =  `Create a professional, high-quality image for a ${platform} social media post.
    A split image showing a dramatic 'before and after' home renovation. 
    The 'before' side depicts a worn, old wooden window with peeling paint and a drab interior. 
    The 'after' side showcases a sleek, modern dark grey Tryba PVC window, flooding the same room with natural light, alongside a chic, minimalist interior design. 
    The overall aesthetic is bright, elegant, and highlights a significant upgrade in quality and style. 
    High-resolution, architectural photography style`;
    
    const textStrategyPrompt2 = `Create a professional, high-quality image for a ${platform} social media post.
    Wide-angle image of a bright and modern living room interior with a large Tryba sliding glass door, seen from the inside.
    The sofa is comfortable and stylish, and green plants add a touch of nature.
    Natural light floods the room, offering a breathtaking view of a lush garden. A clean and warm Scandinavian style.`;

    const textStrategyPrompt3 = `Create a professional, high-quality image for a ${platform} social media post.
    Photo of a modern Tryba front door, anthracite-colored with aluminum inserts, on a contemporary house facade.
    Elegant potted plants frame the entrance.
    Sunlight highlights the door details.
    A welcoming and secure atmosphere.`;

    const textStrategyPrompt4 = `Create a professional, high-quality image for a ${platform} social media post.
    Conceptual image showing a modern house with Tryba windows. 
    Subtle graphic elements (such as green arrows or a stylized thermometer) symbolize energy savings and good insulation. 
    The atmosphere is warm and efficient.`;

    const textStrategyPrompt5 = `Create a professional, high-quality image for a ${platform} social media post.
    Team photo of three smiling Tryba installers, dressed in their work uniforms (Tryba logo visible), posing in front of a house recently fitted with Tryba windows and doors. 
    They are holding tools in a relaxed manner. 
    A professional and friendly atmosphere.`;

    const textStrategyPrompt6 = `Create a professional, high-quality image for a ${platform} social media post.
    A close-up of the hands of a skilled Tryba craftsman, wearing protective gloves, performing meticulous quality control on the seal of a new window in the workshop. 
    The background is blurred, revealing machinery and other elements of the manufacturing plant. 
    An atmosphere of precision and industrial craftsmanship.`;

    const textStrategyPrompt7 = `Create a professional, high-quality image for a ${platform} social media post.
    Photo of a Tryba window being tested in a quality center, with powerful water jets simulating rain. 
    The emphasis is on the product's strength and watertightness. 
    Scientific and rigorous atmosphere. Add a TRYBA logo to the image.`;

    const textStrategyPrompt8 = `Create a professional, high-quality image for a ${platform} social media post.
    Photo of a smiling customer in her 50s, sitting comfortably in her living room, confidently reading a book on her new Tryba windows. 
    Sunlight floods the room. The image evokes satisfaction and well-being after installation. 
    Add this TRYBA logo to it.`;
    
    const textStrategyPrompt9 = `Create a professional, high-quality image for a ${platform} social media post.
    Image for "3 Criteria for Choosing Your Glazing": "Visually appealing infographic showing three distinct icons (a snowflake for thermal insulation, a barred ear for sound insulation, a shield for security) with a new stylized Tryba window in the background. 
    The colors are clear and professional. The whole thing is elegant and easy to understand."`;

    const textStrategyPrompt10 = `Create a professional, high-quality image for a ${platform} social media post.
    Background image for an Instagram Story: A light brick wall with an old, faded window frame in the center. 
    The bottom of the image is a soft color gradient (light blue to white) to easily overlay interactive questions and polls. 
    Add a question to reflect TRYBA's values. Neutral and elegant atmosphere.`;

    const textStrategyPrompt11 = `Create a professional, high-quality image for a ${platform} social media post.
    Photo of a recent detached house, with a magnificent anthracite gray Tryba front door visible. 
    A small map pin is subtly inlaid in the bottom right, indicating the city of Carcassonne. 
    The sky is clear and bright. Add the TRYBA logo to this image`;

    const textStrategyPrompt12 = `Create a professional, high-quality image for a ${platform} social media post.
    Festive and engaging image: A stylized window frame with confetti and cheerful graphics. 
    In the center, the text 'TRYBA COMPETITION' is written attractively, with a small text below like 'Share your best view!'. 
    The atmosphere is cheerful and inviting.`;

    // Create a platform-specific image prompt based on strategy
    let textPrompt;
    
    switch (strategy) {
      case 'before-after':
        textPrompt = textStrategyPrompt1;
        break;
      case 'interior-lifestyle':
        textPrompt = textStrategyPrompt2;
        break;
      case 'front-door':
        textPrompt = textStrategyPrompt3;
        break;
      case 'energy-efficiency':
        textPrompt = textStrategyPrompt4;
        break;
      case 'team-installation':
        textPrompt = textStrategyPrompt5;
        break;
      case 'quality-control':
        textPrompt = textStrategyPrompt6;
        break;
      case 'testing-facility':
        textPrompt = textStrategyPrompt7;
        break;
      case 'customer-satisfaction':
        textPrompt = textStrategyPrompt8;
        break;
      case 'infographic':
        textPrompt = textStrategyPrompt9;
        break;
      case 'story-background':
        textPrompt = textStrategyPrompt10;
        break;
      case 'location-showcase':
        textPrompt = textStrategyPrompt11;
        break;
      case 'competition':
        textPrompt = textStrategyPrompt12;
        break;
      default:
        textPrompt = `Create a professional, high-quality image for a ${platform} social media post about: ${description}. 
        The image should be:
        - Visually appealing and modern
        - Relevant to the topic: ${description}
        - Appropriate for ${platform} platform
        - Professional and engaging
        - High resolution and clear
        - Suitable for social media sharing`;
    }
    
    // Build the prompt array based on whether we have an input image
    let prompt: any;
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
