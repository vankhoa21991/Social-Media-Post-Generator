import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { description, platform, strategy, imageBase64, client, referenceImages } = await req.json();
    console.log('Image generation request:', { description, platform, strategy, hasImage: !!imageBase64, client, hasReferenceImages: !!referenceImages });

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

    // CLAKEVENT specific strategies
    const clakeventStrategy1 = `Create a professional, high-quality image for a ${platform} social media post.
    A stretch tent configured as a cozy outdoor lounge area for an evening event. Features low tables, comfortable floor cushions and poufs, bohemian decor elements, and warm fairy lights. People are relaxing and socializing. The CLAK EVENT logo should be visible somewhere in the image.`;

    const clakeventStrategy2 = `Create a professional, high-quality image for a ${platform} social media post.
    A stretch tent arranged for a modern corporate event or product launch, with a stage for presentations, sleek white lounge furniture, subtle brand lighting, and a professional, uncluttered aesthetic. The CLAK EVENT logo is projected onto a screen.`;

    const clakeventStrategy3 = `Create a professional, high-quality image for a ${platform} social media post.
    A vibrant and playful stretch tent setup for a child's birthday party, with colorful balloons, kid-friendly low tables and chairs, fun decorations, and maybe some games or activities visible. Bright and cheerful atmosphere. The CLAK EVENT logo should be visible.`;

    const clakeventStrategy4 = `Create a professional, high-quality image for a ${platform} social media post.
    A team of CLAK EVENT employees proudly posing in front of a recently erected stretch tent, wiping sweat from their brows but smiling, showing their professionalism and teamwork. Tools and equipment are neatly placed around.`;

    const clakeventStrategy5 = `Create a professional, high-quality image for a ${platform} social media post.
    A happy newlywed couple laughing and looking at each other under a beautiful CLAK EVENT stretch tent, decorated with wedding lights and flowers. The image should evoke joy and satisfaction. Text overlay: 'Notre mariage était parfait sous cette tente magnifique !' The CLAK EVENT logo should be visible.`;

    const clakeventStrategy6 = `Create a professional, high-quality image for a ${platform} social media post.
    A group of friends enjoying a casual garden party under a CLAK EVENT stretch tent, holding drinks and smiling. The atmosphere is relaxed and fun. Text overlay: 'Meilleure ambiance de soirée grâce à CLAK EVENT !' The CLAK EVENT logo should be visible.`;

    const clakeventStrategy7 = `Create a professional, high-quality image for a ${platform} social media post.
    An elegant outdoor cocktail bar setup under a CLAK EVENT stretch tent, with a professional bartender mixing drinks. A logo for 'Cocktails Événements' is visible on the bar, signifying a partnership. The CLAK EVENT logo should be visible.`;

    const clakeventStrategy8 = `Create a professional, high-quality image for a ${platform} social media post.
    A vibrant DJ setup under a CLAK EVENT stretch tent, with professional lighting and sound equipment. People are dancing in the background. A logo for 'Sono Dynamique' is visible, highlighting a sound and light partner. The CLAK EVENT logo should be visible.`;

    // Create a platform-specific image prompt based on strategy
    let textPrompt;
    
    if (client === 'clakevent') {
      switch (strategy) {
        case 'chill-lounge-evening':
          textPrompt = clakeventStrategy1;
          break;
        case 'modern-corporate-event':
          textPrompt = clakeventStrategy2;
          break;
        case 'colorful-children-birthday':
          textPrompt = clakeventStrategy3;
          break;
        case 'team-pose-moment':
          textPrompt = clakeventStrategy4;
          break;
        case 'wedding-couple':
          textPrompt = clakeventStrategy5;
          break;
        case 'group-friends-enjoying':
          textPrompt = clakeventStrategy6;
          break;
        case 'stylish-tent-cocktail-bar':
          textPrompt = clakeventStrategy7;
          break;
        case 'dj-stage-lighting':
          textPrompt = clakeventStrategy8;
          break;
        default:
          textPrompt = `Create a professional, high-quality image for a ${platform} social media post for CLAK EVENT about: ${description}. 
          The image should feature a stretch tent setup, be visually appealing and modern, relevant to the topic, appropriate for ${platform} platform, and include the CLAK EVENT logo.`;
      }
    } else {
      // Original Tryba strategies
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
    }
    
    // Build the prompt array based on whether we have an input image or reference images
    let prompt: any;
    
    // Helper function to extract base64 data from data URL
    const extractBase64Data = (dataUrl: string) => {
      if (dataUrl.includes(',')) {
        const [header, data] = dataUrl.split(',');
        const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
        return { base64Data: data, mimeType };
      }
      return { base64Data: dataUrl, mimeType: 'image/png' };
    };

    // Start with text prompt
    // If we have reference images, enhance the prompt to mention they should be used as context
    let enhancedPrompt = textPrompt;
    if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
      enhancedPrompt = `${textPrompt}\n\nIMPORTANT: Use the provided reference images as context and inspiration. The generated image should match the style, atmosphere, and setup shown in these reference images. Study the reference images to understand the typical tent configurations, lighting, decor, and overall aesthetic used by CLAK EVENT.`;
    }
    
    const promptParts: any[] = [{ text: enhancedPrompt }];

    // Add reference images from clakevent folder if provided (for context)
    // Limit to 1-2 images to avoid API limitations
    if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
      // Use only 1-2 reference images (Gemini may have limitations with multiple images)
      const imagesToInclude = referenceImages.slice(0, 2);
      console.log(`Including ${imagesToInclude.length} reference images for context`);
      for (const refImage of imagesToInclude) {
        try {
          const { base64Data, mimeType } = extractBase64Data(refImage);
          promptParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          });
        } catch (error) {
          console.error('Error processing reference image:', error);
          // Continue without this image
        }
      }
    }

    // Add uploaded image if provided
    if (imageBase64) {
      const { base64Data, mimeType } = extractBase64Data(imageBase64);
      promptParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }

    // Format the prompt for Gemini API
    // For image generation, try without reference images first to ensure basic generation works
    // Reference images might not be supported for image generation model
    let contents;
    
    // Start with text-only prompt first (reference images might cause issues)
    // We'll include reference context in the text prompt instead
    if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
      // Enhance the prompt with reference image context but don't send the images
      // The model might not support multiple images for generation
      contents = enhancedPrompt;
    } else if (promptParts.length === 1) {
      // Text only
      contents = promptParts[0].text;
    } else if (imageBase64 && promptParts.length === 2) {
      // Text + one uploaded image
      contents = promptParts;
    } else {
      // Multiple parts - use just the text for now
      contents = enhancedPrompt;
    }

    console.log('Sending prompt to Gemini API, contents type:', typeof contents, 'isArray:', Array.isArray(contents));
    if (Array.isArray(contents)) {
      console.log('Contents parts count:', contents.length);
    }

    let response;
    try {
      // Format contents properly for Gemini API
      // The API expects either a string or an array of parts
      let formattedContents: any;
      
      if (typeof contents === 'string') {
        // Text only - simple format
        formattedContents = contents;
      } else if (Array.isArray(contents)) {
        // Array of parts (text + images)
        formattedContents = contents;
      } else {
        formattedContents = enhancedPrompt;
      }
      
      console.log('Calling generateContent with format:', typeof formattedContents, Array.isArray(formattedContents));
      if (Array.isArray(formattedContents)) {
        console.log('Contents array length:', formattedContents.length);
      }
      
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: formattedContents,
      });
    } catch (apiError: any) {
      console.error('Gemini API error:', apiError);
      console.error('Error details:', apiError?.message || JSON.stringify(apiError, null, 2));
      
      // If error, try with text only
      console.log('Retrying with text-only prompt');
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image-preview",
          contents: enhancedPrompt,
        });
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        return NextResponse.json({
          error: 'Failed to generate image. API Error: ' + (apiError?.message || 'Unknown error'),
          details: apiError?.message || 'See server logs for details'
        }, { status: 500 });
      }
    }

    // Check response structure
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response || {}));
    console.log('Response structure:', {
      hasCandidates: !!response?.candidates,
      candidatesLength: response?.candidates?.length,
      responseText: response?.text?.substring(0, 200)
    });

    // Try multiple ways to access the response data
    // The @google/genai package might structure responses differently
    
    // Method 1: Check for candidates (standard Gemini API format)
    if (response?.candidates && response.candidates.length > 0 && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        console.log('Part type:', typeof part, 'Keys:', Object.keys(part || {}));
        
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          
          console.log('Found image data, mimeType:', mimeType, 'Data length:', imageData?.length);
          return NextResponse.json({ 
            imageData,
            mimeType,
            success: true 
          });
        } else if (part.text) {
          console.log('Response contains text instead of image. Text:', part.text.substring(0, 200));
          return NextResponse.json({
            error: 'Image generation returned text instead of image. Response: ' + part.text.substring(0, 500),
            textResponse: part.text
          }, { status: 500 });
        }
      }
    }
    
    // Method 2: Check for response.text (package wrapper format)
    if (response?.text) {
      console.log('Response has text property:', response.text.substring(0, 200));
      return NextResponse.json({
        error: 'Image generation not supported. Model returned text: ' + response.text.substring(0, 500),
        textResponse: response.text
      }, { status: 500 });
    }
    
    // If we get here, log the full response for debugging
    console.log('No image data found. Full response:', JSON.stringify(response, null, 2));

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
