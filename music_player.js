// Enhanced music player for DOOM title screen
class MusicPlayer {
    constructor() {
        this.audioContext = null;
        this.musicBuffer = null;
        this.musicSource = null;
        this.gainNode = null;
        this.isMuted = false;
        this.volume = 0.5;
        this.isPlaying = false;
        this.effects = new Map();
        
        this.init();
    }

    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.volume;

            // Load and play main theme
            await this.loadMainTheme();
            await this.loadSoundEffects();
            
            // Auto-play with user interaction check
            document.addEventListener('click', this.handleFirstInteraction.bind(this), { once: true });
            
        } catch (error) {
            console.error('Error initializing music player:', error);
        }
    }

    async handleFirstInteraction() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        this.playMainTheme();
    }

    async loadMainTheme() {
        try {
            // Create a synthesized DOOM-style theme
            const duration = 30; // 30 second loop
            const sampleRate = this.audioContext.sampleRate;
            const length = sampleRate * duration;
            const buffer = this.audioContext.createBuffer(2, length, sampleRate);
            
            // Generate the main DOOM theme using oscillators
            this.generateDoomTheme(buffer, sampleRate, duration);
            
            this.musicBuffer = buffer;
        } catch (error) {
            console.error('Error loading main theme:', error);
        }
    }

    generateDoomTheme(buffer, sampleRate, duration) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        
        // DOOM-style heavy metal progression
        const bpm = 140;
        const beatLength = (60 / bpm) * sampleRate;
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            const beat = Math.floor(i / beatLength) % 16;
            
            // Bass line (low frequency)
            const bassFreq = this.getDoomBassNote(beat);
            const bass = Math.sin(2 * Math.PI * bassFreq * time) * 0.3;
            
            // Lead guitar (higher frequency with distortion)
            const leadFreq = this.getDoomLeadNote(beat, time);
            const lead = this.distort(Math.sin(2 * Math.PI * leadFreq * time)) * 0.2;
            
            // Drums (noise-based)
            const drums = this.getDoomDrums(beat, time) * 0.15;
            
            // Apply envelope
            const envelope = this.getEnvelope(time, duration);
            
            const sample = (bass + lead + drums) * envelope;
            
            leftChannel[i] = sample;
            rightChannel[i] = sample * 0.9; // Slight stereo separation
        }
    }

    getDoomBassNote(beat) {
        // E minor pentatonic scale in low octave
        const notes = [82.4, 87.3, 110, 123.5, 146.8, 164.8, 196]; // E2, F2, A2, B2, D3, E3, G3
        const progression = [0, 0, 2, 2, 4, 4, 1, 1, 0, 0, 3, 3, 2, 2, 1, 0];
        return notes[progression[beat % progression.length]];
    }

    getDoomLeadNote(beat, time) {
        // Higher octave with some vibrato
        const baseFreq = this.getDoomBassNote(beat) * 2;
        const vibrato = Math.sin(2 * Math.PI * 6 * time) * 2; // 6Hz vibrato
        return baseFreq + vibrato;
    }

    getDoomDrums(beat, time) {
        // Simple drum pattern
        if (beat % 4 === 0) {
            // Kick drum
            return Math.random() * Math.exp(-time % 0.1 * 50);
        } else if (beat % 4 === 2) {
            // Snare
            return Math.random() * Math.exp(-time % 0.05 * 100) * 0.5;
        } else if (beat % 2 === 1) {
            // Hi-hat
            return Math.random() * Math.exp(-time % 0.02 * 200) * 0.2;
        }
        return 0;
    }

    distort(sample) {
        // Simple distortion effect
        const threshold = 0.3;
        if (sample > threshold) {
            return threshold + (sample - threshold) * 0.1;
        } else if (sample < -threshold) {
            return -threshold + (sample + threshold) * 0.1;
        }
        return sample;
    }

    getEnvelope(time, duration) {
        const fadeTime = 2;
        if (time < fadeTime) {
            return time / fadeTime;
        } else if (time > duration - fadeTime) {
            return (duration - time) / fadeTime;
        }
        return 1;
    }

    async loadSoundEffects() {
        // Load UI sound effects
        this.effects.set('hover', await this.createHoverSound());
        this.effects.set('click', await this.createClickSound());
        this.effects.set('error', await this.createErrorSound());
    }

    async createHoverSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / this.audioContext.sampleRate;
            data[i] = Math.sin(2 * Math.PI * 800 * time) * Math.exp(-time * 20) * 0.1;
        }
        
        return buffer;
    }

    async createClickSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / this.audioContext.sampleRate;
            const freq = 400 + Math.sin(time * 50) * 100;
            data[i] = Math.sin(2 * Math.PI * freq * time) * Math.exp(-time * 15) * 0.2;
        }
        
        return buffer;
    }

    async createErrorSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / this.audioContext.sampleRate;
            const freq = 200 - time * 50;
            data[i] = Math.sin(2 * Math.PI * freq * time) * Math.exp(-time * 5) * 0.3;
        }
        
        return buffer;
    }

    playMainTheme() {
        if (this.isPlaying || !this.musicBuffer) return;
        
        try {
            this.musicSource = this.audioContext.createBufferSource();
            this.musicSource.buffer = this.musicBuffer;
            this.musicSource.loop = true;
            this.musicSource.connect(this.gainNode);
            this.musicSource.start();
            this.isPlaying = true;
            
            console.log('DOOM theme started');
        } catch (error) {
            console.error('Error playing main theme:', error);
        }
    }

    playEffect(effectName) {
        const buffer = this.effects.get(effectName);
        if (!buffer) return;
        
        try {
            const source = this.audioContext.createBufferSource();
            const effectGain = this.audioContext.createGain();
            
            source.buffer = buffer;
            effectGain.gain.value = this.volume * 0.5; // Effects at 50% of music volume
            
            source.connect(effectGain);
            effectGain.connect(this.audioContext.destination);
            source.start();
        } catch (error) {
            console.error('Error playing sound effect:', error);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
        }
        return this.isMuted;
    }

    pause() {
        if (this.musicSource && this.isPlaying) {
            this.musicSource.stop();
            this.isPlaying = false;
        }
    }

    resume() {
        if (!this.isPlaying) {
            this.playMainTheme();
        }
    }

    stop() {
        if (this.musicSource) {
            this.musicSource.stop();
            this.isPlaying = false;
        }
    }
}

// Initialize music player
window.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});

