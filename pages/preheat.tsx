import { useTranslation } from "react-i18next";
import { useState } from "react";
import { NavbarNew } from "@/components/navbarNew";
import AHoleEffect from "@/components/topCanvas";
import { Button } from "@heroui/react";

export default function PreheatPage() {
	const { t, i18n } = useTranslation();
	const [activeTab, setActiveTab] = useState<"flywheel" | "game">("flywheel");
	const [activeStep, setActiveStep] = useState<"create" | "internal" | "activate" | "game">("create");
	const isEnglish = i18n.language?.startsWith("en");
	const steps = [
		{ key: "create", label: isEnglish ? "Create Token" : "创建代币", color: "#17C964" },
		{ key: "internal", label: isEnglish ? "Internal Market" : "内盘", color: "#FD7438" },
		{
			key: "activate",
			label: isEnglish ? "PancakeSwap\n(External Market)" : "激活挖矿",
			color: "#22C7D5",
		},
		{ key: "game", label: isEnglish ? "Mining Game" : "挖矿游戏", color: "#EFB531" },
	] as const;
	const activeStepIndex = Math.max(0, steps.findIndex((step) => step.key === activeStep)) + 1;
	const imageLangSuffix = isEnglish ? "EN" : "ZH";

	return (
		<div className="min-h-screen w-full bg-[#0D0F13] px-[16px] pt-[56px] md:pt-[64px]">
			<NavbarNew />
			<div className="w-full h-[200px] md:w-[640px] md:h-[320px] mx-auto relative">
				<AHoleEffect />
				<div className="w-full h-full absolute top-0 z-11 flex flex-col items-center">
					<div className="text-[32px] font-bold text-[#fff] text-center pt-[80px]">
						<span className="block md:inline">{t("Preheat.heroTitleLine1")}</span>
						<span className="block md:inline">
							{t("Preheat.heroTitleLine2")}
							<span className="text-[#FD7438]"> {t("Preheat.heroTitleHighlight")}</span>
						</span>
					</div>
					<div className="text-[14px] md:text-[15px] mt-[16px] text-[#fff] text-center">
						{t("Preheat.heroDesc")}
					</div>
					<div className="w-full bg-[#25262A] h-[36px] rounded-[8px] hidden text-[14px] mt-[32px] md:flex">
						<button
							type="button"
							onClick={() => setActiveTab("flywheel")}
							className={`flex-1 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors ${activeTab === "flywheel"
								? "bg-[#36383B] text-[#fff]"
								: "text-[#868789]"
								}`}
						>
							{t("Preheat.flywheelTab")}
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("game")}
							className={`flex-1 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors ${activeTab === "game"
								? "bg-[#36383B] text-[#fff]"
								: "text-[#868789]"
								}`}
						>
							{t("Preheat.gameTab")}
						</button>
					</div>
				</div>
				<div className="absolute bottom-0 w-full h-[80px] md:h-[180px] z-10 block md:hidden"
					style={{ background: "linear-gradient(180deg, rgba(13, 15, 19, 0.00) 0%, #0D0F13 100%)" }}
				></div>
			</div>
			<Button fullWidth className="h-[44px] bg-[#FF6021] mt-[112px] block md:hidden">{t("Preheat.comingSoon")}</Button>
			<div className="mt-[60px] text-[18px] text-[#fff] flex items-center justify-center gap-[8px] md:hidden">
				<StartIcon />
				{isEnglish ? "Operation Mechanism" : "运行机制"}
				<StartIcon className="rotate-180" />
			</div>
			<div className="w-full bg-[#25262A] h-[36px] rounded-[8px] flex text-[14px] mt-[28px] md:hidden">
				<button
					type="button"
					onClick={() => setActiveTab("flywheel")}
					className={`flex-1 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors ${activeTab === "flywheel"
						? "bg-[#36383B] text-[#fff]"
						: "text-[#868789]"
						}`}
				>
					{t("Preheat.flywheelTab")}
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("game")}
					className={`flex-1 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors ${activeTab === "game"
						? "bg-[#36383B] text-[#fff]"
						: "text-[#868789]"
						}`}
				>
					{t("Preheat.gameTab")}
				</button>
			</div>
			<div className="mt-[24px] mx-auto flex justify-center md:hidden">
				<div className="text-[16px] text-[#fff] font-semibold mb-[50px]">
					{activeTab === "flywheel" ? (
						<img
							src={`/images/tab1H5${imageLangSuffix}.png`}
							alt={activeStep}
							className="w-full h-auto"
						/>
					) : (
						<img
							src={`/images/tab2H5${imageLangSuffix}.png`}
							alt={activeStep}
							className="w-full h-auto"
						/>
					)}
				</div>
			</div>
			<div className={`w-[880px] h-[480px] mx-auto hidden md:block relative z-20 ${isEnglish ? "-mt-[10px]" : "-mt-[30px]"}`}>
				{activeTab === "flywheel" ? (
					<img
						src={`/images/tab${activeStepIndex}${imageLangSuffix}.png`}
						alt={activeStep}
						className="w-full h-auto"
					/>
				) : (
					<img
						src={`/images/game${imageLangSuffix}.png`}
						alt={activeStep}
						className="w-full h-auto"
					/>
				)}
				{
					activeTab === "flywheel" && <div className="text-[16px] flex items-start justify-center absolute top-[1px] left-0 w-full">
						{steps.map((step) => {
							const isActive = activeStep === step.key;
							return (
								<button
									key={step.key}
									type="button"
									onClick={() => setActiveStep(step.key)}
									className={`${isEnglish ? "w-[140px]" : "w-[120px]"} rounded-b-[8px] flex items-center justify-center cursor-pointer transition-colors`}
									style={{
										height: isActive ? 32 : 27,
										backgroundColor: isActive ? step.color : `${step.color}40`,
										color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.50)",
									}}
								>
									{step.key === "activate" && isEnglish ? (
										<div className="text-center leading-[1.1]">
											<div className="text-[11px]">PancakeSwap</div>
											<div className="text-[8px] opacity-80">(External Market)</div>
										</div>
									) : (
										step.label
									)}
								</button>
							);
						})}
					</div>
				}
			</div>
		</div>
	);
}


