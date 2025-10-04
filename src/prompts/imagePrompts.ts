export const getImageGenerationPrompt = (
  platform: string,
  description: string
) => {
  return `Create a professional, high-quality image for a ${platform} social media post about: ${description}. 
The image should be:
- Visually appealing and modern
- Relevant to the topic: ${description}
- Appropriate for ${platform} platform
- Professional and engaging
- High resolution and clear
- Suitable for social media sharing`;
};
