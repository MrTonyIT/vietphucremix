import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Music,
  CloudRain,
  Bell,
  Waves,
  Wind,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SoundscapePreset {
  id: string;
  name: string;
  subtitle: string;
  rainVol: number;
  bellVol: number;
  riverVol: number;
  windVol: number;
  melodyEnabled: boolean;
}

const PRESETS: SoundscapePreset[] = [
  {
    id: 'rain-palace',
    name: 'Mưa Đêm Cố Đô',
    subtitle: 'Mưa ngói âm dương, chuông chùa ngân nga & sáo trúc',
    rainVol: 0.6,
    bellVol: 0.5,
    riverVol: 0.1,
    windVol: 0.2,
    melodyEnabled: true,
  },
  {
    id: 'hoai-river',
    name: 'Thuyền Trôi Sông Hoài',
    subtitle: 'Nước chảy êm đềm, đàn tranh xao xuyến phố Hội',
    rainVol: 0.0,
    bellVol: 0.2,
    riverVol: 0.7,
    windVol: 0.3,
    melodyEnabled: true,
  },
  {
    id: 'zen-temple',
    name: 'Tĩnh Tâm Thiền Tự',
    subtitle: 'Chuông Thiên Mụ ngân dài giữa rừng thông thanh tịnh',
    rainVol: 0.0,
    bellVol: 0.8,
    riverVol: 0.2,
    windVol: 0.6,
    melodyEnabled: false,
  },
  {
    id: 'pentatonic-melody',
    name: 'Dạ Khúc Ngũ Cung',
    subtitle: 'Hòa tấu sáo trúc & đàn tranh ngũ cung mộc mạc',
    rainVol: 0.15,
    bellVol: 0.3,
    riverVol: 0.2,
    windVol: 0.2,
    melodyEnabled: true,
  },
];

// Pentatonic frequencies (Vietnamese Hò, Xự, Xang, Xê, Cống in key of F)
const PENTATONIC_FREQS = [
  349.23, // F4 (Cung)
  392.00, // G4 (Thương)
  440.00, // A4 (Dốc)
  523.25, // C5 (Chủy)
  587.33, // D5 (Vũ)
  698.46, // F5
  783.99, // G5
  880.00, // A5
];