const StartIcon = ({ className = "" }: { className?: string }) => (
	<svg className={className} xmlns="http://www.w3.org/2000/svg" width="27" height="13" viewBox="0 0 27 13" fill="none">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M19.8644 0.288481C20.0439 -0.0962024 20.591 -0.0961184 20.7706 0.288481L22.4679 3.9252C22.5176 4.03162 22.6037 4.11772 22.7101 4.16739L26.3468 5.86465C26.7315 6.04421 26.7315 6.59135 26.3468 6.7709L22.7101 8.46817C22.6038 8.5178 22.5176 8.60306 22.4679 8.70938L20.7706 12.3471C20.591 12.7315 20.0439 12.7317 19.8644 12.3471L18.1671 8.70938C18.1175 8.60322 18.0321 8.51778 17.9259 8.46817L14.2882 6.7709C13.9039 6.59127 13.9039 6.04433 14.2882 5.86465L17.9259 4.16739C18.0323 4.11771 18.1175 4.03158 18.1671 3.9252L19.8644 0.288481ZM3.8644 2.28848C4.04393 1.9038 4.59103 1.90388 4.77065 2.28848L5.83217 4.56192C5.88179 4.66821 5.96712 4.75345 6.07338 4.80313L8.34682 5.86465C8.73154 6.04421 8.73154 6.59135 8.34682 6.7709L6.07338 7.83145C5.96696 7.88112 5.88184 7.96722 5.83217 8.07364L4.77065 10.3471C4.59097 10.7315 4.04393 10.7317 3.8644 10.3471L2.80385 8.07364C2.75418 7.96722 2.66808 7.88112 2.56166 7.83145L0.288225 6.7709C-0.0960962 6.59127 -0.0960536 6.04433 0.288225 5.86465L2.56166 4.80313C2.66808 4.75346 2.75418 4.66834 2.80385 4.56192L3.8644 2.28848Z" fill="url(#paint0_linear_15230_1223)" />
		<defs>
			<linearGradient id="paint0_linear_15230_1223" x1="26.6354" y1="6.31773" x2="0" y2="6.31773" gradientUnits="userSpaceOnUse">
				<stop stop-color="#A2FFE5" />
				<stop offset="1" stop-color="#D3FFF3" />
			</linearGradient>
		</defs>
	</svg>
)
