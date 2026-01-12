import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SlippageState {
    slippage: number;
    setSlippage: (slippage: number) => void;
    getSlippageMultiplier: () => number;
}

export const useSlippageStore = create<SlippageState>()(
    persist(
        (set, get) => ({
            slippage: 1,
            setSlippage: (slippage: number) => set({ slippage }),
            getSlippageMultiplier: () => {
                const { slippage } = get();
                return (100 - slippage) / 100;
            },
        }),
        {
            name: "slippage-storage",
        }
    )
);
