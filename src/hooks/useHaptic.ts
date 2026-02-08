"use client";

import { useCallback } from "react";

export function useHaptic() {
    const vibrate = useCallback((pattern: number | number[] = 10) => {
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(pattern);
        }
    }, []);

    const triggerHaptic = useCallback((type: "success" | "warning" | "error" | "light" | "medium" | "heavy") => {
        if (typeof window === "undefined" || !window.navigator?.vibrate) return;

        switch (type) {
            case "success":
                window.navigator.vibrate([10, 30, 10]);
                break;
            case "warning":
                window.navigator.vibrate([30, 50, 10]);
                break;
            case "error":
                window.navigator.vibrate([50, 100, 50]);
                break;
            case "light":
                window.navigator.vibrate(5);
                break;
            case "medium":
                window.navigator.vibrate(15);
                break;
            case "heavy":
                window.navigator.vibrate(30);
                break;
        }
    }, []);

    return { vibrate, triggerHaptic };
}
