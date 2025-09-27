'use client';

import { useState, useEffect } from 'react';

const TONE_OPTIONS = [
  'Professional',
  'Casual',
  'Friendly',
  'Humorous',
  'Formal',
  'Inspirational',
  'Educational',
  'Conversational'
] as const;

const MODEL_OPTIONS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
] as const;

type ToneOption = typeof TONE_OPTIONS[number];

interface GeneratePostParams {
  description: string;
  platform: string;
  tone: string;
  model: string;
  wordLimit?: number;
  makeThread?: boolean;
  includeHashtags: boolean;
  includeEmoji: boolean;
  imageBase64?: string;
}

function Page() {
  // Client-side only state
  const [mounted, setMounted] = useState(false);
  
  // Form states
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [makeThread, setMakeThread] = useState(false);
  const [wordLimit, setWordLimit] = useState(35);
  const [generatedContent, setGeneratedContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<ToneOption>('Professional');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [includeEmoji, setIncludeEmoji] = useState(false);
  const [postsToGenerate, setPostsToGenerate] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [generateImage, setGenerateImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const dropdown = target.closest('.dropdown-container');
      
      if (showDropdown && !dropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle image upload and conversion
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Image upload triggered');
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('File read result length:', result.length);
        setImagePreview(result);
        setImageBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadImage = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImageLoading(generateImage);
    setGeneratedContent([]);
    setGeneratedImages([]);

    try {
      const params: GeneratePostParams = {
        description,
        platform,
        tone,
        model,
        includeHashtags,
        includeEmoji,
        imageBase64: imageBase64 || undefined,
      };

      if (platform === 'linkedin') {
        params.wordLimit = wordLimit;
      }

      if (platform === 'twitter') {
        params.makeThread = makeThread;
      }

      // Generate posts
      const postPromises = Array(postsToGenerate).fill(null).map(async () => {
        const response = await fetch('/api/generate-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error('Failed to generate post');
        }

        const data = await response.json();
        return data.content;
      });

      const posts = await Promise.all(postPromises);
      setGeneratedContent(posts);

      // Generate images if enabled
      if (generateImage) {
        const imagePromises = posts.map(async (post) => {
          try {
            const response = await fetch('/api/generate-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                description: post.substring(0, 500), // Limit description length
                platform,
                imageBase64: imageBase64 || undefined,
              }),
            });

            if (!response.ok) {
              console.error('Failed to generate image');
              return null;
            }

            const data = await response.json();
            return data.imageData ? `data:${data.mimeType};base64,${data.imageData}` : null;
          } catch (error) {
            console.error('Error generating image:', error);
            return null;
          }
        });

        // Wait for all images to be generated
        const imageResults = await Promise.all(imagePromises);
        const validImages = imageResults.filter(img => img !== null);
        console.log(`Successfully generated ${validImages.length} out of ${postsToGenerate} images`);
        
        // Fill in nulls for failed images to maintain array length
        const paddedImages = Array(postsToGenerate).fill(null);
        for (let i = 0; i < postsToGenerate; i++) {
          if (imageResults[i] !== null) {
            paddedImages[i] = imageResults[i];
          }
        }
        
        setGeneratedImages(paddedImages);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setImageLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-black bg-clip-text" style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              Generate social media posts in seconds
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay consistent, creative, and productive with our free AI social media post generator.
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Description Input */}
                  <div>
                    <label htmlFor="description" className="block text-lg font-medium mb-3 text-black">
                      What would you like to post about?
                    </label>
                    
                    {/* Image Thumbnail Above Textarea */}
                    {imagePreview && (
                      <div className="mb-4">
                        <div className="relative inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* ChatGPT-style Chat Area */}
                    <div className="relative">
                      <div className="relative bg-white border border-gray-300 rounded-2xl hover:border-purple-300 transition-all duration-200">
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-4 pr-16 rounded-2xl focus:outline-none resize-none bg-transparent text-gray-900 placeholder-gray-500"
                          style={{ 
                            minHeight: '120px',
                            maxHeight: '300px'
                          }}
                          rows={4}
                          placeholder="What would you like to post about?"
                          required
                        />
                        
                        {/* Attachment Button */}
                        <div className="absolute bottom-4 right-4">
                          <div className="relative dropdown-container">
                            <button
                              type="button"
                              onClick={() => setShowDropdown(!showDropdown)}
                              className="cursor-pointer w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                              title="Add attachment"
                            >
                              <svg
                                className="w-4 h-4 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {showDropdown && (
                              <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[160px] z-10">
                                <label
                                  htmlFor="imageUpload"
                                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                >
                                  <svg
                                    className="w-4 h-4 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  Upload image
                                </label>
                                <input
                                  type="file"
                                  id="imageUpload"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  className="flex items-center w-full px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                                  disabled
                                >
                                  <svg
                                    className="w-4 h-4 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  Upload file
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Platform and Tone */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="platform" className="block text-lg font-medium mb-3 text-black">
                        Platform
                      </label>
                      <select
                        id="platform"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm transition-all border border-gray-200 hover:border-purple-300"
                        style={{ color: '#000000' }}
                      >
                        <option value="twitter">X (Twitter)</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="tone" className="block text-lg font-medium mb-3 text-black">
                        Tone of Voice
                      </label>
                      <select
                        id="tone"
                        value={tone}
                        onChange={(e) => setTone(e.target.value as ToneOption)}
                        className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm transition-all border border-gray-200 hover:border-purple-300"
                        style={{ color: '#000000' }}
                      >
                        {TONE_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-4">
                    {platform === 'linkedin' && (
                      <div>
                        <label htmlFor="wordLimit" className="block text-lg font-medium mb-3 text-black">
                          Approximate Words
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            id="wordLimit"
                            min="10"
                            max="2500"
                            value={wordLimit}
                            onChange={(e) => setWordLimit(Number(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ 
                              backgroundColor: 'white',
                              background: 'linear-gradient(to right, gray 0%, gray ' + (wordLimit/2500*100) + '%, gray ' + (wordLimit/2500*100) + '%, gray 100%)',
                              height: '4px',
                              border: '1px solid gray'
                            }}
                          />
                          <span className="font-medium min-w-[3rem]" style={{ color: 'black' }}>{wordLimit}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="postsToGenerate" className="block text-lg font-medium mb-3 text-black">
                        Number of Variations
                      </label>
                      <select
                        id="postsToGenerate"
                        value={postsToGenerate}
                        onChange={(e) => setPostsToGenerate(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm transition-all border border-gray-200 hover:border-purple-300"
                        style={{ color: '#000000' }}
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>{num} post{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="model" className="block text-lg font-medium mb-3 text-black">
                        AI Model
                      </label>
                      <select
                        id="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm transition-all border border-gray-200 hover:border-purple-300"
                        style={{ color: '#000000' }}
                      >
                        {MODEL_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-4">
                    {platform === 'twitter' && (
                      <div className="flex items-center justify-between">
                        <label htmlFor="makeThread" className="text-lg font-medium text-black">
                          Create Thread?
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="makeThread"
                            checked={makeThread}
                            onChange={(e) => setMakeThread(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" 
                            style={{ 
                              backgroundColor: makeThread ? 'gray' : 'white',
                              borderColor: 'black',
                              border: '1px solid black'
                            }}></div>
                        </label>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <label htmlFor="includeHashtags" className="text-lg font-medium text-black">
                        Add Hashtags
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="includeHashtags"
                          checked={includeHashtags}
                          onChange={(e) => setIncludeHashtags(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" 
                          style={{ 
                            backgroundColor: includeHashtags ? 'gray' : 'white',
                            borderColor: 'black',
                            border: '1px solid black'
                          }}></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="includeEmoji" className="text-lg font-medium text-black">
                        Add Emojis
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="includeEmoji"
                          checked={includeEmoji}
                          onChange={(e) => setIncludeEmoji(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" 
                          style={{ 
                            backgroundColor: includeEmoji ? 'gray' : 'white',
                            borderColor: 'black',
                            border: '1px solid black'
                          }}></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="generateImage" className="text-lg font-medium text-black">
                        🖼️ Generate Image
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="generateImage"
                          checked={generateImage}
                          onChange={(e) => setGenerateImage(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" 
                          style={{ 
                            backgroundColor: generateImage ? 'gray' : 'white',
                            borderColor: 'black',
                            border: '1px solid black'
                          }}></div>
                      </label>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                        {imageLoading ? 'Generating Post & Image...' : 'Generating Post...'}
                      </div>
                    ) : (
                      generateImage ? 'Generate Post & Image' : 'Generate Posts'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Content Area - Generated Posts */}
          <div className="lg:col-span-2">
            {generatedContent.length > 0 && mounted ? (
              <div className="space-y-6">
                {generatedContent.map((content, index) => (
                  <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-800">
                        Generated Post {index + 1}
                      </h2>
                      <div className="flex gap-2">
                        {generatedImages[index] && (
                          <button
                            onClick={() => handleDownloadImage(generatedImages[index], index)}
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                          >
                            📥 Download Image
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(content)}
                          className="flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
                        >
                          {copied ? 'Copied! ✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      {/* Display image if available */}
                      {generatedImages[index] && (
                        <div className="mb-4 flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={generatedImages[index]}
                            alt={`Generated image for post ${index + 1}`}
                            className="max-w-full h-auto rounded-xl shadow-lg"
                            style={{ maxHeight: '400px' }}
                          />
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{content}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="text-gray-500 text-lg">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                      {imageLoading ? 'Generating Post & Image...' : 'Generating Post...'}
                    </div>
                  ) : (
                    <div>
                      <div className="text-6xl mb-4">✨</div>
                      <p>Your generated posts will appear here</p>
                      <p className="text-sm text-gray-400 mt-2">Fill out the form on the left and click &quot;Generate Posts&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Page;