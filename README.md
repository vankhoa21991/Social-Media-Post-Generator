# Social Media Post Generator

Social Media Post Generator is an AI-powered tool that helps you create engaging and platform-optimized social media content. With support for multiple platforms and customization options, it streamlines your social media content creation process.

Built with Next.js and cutting-edge AI technology, this open-source template enables developers to create an AI-powered social media content generator. As the demand for a consistent and engaging social media presence grows, this tool provides everything you need to maintain an active and professional social media presence.


## Live Demo
[https://social-media-post-generator-black.vercel.app/](https://social-media-post-generator-black.vercel.app/)

## Features

- Multi-platform support (Twitter/X, LinkedIn, Facebook, Instagram)
- Customizable tone of voice (Professional, Casual, Friendly, Humorous, Formal)
- Platform-specific optimizations (e.g., thread creation for Twitter, word limits for LinkedIn)
- Optional hashtag and emoji integration
- Multiple post variations from a single prompt
- AI-powered image generation using Gemini API
- Download generated images for social media use
- Modern, responsive UI with a beautiful gradient design
- Copy-to-clipboard functionality for easy posting

## Technologies Used
- Next.js 13+ with App Router
- React for Frontend
- OpenAI API for AI-Powered Content Generation
- Google Gemini API for Image Generation
- Tailwind CSS for Styling

## Use Cases
- Creating consistent social media content across multiple platforms
- Generating professional marketing posts for your business
- Maintaining an active social media presence with varied content
- Quick creation of multiple post variations for A/B testing

## Quick Start

### Local Development

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/social-media-post-generator.git
    cd social-media-post-generator
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
    ```bash
    OPENAI_API_KEY=your_openai_api_key
    GEMINI_API_KEY=your_gemini_api_key
    ```
   
   Get your API keys from:
   - OpenAI: https://platform.openai.com/api-keys
   - Gemini: https://aistudio.google.com/app/apikey
   
4. Run the development server:
    ```bash
    npm run dev
    ```

5. Open your browser and navigate to `http://localhost:3000`

### Deploy to Vercel

1. **Push your code to GitHub** (if not already done)

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

3. **Set Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `GEMINI_API_KEY`: Your Google Gemini API key

4. **Deploy**:
   - Click "Deploy" in Vercel
   - Your app will be live at `https://your-project-name.vercel.app`

### Alternative: Deploy with Vercel CLI

1. Install Vercel CLI:
    ```bash
    npm i -g vercel
    ```

2. Login to Vercel:
    ```bash
    vercel login
    ```

3. Deploy:
    ```bash
    vercel
    ```

4. Set environment variables:
    ```bash
    vercel env add OPENAI_API_KEY
    vercel env add GEMINI_API_KEY
    ```

## How to Use the Application

1. Enter your post topic or description in the text area
2. Select your target social media platform
3. Choose your preferred tone of voice
4. Configure additional options:
   - Word limit (for LinkedIn)
   - Thread creation (for Twitter)
   - Hashtags and emojis
   - Image generation (optional)
5. Select the number of posts you want
6. Click "Generate Posts" (or "Generate Post & Image" if image generation is enabled)
7. Use the copy button to easily copy posts to your clipboard
8. Download generated images for your social media posts

## Contributing

We welcome contributions! Here's how you can help make the Social Media Post Generator even better:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/0xmetaschool/Social-Media-Post-Generator/blob/main/LICENSE) file for details.

## Contact
Please open an issue in the GitHub repository for any queries or support.