export const HeritageAudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentPreset, setCurrentPreset] = useState<string>('rain-palace');
  const [masterVolume, setMasterVolume] = useState<number>(0.5);

  // Individual ambient volumes
  const [rainVolume, setRainVolume] = useState<number>(0.6);
  const [bellVolume, setBellVolume] = useState<number>(0.5);
  const [riverVolume, setRiverVolume] = useState<number>(0.1);
  const [windVolume, setWindVolume] = useState<number>(0.2);
  const [isMelodyActive, setIsMelodyActive] = useState<boolean>(true);

  // Web Audio Context & Nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const riverGainRef = useRef<GainNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const bellTimerRef = useRef<number | null>(null);
  const melodyTimerRef = useRef<number | null>(null);

  // Initialize Web Audio Engine
  const initAudioEngine = () => {
    if (audioCtxRef.current) return audioCtxRef.current;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Helper: create white/pink noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // 1. Rain Generator (Filtered Pink Noise with lowpass + bandpass)
    const rainNoise = ctx.createBufferSource();
    rainNoise.buffer = noiseBuffer;
    rainNoise.loop = true;
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(800, ctx.currentTime);
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(rainVolume, ctx.currentTime);
    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    rainNoise.start();
    rainGainRef.current = rainGain;

    // 2. River Stream Generator (Modulated low-frequency noise)
    const riverNoise = ctx.createBufferSource();
    riverNoise.buffer = noiseBuffer;
    riverNoise.loop = true;
    const riverFilter = ctx.createBiquadFilter();
    riverFilter.type = 'bandpass';
    riverFilter.frequency.setValueAtTime(450, ctx.currentTime);
    riverFilter.Q.setValueAtTime(1.5, ctx.currentTime);
    const riverGain = ctx.createGain();
    riverGain.gain.setValueAtTime(riverVolume, ctx.currentTime);
    riverNoise.connect(riverFilter);
    riverFilter.connect(riverGain);
    riverGain.connect(masterGain);
    riverNoise.start();
    riverGainRef.current = riverGain;

    // 3. Wind Generator (Whistling sweep)
    const windNoise = ctx.createBufferSource();
    windNoise.buffer = noiseBuffer;
    windNoise.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(320, ctx.currentTime);
    windFilter.Q.setValueAtTime(4.0, ctx.currentTime);
    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(windVolume, ctx.currentTime);
    windNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windNoise.start();
    windGainRef.current = windGain;

    return ctx;
  };

  // Ring Zen Temple Bell (Additive synthesis with inharmonic partials)
  const ringTempleBell = () => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain || bellVolume <= 0.05) return;

    const now = ctx.currentTime;
    const bellGain = ctx.createGain();
    bellGain.gain.setValueAtTime(bellVolume * 0.45, now);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.5);
    bellGain.connect(masterGain);

    // Temple Bell partial ratios (Thiên Mụ bronze bell acoustic model)
    const partials = [
      { f: 180, g: 1.0 },
      { f: 275, g: 0.6 },
      { f: 410, g: 0.4 },
      { f: 580, g: 0.25 },
      { f: 820, g: 0.15 },
    ];

    partials.forEach(({ f, g }) => {
      const osc = ctx.createOscillator();
      const pGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      pGain.gain.setValueAtTime(g, now);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.0);
      osc.connect(pGain);
      pGain.connect(bellGain);
      osc.start(now);
      osc.stop(now + 6.5);
    });
  };

  // Play a soft pentatonic note (Flute / Zither hybrid timbre)
  const playPentatonicNote = (freq: number) => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain || !isMelodyActive) return;

    const now = ctx.currentTime;
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.18, now + 0.15); // soft flute attack
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
    noteGain.connect(masterGain);

    // Flute fundamental + harmonics
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.25, now);
    osc2.connect(osc2Gain);
    osc2Gain.connect(noteGain);

    osc1.connect(noteGain);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 3.5);
    osc2.stop(now + 3.5);
  };

  // Master volume change effect
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(masterVolume, audioCtxRef.current.currentTime);
    }
  }, [masterVolume]);

  // Ambient layer volume adjustments
  useEffect(() => {
    if (rainGainRef.current && audioCtxRef.current) {
      rainGainRef.current.gain.setValueAtTime(rainVolume, audioCtxRef.current.currentTime);
    }
  }, [rainVolume]);

  useEffect(() => {
    if (riverGainRef.current && audioCtxRef.current) {
      riverGainRef.current.gain.setValueAtTime(riverVolume, audioCtxRef.current.currentTime);
    }
  }, [riverVolume]);

  useEffect(() => {
    if (windGainRef.current && audioCtxRef.current) {
      windGainRef.current.gain.setValueAtTime(windVolume, audioCtxRef.current.currentTime);
    }
  }, [windVolume]);

  // Timers for automated bell chimes and pentatonic melodies
  useEffect(() => {
    if (!isPlaying) {
      if (bellTimerRef.current) clearInterval(bellTimerRef.current);
      if (melodyTimerRef.current) clearInterval(melodyTimerRef.current);
      return;
    }

    // Bell chime every 14 - 18 seconds
    bellTimerRef.current = window.setInterval(() => {
      ringTempleBell();
    }, 15000);

    // Initial gentle bell chime
    ringTempleBell();

    // Pentatonic notes sequence every 3.5 seconds
    melodyTimerRef.current = window.setInterval(() => {
      if (isMelodyActive) {
        const randomFreq = PENTATONIC_FREQS[Math.floor(Math.random() * PENTATONIC_FREQS.length)];
        playPentatonicNote(randomFreq);
      }
    }, 3800);

    return () => {
      if (bellTimerRef.current) clearInterval(bellTimerRef.current);
      if (melodyTimerRef.current) clearInterval(melodyTimerRef.current);
    };
  }, [isPlaying, isMelodyActive, bellVolume]);

  // Toggle master Play / Pause
  const handleTogglePlay = async () => {
    if (!isPlaying) {
      const ctx = initAudioEngine();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      setIsPlaying(true);
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        await audioCtxRef.current.suspend();
      }
      setIsPlaying(false);
    }
  };

  // Apply preset
  const handleSelectPreset = (preset: SoundscapePreset) => {
    setCurrentPreset(preset.id);
    setRainVolume(preset.rainVol);
    setBellVolume(preset.bellVol);
    setRiverVolume(preset.riverVol);
    setWindVolume(preset.windVol);
    setIsMelodyActive(preset.melodyEnabled);

    if (!isPlaying) {
      handleTogglePlay();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      {/* Floating minimized pill / badge */}
      <div className="relative">
        <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-[#19120e]/90 backdrop-blur-md border border-[#cba369]/40 shadow-2xl">
          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                : 'bg-[#291c13] text-amber-200 hover:bg-[#38271a]'
            }`}
            title={isPlaying ? 'Tạm dừng nhạc cổ phong' : 'Bật không gian âm nhạc cổ phong'}
            aria-label="Phát nhạc cổ phong"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-stone-950" />
            ) : (
              <Play className="w-4 h-4 ml-0.5 fill-amber-200" />
            )}
          </button>

          {/* Title & Animated Equalizer */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-2 py-1 text-left cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="Mở bảng điều khiển âm thanh"
          >
            <div className="min-w-0 max-w-[120px] sm:max-w-[150px]">
              <div className="text-[11px] font-bold text-white font-serif truncate flex items-center space-x-1">
                <span>Âm Nhạc Cổ Phong</span>
              </div>
              <div className="text-[9px] text-[#d5c3aa] truncate">
                {PRESETS.find((p) => p.id === currentPreset)?.name || 'Mưa Đêm Cố Đô'}
              </div>
            </div>

            {/* Waveform indicator */}
            <div className="flex items-end space-x-0.5 h-3.5 w-4 shrink-0">
              <span
                className={`w-0.5 bg-amber-400 rounded-full transition-all duration-300 ${
                  isPlaying ? 'h-3 animate-pulse' : 'h-1 opacity-40'
                }`}
              />
              <span
                className={`w-0.5 bg-amber-300 rounded-full transition-all duration-500 ${
                  isPlaying ? 'h-3.5 animate-bounce' : 'h-1.5 opacity-40'
                }`}
              />
              <span
                className={`w-0.5 bg-amber-500 rounded-full transition-all duration-200 ${
                  isPlaying ? 'h-2 animate-pulse' : 'h-1 opacity-40'
                }`}
              />
            </div>

            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
            )}
          </button>
        </div>

        {/* Expanded Panel (Flyout / Drawer) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-12 right-0 w-[310px] sm:w-[350px] p-4 rounded-3xl bg-gradient-to-b from-[#1c1511] via-[#140e0b] to-[#0a0705] border-2 border-[#d4af37]/40 shadow-2xl text-white space-y-3.5 z-50"
            >
              <div className="flex items-center justify-between border-b border-[#cba369]/20 pb-2">
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold font-serif text-amber-200 uppercase tracking-wider">
                    Không Gian Âm Nhạc Cổ Phong
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                  aria-label="Thu nhỏ"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Master Volume Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-300">
                  <span className="flex items-center space-x-1">
                    {masterVolume > 0 ? (
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                    )}
                    <span>Âm Lượng Tổng:</span>
                  </span>
                  <span className="font-mono text-amber-300">
                    {Math.round(masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Presets List */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d5c3aa]">
                  Bản Nhạc & Bối Cảnh Âm Thanh:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map((p) => {
                    const isCur = currentPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isCur
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow'
                            : 'bg-[#18100b] border-stone-800 hover:border-stone-700 text-stone-300'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{p.name}</div>
                        <div className="text-[9px] text-stone-400 truncate mt-0.5">{p.subtitle}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ambient Sound Sliders Mixer */}
              <div className="space-y-2 pt-2 border-t border-[#cba369]/15">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d5c3aa] flex items-center space-x-1">
                    <Sliders className="w-3 h-3 text-amber-400" />
                    <span>Bộ Hòa Âm Thiên Nhiên:</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsMelodyActive(!isMelodyActive)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isMelodyActive
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-stone-900 text-stone-500 border-stone-800'
                    }`}
                  >
                    {isMelodyActive ? '🎵 Sáo Ngũ Cung: Bật' : '🎵 Sáo Ngũ Cung: Tắt'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {/* Rain */}
                  <div className="p-2 rounded-xl bg-[#140e0a] border border-stone-800/80 space-y-1">
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="flex items-center space-x-1">
                        <CloudRain className="w-3 h-3 text-blue-400" />
                        <span>Mưa ngói Cố Đô</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={rainVolume}
                      onChange={(e) => setRainVolume(Number(e.target.value))}
                      className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                  </div>

                  {/* Bell */}
                  <div className="p-2 rounded-xl bg-[#140e0a] border border-stone-800/80 space-y-1">
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="flex items-center space-x-1">
                        <Bell className="w-3 h-3 text-amber-400" />
                        <span>Chuông Thiên Mụ</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={bellVolume}
                      onChange={(e) => setBellVolume(Number(e.target.value))}
                      className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  {/* River */}
                  <div className="p-2 rounded-xl bg-[#140e0a] border border-stone-800/80 space-y-1">
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="flex items-center space-x-1">
                        <Waves className="w-3 h-3 text-emerald-400" />
                        <span>Sóng sông Hoài</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={riverVolume}
                      onChange={(e) => setRiverVolume(Number(e.target.value))}
                      className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>

                  {/* Wind */}
                  <div className="p-2 rounded-xl bg-[#140e0a] border border-stone-800/80 space-y-1">
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="flex items-center space-x-1">
                        <Wind className="w-3 h-3 text-teal-400" />
                        <span>Gió rừng trúc</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={windVolume}
                      onChange={(e) => setWindVolume(Number(e.target.value))}
                      className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
