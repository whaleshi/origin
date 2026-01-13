import { CopyIcon, LogoutIcon, WalletIcon } from "@/components/icons";
import useClipboard from "@/hooks/useCopyToClipboard";
import { useBalanceContext } from "@/providers/balanceProvider";
import { useAuthStore } from "@/stores/auth";
import { shortenAddress } from "@/utils";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { Button } from "@heroui/react";
import { useFundWallet, usePrivy } from "@privy-io/react-auth";
import router from "next/router";
import { bsc } from "wagmi/chains";

export const WalletBox = () => {
	const { balance, symbol, originInfoData } = useBalanceContext();
	const { logout } = usePrivy();
	const { fundWallet } = useFundWallet();
	const { address, clearAuthState } = useAuthStore();
	const { copy } = useClipboard();

	const toLogout = async () => {
		clearAuthState();
		try { await logout(); } catch { }
		router.push("/");
		// onClose?.();
	}

	const receive = () => {
		fundWallet({
			address: address!,
			options: {
				chain: bsc,
				defaultFundingMethod: 'manual',
				uiConfig: {
					receiveFundsTitle: 'Receive 0.5 BNB',
					receiveFundsSubtitle: 'Scan this code or copy your wallet address to receive funds on Bsc.'
				}
			}
		});
	}
	return (
		<div className="w-full relative border-[1.5px] border-[#303135] rounded-[12px] bg-[#191B1F]">
			<div className="bg-[#25262A] rounded-t-[12px] px-[16px]">
				<div className="w-full h-[74px] flex items-center justify-between">
					<div>
						<div className="text-[12px] text-[rgba(255,255,255,0.35)]">钱包余额</div>
						<div className="text-[20px] text-[#fff] font-bold">{formatBigNumber(balance)} {symbol}</div>
					</div>
					<div className="flex gap-[8px]">
						<Button
							variant="bordered"
							className="h-[27px] min-w-[30px] border-[#868789] border-[1px] text-[13px] text-[#FFF] px-[12px]"
							radius="full"
							onPress={() => receive()}
						>
							接收
						</Button>
					</div>
				</div>
			</div>
			<div className="h-[44px] flex items-center justify-between px-[16px]">
				<div className="text-[13px] text-[#868789] flex items-center gap-[8px]">
					<WalletIcon className="" />
					<span>{shortenAddress(address!)}</span>
					<CopyIcon className="cursor-pointer" onClick={() => copy(address!)} />
				</div>
				<LogoutIcon className="cursor-pointer" onClick={() => { toLogout() }} />
			</div>
		</div>
	);
};
