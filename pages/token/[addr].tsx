import { useState } from "react";

import { BackIcon, ShareIcon } from "@/components/icons";
import Market from "@/components/market";
import Mining from "@/components/mining";

const TAB_CLASS = "w-[90px] flex items-center justify-center rounded-[16px] cursor-pointer";
const TAB_CLASS_PC = "flex-1 flex items-center justify-center rounded-[6px] cursor-pointer";

export default function Token() {
	const [activeTab, setActiveTab] = useState<"market" | "mining">("mining");

	return (
		<div className="flex flex-col items-center w-full">
			<div className="h-[48px] flex items-center px-[16px] md:hidden w-full">
				<BackIcon />
				<div className="flex-1 flex items-center justify-center">
					<div className="flex h-[32px] border-[1px] border-[#25262A] rounded-[16px] text-[14px] font-bold overflow-hidden">
						<button
							type="button"
							className={`${TAB_CLASS} ${activeTab == "market" ? "bg-[#303135] text-white" : "text-[#868789]"}`}
							onClick={() => setActiveTab("market")}
						>
							市场
						</button>
						<button
							type="button"
							className={`${TAB_CLASS} ${activeTab == "mining" ? "bg-[#303135] text-white" : "text-[#868789]"}`}
							onClick={() => setActiveTab("mining")}
						>
							挖矿
						</button>
					</div>
				</div>
				<ShareIcon />
			</div>
			<div className="w-full max-w-[600px] hidden md:flex h-[36px] border-[1px] border-[#25262A] rounded-[8px] text-[14px] font-bold overflow-hidden mt-[32px]">
				<button
					type="button"
					className={`${TAB_CLASS_PC} ${activeTab == "market" ? "bg-[#303135] text-white" : "text-[#868789]"}`}
					onClick={() => setActiveTab("market")}
				>
					市场
				</button>
				<button
					type="button"
					className={`${TAB_CLASS_PC} ${activeTab == "mining" ? "bg-[#303135] text-white" : "text-[#868789]"}`}
					onClick={() => setActiveTab("mining")}
				>
					挖矿
				</button>
			</div>

			<div className="px-[14px] w-full flex justify-center">
				{activeTab === "market" ? (
					<Market />
				) : (
					<Mining />
				)}
			</div>
		</div>
	);
};
