import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Path to clakevent images in public folder
    const imagesDir = join(process.cwd(), 'public', 'clakevent');
    
    // Get all image files (we'll read a sample set for context)
    // For now, we'll return paths that can be accessed via HTTP
    // The frontend will convert them to base64
    
    // List of all image files (you can dynamically read the directory if needed)
    const imageFiles = [];
    for (let i = 2; i <= 51; i++) {
      imageFiles.push(`${i}.jpeg`);
    }
    
    // Read a subset of images to use as reference context for AI image generation
    // We'll read 6 representative images that show different CLAKEVENT tent setups
    const referenceImageIndices = [2, 10, 15, 25, 35, 45]; // Sample images
    const referenceImages: string[] = [];
    
    for (const index of referenceImageIndices) {
      try {
        const imagePath = join(imagesDir, `${index}.jpeg`);
        const imageBuffer = await readFile(imagePath);
        const base64 = imageBuffer.toString('base64');
        referenceImages.push(`data:image/jpeg;base64,${base64}`);
      } catch (error) {
        console.log(`Could not read image ${index}.jpeg:`, error);
        // Continue with other images even if one fails
      }
    }
    
    // If we couldn't load enough images, try to load more from the available set
    if (referenceImages.length < 3) {
      // Try loading additional images
      for (let i = 2; i <= 51 && referenceImages.length < 6; i++) {
        if (!referenceImageIndices.includes(i)) {
          try {
            const imagePath = join(imagesDir, `${i}.jpeg`);
            const imageBuffer = await readFile(imagePath);
            const base64 = imageBuffer.toString('base64');
            referenceImages.push(`data:image/jpeg;base64,${base64}`);
          } catch (error) {
            // Continue trying other images
          }
        }
      }
    }
    
    return NextResponse.json({ 
      images: referenceImages,
      count: referenceImages.length
    });
  } catch (error) {
    console.error('Error loading clakevent images:', error);
    return NextResponse.json(
      { error: 'Failed to load images', images: [] },
      { status: 500 }
    );
  }
}

