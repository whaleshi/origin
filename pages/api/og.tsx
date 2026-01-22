import { ImageResponse } from '@vercel/og';
import type { NextRequest } from "next/server";

export const config = {
    runtime: 'edge',
};

// 缓存字体数据，避免重复加载
let fontCache: ArrayBuffer | null = null;

async function getFontData(fontUrl: string): Promise<ArrayBuffer> {
    if (fontCache) {
        return fontCache;
    }

    try {
        const response = await fetch(fontUrl);
        if (!response.ok) {
            throw new Error(`Failed to load font: ${response.status}`);
        }
        fontCache = await response.arrayBuffer();
        return fontCache;
    } catch (error) {
        console.error('Font loading error:', error);
        return new ArrayBuffer(0);
    }
}

const marketImg = "https://newgame.mypinata.cloud/ipfs/QmPuu6hQDER44XWAHUdYWo142VpvfYpnosZhS7CQK9SdsP";
const marketImgEn = "https://newgame.mypinata.cloud/ipfs/QmZAvxiWqQZzz3yP2yMpA3YL9FbQYWPWTwwC4MCDNt6gxu";
const miningImg = "https://newgame.mypinata.cloud/ipfs/QmYbVeAzHupodxuAwjMe9BqNs58umzToDHoEAdghYXBRBa";
const miningImgEn = "https://newgame.mypinata.cloud/ipfs/QmWxw9JmojdAWub4HAU8UDNPQ7Q5epUeEazqUnDff2ynJi";
const chan = "https://newgame.mypinata.cloud/ipfs/Qme5ZJrxyREzHPkuoxcvopLLRtWNTbB72gVUgVPW9L4bwd";

export default async function handler(request: NextRequest) {
    // 通过缓存机制加载字体
    const fontBoldUrl = `${request.nextUrl.origin}/fonts/HarmonyOS_Sans_SC_Bold.ttf`;
    const fontBoldData = await getFontData(fontBoldUrl);
    const { searchParams } = request.nextUrl;
    const tokenImg = searchParams.get("imgUrl");
    const tokenSymbol = '$' + searchParams.get("symbol");
    const tokenName = searchParams.get("name");
    const isRefine = searchParams.get("is_refine") === "1";
    const lang = searchParams.get("lang") || "zh";
    const useEnglish = lang.toLowerCase().startsWith("en");
    const bgImage = isRefine
        ? (useEnglish ? miningImgEn : miningImg)
        : (useEnglish ? marketImgEn : marketImg);
    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'black',
                }}
            >
                <div tw="flex w-full h-full">
                    <div tw="h-[630px] w-[1200px] flex flex-col relative">
                        <img tw="absolute" src={marketImg} width={1200} height={630} alt="bg" />
                        <div
                            tw="text-[120px] text-[#fff] font-extrabold pt-[214px] pl-[96px] relative max-w-[738px]"
                            style={{ fontFamily: 'HarmonyOS Sans SC', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                            {tokenSymbol}
                        </div>
                        <div tw="text-[40px] text-[#fff] pt-[10px] pl-[112px] relative font-extralight" style={{ fontFamily: 'HarmonyOS Sans SC' }}>ORI.SUPPLY</div>
                        <img tw="absolute top-[156px] right-[142px] rounded-full" src={tokenImg as string} width={320} height={320} alt="logo" />
                        {isRefine && (
                            <img tw="absolute top-[388px] right-[142px] rounded-full" src={chan as string} width={88} height={88} alt="logo" />
                        )}
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'HarmonyOS Sans SC',
                    data: fontBoldData,
                    style: 'normal',
                    weight: 700,
                },
            ],
        }
    );
}
