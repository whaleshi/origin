import { useEffect, useMemo, useState } from "react";
import { BackIcon, ShareIcon } from "@/components/icons";
import Market from "@/components/market";
import Mining from "@/components/mining";
import { getCoinShow } from "@/service/api";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ethers } from "ethers";
import { DEFAULT_CHAIN_CONFIG } from "@/config/chains";
import TokenFactoryAbi from "@/constant/TokenFactory.json";
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { siteConfig } from "@/config/site";


const TAB_CLASS = "w-[90px] flex items-center justify-center rounded-[16px] cursor-pointer";
const TAB_CLASS_PC = "flex-1 flex items-center justify-center rounded-[6px] cursor-pointer";

export default function Token() {
	const { t, i18n } = useTranslation();
	const [activeTab, setActiveTab] = useState<"market" | "mining">("market");
	const [isShareOpen, setIsShareOpen] = useState(false);
	const [isShareImageLoading, setIsShareImageLoading] = useState(true);
	const router = useRouter();
	const mint = router.query.addr as string;
	const typeParam = Array.isArray(router.query.type) ? router.query.type[0] : router.query.type;

	const { data: coinInfo } = useQuery({
		queryKey: ["coinShow", mint],
		queryFn: async () => {
			const res = await getCoinShow({ mint });
			return res?.data ?? null;
		},
		enabled: !!mint,
		refetchInterval: 3000,
	});

	const isRefine = coinInfo?.is_refine === 1;
	const shouldDefaultMining = isRefine || typeParam === "1";
	useEffect(() => {
		if (!mint) return;
		setActiveTab(shouldDefaultMining ? "mining" : "market");
	}, [mint, shouldDefaultMining]);
	const tokenName = coinInfo?.name ?? "";
	const tokenSymbol = coinInfo?.symbol ?? "";
	const tokenImage = coinInfo?.image_url ?? "";
	const lang = i18n.language || "zh";
	const ogImageUrl = tokenName && tokenSymbol && tokenImage
		? `/api/og?name=${encodeURIComponent(tokenName)}&symbol=${encodeURIComponent(tokenSymbol)}&imgUrl=${encodeURIComponent(tokenImage)}&is_refine=${isRefine ? "1" : "0"}&lang=${encodeURIComponent(lang)}`
		: (lang.startsWith("en") ? siteConfig.imgEn : siteConfig.img);
	useEffect(() => {
		setIsShareImageLoading(true);
	}, [ogImageUrl]);
	const shareUrl = useMemo(() => {
		const origin = typeof window !== "undefined" ? window.location.origin : siteConfig.url;
		return mint ? `${origin.replace(/\/$/, "")}/token/${mint}` : origin;
	}, [mint]);
	const handleShare = () => {
		const text = t("Share.tokenShareText", {
			name: tokenName || siteConfig.name,
			symbol: tokenSymbol || "--",
		});
		const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
		window.open(url, "_blank", "noopener,noreferrer");
	};
	const tabs: Array<{ key: "market" | "mining"; label: string }> = isRefine
		? [
			{ key: "mining", label: t("Mining.tabMining") },
			{ key: "market", label: t("Mining.tabMarket") },
		]
		: [
			{ key: "market", label: t("Mining.tabMarket") },
			{ key: "mining", label: t("Mining.tabMining") },
		];

	if (!coinInfo)
		return <div className="flex items-center justify-center h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] w-screen bg-[#0D0F13]">
			<img src="/images/loading.gif" alt="Loading" className="w-[48px] h-[48px]" />
		</div>

	return (
		<div className="flex flex-col items-center w-full">
			<div className="h-[48px] flex items-center px-[16px] md:hidden w-full">
				<BackIcon onClick={() => { router.push('/') }} />
				<div className="flex-1 flex items-center justify-center">
					<div className="flex h-[32px] border-[1px] border-[#25262A] rounded-[16px] text-[14px] font-bold overflow-hidden">
						{tabs.map((tab: any) => (
							<button
								key={tab.key}
								type="button"
								className={`${TAB_CLASS} ${activeTab == tab.key ? "bg-[#303135] text-white" : "text-[#868789]"}`}
								onClick={() => setActiveTab(tab.key)}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>
				<ShareIcon className="cursor-pointer" onClick={() => setIsShareOpen(true)} />
			</div>
			<div className="w-full max-w-[600px] hidden md:flex h-[36px] border-[1px] border-[#25262A] rounded-[8px] text-[14px] font-bold overflow-hidden mt-[32px]">
				{tabs.map((tab: any) => (
					<button
						key={tab.key}
						type="button"
						className={`${TAB_CLASS_PC} ${activeTab == tab.key ? "bg-[#303135] text-white" : "text-[#868789]"}`}
						onClick={() => setActiveTab(tab.key)}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div className="px-[14px] w-full flex justify-center mb-[60px]">
				{activeTab === "market" ? (
					<Market coinInfo={coinInfo as any} onSwitchToMining={() => setActiveTab("mining")} />
				) : (
					<Mining coinInfo={coinInfo as any} />
				)}
			</div>
			<Modal
				isOpen={isShareOpen}
				onOpenChange={(open) => setIsShareOpen(open)}
				size="md"
				hideCloseButton
				placement="bottom-center"
				classNames={{
					backdrop: "bg-black/80",
					base: "bg-[#191B1F] border-[1px] border-[#303135] rounded-[0px] rounded-t-[12px] md:rounded-[12px] mx-0 md:mx-4 mb-0 md:my-auto",
					wrapper: "items-end md:items-center",
					header: "border-none pb-0",
					body: "p-0",
				}}
			>
				<ModalContent>
					<ModalHeader className="flex justify-center items-center p-0 relative h-[48px] mt-[8px]">
						<div className="flex text-[17px]">{t("Actions.share")}</div>
					</ModalHeader>
					<ModalBody className="px-[14px] pb-[20px] gap-0">
						<div className="w-full rounded-[12px] overflow-hidden border border-[#25262A] bg-[#111214] relative" style={{ aspectRatio: "1200 / 630" }}>
							{isShareImageLoading && (
								<div className="absolute inset-0 flex items-center justify-center bg-[#1E2025]">
									<img src="/images/loading.gif" alt="Loading" className="w-[32px] h-[32px] opacity-80" />
								</div>
							)}
							<img
								src={ogImageUrl}
								alt="Share preview"
								className={`w-full h-full object-cover block ${isShareImageLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
								onLoad={() => setIsShareImageLoading(false)}
								onError={() => setIsShareImageLoading(false)}
							/>
						</div>
						<Button
							fullWidth
							className="mt-[16px] h-[44px] bg-[#FD7438] rounded-[8px] text-[15px] text-[#fff]"
							onPress={handleShare}
						>
							{t("Actions.shareToX")}
						</Button>
					</ModalBody>
				</ModalContent>
			</Modal>
		</div>
	);
};

export async function getServerSideProps(context: { params?: { addr?: string } }) {
	const addr = context.params?.addr;
	if (!addr || typeof addr !== "string") {
		return { props: {} };
	}
	try {
		let metadata: {
			name?: string | null;
			symbol?: string | null;
			image?: string | null;
			is_refine?: number | null;
		} = {};

		const apiBase = process.env.NEXT_PUBLIC_API_URL;
		if (apiBase) {
			const response = await fetch(`${apiBase}/v1/originfun/coin_show`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({ mint: addr }),
			});
			const res = response.ok ? await response.json() : null;
			const data = res?.data ?? null;
			if (data) {
				metadata = {
					name: data?.name ?? null,
					symbol: data?.symbol ?? null,
					image: data?.image_url ?? null,
					is_refine: data?.is_refine ?? 0,
				};
			}
		}

		if (!metadata.name || !metadata.symbol || !metadata.image) {
			const rpcUrl = DEFAULT_CHAIN_CONFIG?.rpcUrl;
			const tokenFactory = DEFAULT_CHAIN_CONFIG?.tokenFactory as `0x${string}` | undefined;
			if (rpcUrl && tokenFactory) {
				const provider = new ethers.JsonRpcProvider(rpcUrl);
				const contract = new ethers.Contract(tokenFactory, TokenFactoryAbi, provider);
				const uri = await contract.uri(addr);
				if (uri) {
					const response = await fetch(uri);
					if (response.ok) {
						const tokenData = await response.json();
						metadata = {
							name: metadata.name ?? tokenData?.name ?? null,
							symbol: metadata.symbol ?? tokenData?.symbol ?? null,
							image: metadata.image ?? tokenData?.image ?? null,
							is_refine: metadata.is_refine ?? 0,
						};
					}
				}
			}
		}

		if (!metadata.name && !metadata.symbol && !metadata.image) {
			return { props: {} };
		}
		return {
			props: {
				tokenMetadata: metadata,
			},
		};
	} catch {
		return { props: {} };
	}
}
