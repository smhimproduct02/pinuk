"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type SoundType = "click" | "join" | "night_start" | "day_start" | "win" | "lose" | "reveal";

interface SoundContextType {
    playSound: (type: SoundType) => void;
    isMuted: boolean;
    toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [audioMap, setAudioMap] = useState<Record<SoundType, HTMLAudioElement | null>>({
        click: null,
        join: null,
        night_start: null,
        day_start: null,
        win: null,
        lose: null,
        reveal: null
    });

    useEffect(() => {
        // Load sounds
        // For now using placeholder sounds or silent objects to prevent errors
        // You can replace these URLs with actual assets later
        const loadAudio = (url: string) => {
            const audio = new Audio(url);
            audio.volume = 0.5;
            return audio;
        };

        // Placeholder URLs (Simulated)
        // Ideally these would be local files in /public/sounds/
        // I will set them to empty strings or basic beep data URIs for testing if possible, 
        // but for now let's just use a simple structure. 
        // Since I can't upload files, I will leave them as potentially failing URLs 
        // but catch errors on play.

        setAudioMap({
            click: loadAudio("/sounds/click.mp3"),
            join: loadAudio("/sounds/join.mp3"),
            night_start: loadAudio("/sounds/wolf_howl.mp3"),
            day_start: loadAudio("/sounds/rooster.mp3"),
            win: loadAudio("/sounds/win.mp3"),
            lose: loadAudio("/sounds/lose.mp3"),
            reveal: loadAudio("/sounds/reveal.mp3")
        });
    }, []);

    const playSound = useCallback((type: SoundType) => {
        if (isMuted) return;

        const audio = audioMap[type];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => {
                // Ignore autoplay errors or missing file errors in dev
                console.log(`[Sound] Playing ${type}`);
            });
        } else {
            console.log(`[Sound] Simulate ${type}`);
        }
    }, [isMuted, audioMap]);

    const toggleMute = () => setIsMuted(prev => !prev);

    return (
        <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) throw new Error("useSound must be used within a SoundProvider");
    return context;
};
