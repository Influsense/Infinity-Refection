
import React, { useState, useCallback, useRef } from 'react';
import { Sparkles, Camera, Image as ImageIcon, History, AlertCircle, ExternalLink, RefreshCw, Upload, X } from 'lucide-react';
import { generateRecursiveImage } from './services/geminiService';
import { GeneratedImage, GenerationStatus, InputImage } from './types';
import { LoadingState } from './components/LoadingState';

const App: React.FC = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<InputImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage({
          data: base64String,
          mimeType: file.type
        });
        setPreviewUrl(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = useCallback(async () => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    
    try {
      const imageUrl = await generateRecursiveImage(selectedImage || undefined);
      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: selectedImage 
          ? "Recursive transformation based on uploaded image" 
          : "A man holding a chrome sphere with a recursive reflection of another man looking at a screen.",
        timestamp: Date.now(),
      };
      setImages(prev => [newImage, ...prev]);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Failed to generate the image. Please try again.");
      setStatus(GenerationStatus.ERROR);
    }
  }, [selectedImage]);

  const currentImage = images[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-500 flex items-center justify-center shadow-lg shadow-white/5">
              <Camera className="w-4 h-4 text-black" />
            </div>
            <span className="font-serif italic text-xl tracking-tight text-zinc-100">Recursive Lens</span>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="text-zinc-500 hover:text-zinc-200 transition-colors flex items-center space-x-2 text-sm"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Controls & Text */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
                The Infinity <br /> 
                <span className="text-zinc-500">Reflection.</span>
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-lg">
                Upload een foto of genereer een close-up portret van de man met de chromen bol. 
                Een visuele paradox van oneindige zuilen en digitale echo's.
              </p>
            </div>

            <div className="space-y-6 bg-zinc-900/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
              {/* Image Upload Area */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300 block">Optioneel: Werk met een eigen foto (PNG/JPG)</label>
                {!previewUrl ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:border-zinc-600 hover:bg-zinc-800/30 transition-all text-zinc-500"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Klik om een afbeelding te uploaden</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png, image/jpeg" 
                      onChange={handleFileChange}
                    />
                  </button>
                ) : (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    <button 
                      onClick={clearSelectedImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-500 text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[10px] text-zinc-300 flex items-center justify-center">
                      Foto geselecteerd voor transformatie
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-4 text-zinc-400 text-sm italic">
                <Sparkles className="w-5 h-5 text-zinc-200 flex-shrink-0" />
                <p>
                  "In de reflectie zien we de rug van een man die naar een computerscherm kijkt. 
                  Op dat scherm is de afbeelding te zien van de man die de bol vasthoudt."
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={status === GenerationStatus.LOADING}
                className={`w-full py-5 px-8 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-300 transform active:scale-[0.98] ${
                  status === GenerationStatus.LOADING 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-zinc-100 text-black hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]'
                }`}
              >
                {status === GenerationStatus.LOADING ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Processing Reality...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>{selectedImage ? 'Transform Photo' : 'Generate Masterpiece'}</span>
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Image Display */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-zinc-500/20 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative aspect-square w-full bg-zinc-900/80 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
              {status === GenerationStatus.LOADING ? (
                <LoadingState />
              ) : currentImage ? (
                <img 
                  src={currentImage.url} 
                  alt="AI Generated Recursive Reflection" 
                  className="w-full h-full object-cover animate-in fade-in zoom-in duration-700"
                />
              ) : (
                <div className="flex flex-col items-center text-zinc-600 p-12 text-center">
                  <ImageIcon className="w-20 h-20 mb-6 opacity-20" />
                  <p className="text-lg">Druk op de knop om de visuele lus te genereren.</p>
                </div>
              )}
              
              {currentImage && status !== GenerationStatus.LOADING && (
                <div className="absolute bottom-6 right-6">
                  <a 
                    href={currentImage.url} 
                    download={`recursive-lens-${currentImage.id}.png`}
                    className="p-4 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white rounded-full transition-all border border-white/10"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Gallery */}
        {images.length > 1 && (
          <section className="mt-40 space-y-12">
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-serif text-white">Previous Echoes</h2>
                <p className="text-zinc-500">Your session's creative journey</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {images.slice(1).map((img) => (
                <div key={img.id} className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 group relative cursor-pointer">
                  <img src={img.url} alt="Historical generation" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button 
                      onClick={() => {
                        const newImgs = [img, ...images.filter(i => i.id !== img.id)];
                        setImages(newImgs);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-xs font-semibold px-4 py-2 bg-white text-black rounded-full"
                    >
                      View Full
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-zinc-500 text-sm">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span className="font-serif italic">Recursive Lens AI</span>
          </div>
          <p>© 2024 Built with Gemini 2.5 Flash Image. For experimental purposes only.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
