import DefaultLayout from "@/layouts/default";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import TopScroll from "@/components/topScroll";
import AHoleEffect from "@/components/topCanvas";
import HomeList from "@/components/homeList";

export default function GamePage() {
    const { ready } = usePrivy();

    // if (!ready) {
    //     return <div className="flex items-center justify-center h-screen w-screen bg-[#0D0F13]">
    //     </div>;
    // }

    return (
        <DefaultLayout>
            <div className="relative select-none">
                <div className="w-full h-[200px] md:w-[640px] md:h-[320px] mx-auto relative">
                    <AHoleEffect />
                    <div className="w-full h-full absolute top-0 z-11 flex flex-col items-center justify-center">
                        <div className="text-[24px] md:text-[32px] font-bold">让 MEME 的诞生回归<span className="text-[#FD7438]">起源</span></div>
                        <div className="text-[14px] md:text-[15px] mt-[16px] md:mt-[24px]">运行机制→</div>
                    </div>
                    <div className="absolute bottom-0 w-full h-[80px] md:h-[180px] z-10 block md:hidden"
                        style={{ background: 'linear-gradient(180deg, rgba(16, 12, 21, 0.00) 0%, #100C15 100%)' }}
                    ></div>
                </div>
                <div className="absolute top-[8px] w-full z-10">
                    <TopScroll />
                </div>
            </div>
            <div className="-mt-[20px] relative z-10 mb-[30px]">
                <HomeList />
            </div>
        </DefaultLayout>
    );
}