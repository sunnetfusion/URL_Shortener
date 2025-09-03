import React, { useState, useEffect } from 'react';
import { Link2, Copy, Check, ExternalLink, Globe } from 'lucide-react';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [urlMappings, setUrlMappings] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isValidUrl, setIsValidUrl] = useState(true);

  // Check if we're visiting a short URL and redirect
  useEffect(() => {
    const path = window.location.pathname;
    if (path.length > 1) {
      const shortCode = path.substring(1);
      const mapping = urlMappings.find(m => m.shortCode === shortCode);
      if (mapping) {
        // Increment click count
        setUrlMappings(prev => 
          prev.map(m => 
            m.shortCode === shortCode 
              ? { ...m, clicks: m.clicks + 1 }
              : m
          )
        );
        // Redirect to original URL
        window.location.href = mapping.originalUrl;
      }
    }
  }, [urlMappings]);

  // Generate random short code
  const generateShortCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };

  // Validate URL format
  const isValidURL = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Handle URL input change with validation
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setLongUrl(url);
    
    if (url.length > 0) {
      setIsValidUrl(isValidURL(url));
    } else {
      setIsValidUrl(true);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!longUrl.trim() || !isValidUrl) {
      return;
    }

    // Check if URL already exists
    const existingMapping = urlMappings.find(m => m.originalUrl === longUrl);
    if (existingMapping) {
      // Focus on existing mapping
      const element = document.getElementById(`url-${existingMapping.shortCode}`);
      element?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Generate unique short code
    let shortCode = generateShortCode();
    while (urlMappings.some(m => m.shortCode === shortCode)) {
      shortCode = generateShortCode();
    }

    // Create new mapping
    const newMapping = {
      shortCode,
      originalUrl: longUrl,
      createdAt: new Date(),
      clicks: 0
    };

    setUrlMappings(prev => [newMapping, ...prev]);
    setLongUrl('');
  };

  // Copy to clipboard functionality
  const copyToClipboard = async (shortCode) => {
    const shortUrl = `${window.location.origin}/${shortCode}`;
    
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedCode(shortCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MyShort.ly
            </h1>
          </div>
          <p className="text-gray-600 mt-1">Shorten your URLs with style</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* URL Shortening Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-8">
          <div className="text-center mb-6">
            <Link2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Shorten Your URL</h2>
            <p className="text-gray-600">Transform long URLs into short, shareable links</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="longUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your long URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="longUrl"
                  value={longUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/very-long-url-that-needs-shortening"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    !isValidUrl 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  required
                />
                {!isValidUrl && (
                  <p className="text-red-500 text-sm mt-1">
                    Please enter a valid URL starting with http:// or https://
                  </p>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!longUrl.trim() || !isValidUrl}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Shorten URL
            </button>
          </form>
        </div>

        {/* URL List */}
        {urlMappings.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Link2 className="w-5 h-5 mr-2 text-blue-600" />
              Your Shortened URLs ({urlMappings.length})
            </h3>
            
            <div className="space-y-4">
              {urlMappings.map((mapping) => (
                <div
                  key={mapping.shortCode}
                  id={`url-${mapping.shortCode}`}
                  className="bg-gray-50/50 rounded-xl p-6 border border-gray-200/50 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 min-w-0">
                      {/* Short URL */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Short URL</label>
                        <div className="flex items-center space-x-2">
                          <code className="text-lg font-mono bg-blue-50 text-blue-800 px-3 py-2 rounded-lg border">
                            {window.location.origin}/{mapping.shortCode}
                          </code>
                          <button
                            onClick={() => copyToClipboard(mapping.shortCode)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Copy to clipboard"
                          >
                            {copiedCode === mapping.shortCode ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Original URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Original URL</label>
                        <p className="text-gray-800 break-all bg-white px-3 py-2 rounded-lg border">
                          {mapping.originalUrl}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:items-end space-y-2">
                      {/* Stats */}
                      <div className="text-sm text-gray-500">
                        <p>Created: {formatDate(mapping.createdAt)}</p>
                        <p>Clicks: <span className="font-semibold text-blue-600">{mapping.clicks}</span></p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(mapping.shortCode)}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          {copiedCode === mapping.shortCode ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        
                        <a
                          href={mapping.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Visit</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions for redirect testing */}
        {urlMappings.length > 0 && (
          <div className="mt-8 bg-blue-50/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50">
            <h4 className="font-semibold text-blue-800 mb-2">Testing Redirects</h4>
            <p className="text-blue-700 text-sm">
              To test redirects, manually type the short URL in your browser's address bar:
              <br />
              <code className="bg-white px-2 py-1 rounded mt-1 inline-block">
                {window.location.origin}/[shortCode]
              </code>
            </p>
          </div>
        )}

        {/* Empty state */}
        {urlMappings.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No URLs shortened yet</h3>
            <p className="text-gray-400">Start by entering a long URL above to create your first short link!</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-gray-200/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center">
          <p className="text-gray-500 text-sm">
            Built with React & Tailwind CSS • In-memory storage for demo purposes
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;