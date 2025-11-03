
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from './services/geminiService';
import { pcmToWavBlob, decode } from './utils/audioUtils';
import { LoadingSpinner } from './components/icons';

interface VoiceOption {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
}

const voiceOptions: VoiceOption[] = [
  { id: 'Zephyr', name: 'Zephyr', gender: 'Male' },
  { id: 'Puck', name: 'Puck', gender: 'Male' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male' },
  { id: 'Kore', name: 'Kore', gender: 'Female' },
  { id: 'Charon', name: 'Charon', gender: 'Female' },
];

const App: React.FC = () => {
  const [text, setText] = useState<string>('Hello! Welcome to the Text-to-Speech Synthesizer powered by Gemini.');
  const [selectedVoice, setSelectedVoice] = useState<string>(voiceOptions[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioSrc]);

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate speech.');
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setAudioSrc(null);

    // Clean up previous blob URL
    if (audioSrc) {
      URL.revokeObjectURL(audioSrc);
    }

    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      if (!base64Audio) {
        throw new Error('Received an empty audio response from the API.');
      }
      
      const pcmData = decode(base64Audio);
      const wavBlob = pcmToWavBlob(pcmData, 24000, 1);
      const url = URL.createObjectURL(wavBlob);
      setAudioSrc(url);

    } catch (err: any) {
      console.error('Error generating speech:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-gray-800 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 rounded-xl p-6 sm:p-8 space-y-8">
          <header className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 tracking-wide">
              Text-to-Speech Synthesizer
            </h1>
            <p className="text-gray-400 mt-2">
              Powered by Google's Gemini API
            </p>
          </header>

          <main className="space-y-6">
            <div>
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-2">
                Your Text
              </label>
              <textarea
                id="text-input"
                rows={5}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
                placeholder="Enter text to synthesize..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select a Voice
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {voiceOptions.map((voice) => (
                  <div key={voice.id}>
                    <input
                      type="radio"
                      id={voice.id}
                      name="voice"
                      value={voice.id}
                      checked={selectedVoice === voice.id}
                      onChange={() => setSelectedVoice(voice.id)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={voice.id}
                      className={`block p-3 text-center rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedVoice === voice.id
                          ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg'
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <span className="font-semibold block">{voice.name}</span>
                      <span className="text-xs opacity-70">{voice.gender}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateSpeech}
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Generating Audio...
                </>
              ) : (
                'Generate Speech'
              )}
            </button>
          </main>
          
          <footer className="h-24 flex items-center justify-center">
            {error && (
              <div className="text-red-400 bg-red-900/50 border border-red-500/50 p-3 rounded-lg w-full text-center">
                <strong>Error:</strong> {error}
              </div>
            )}
            {audioSrc && !error && (
              <div className="w-full">
                 <audio ref={audioRef} controls src={audioSrc} className="w-full h-12" />
              </div>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
