import Marquee from "react-fast-marquee";
import MyAvatar from "@/components/avatar";
import { getSwapList } from "@/service/api";
import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { DEFAULT_CHAIN_CONFIG } from "@/config/chains";
import { useRouter } from "next/router";

export default function TopScroll() {
	const router = useRouter();
	const colorSchemes = [
		{ bg: '#EC42FF33', text: '#EC42FF' },
		{ bg: '#FF536133', text: '#FF5361' },
		{ bg: '#FCC72933', text: '#FCC729' },
		{ bg: '#22DAFA33', text: '#22DAFA' },
		{ bg: '#1DEE7E33', text: '#1DEE7E' },
		{ bg: '#6655FF33', text: '#6655FF' },
	];

	const { data: swapList } = useQuery({
		queryKey: ['swapList'],
		queryFn: async () => {
			const params = {
				page: "1",
				page_size: "10",
			};
			const result = await getSwapList(params);
			return result?.data;
		},
		refetchInterval: 3000,
	});

	const normalizeList = (data: any) => {
		if (Array.isArray(data?.list)) return data.list;
		if (Array.isArray(data)) return data;
		return [];
	};

	const formatAddress = (value: any) => {
		const text = String(value);
		if (text.length <= 10) return text;
		return `${text.slice(0, 6)}...${text.slice(-4)}`;
	};

	const formatAmount = (value: any, unit?: any) => {
		if (value === null || value === undefined || value === "") return unit ? `0 ${unit}` : "0";
		const raw = String(value).replace(/,/g, "").trim();
		if (!raw) return unit ? `0 ${unit}` : "0";
		const bn = new BigNumber(raw);
		if (!bn.isFinite()) return unit ? `0 ${unit}` : "0";
		const scaled = bn.dividedBy(new BigNumber(10).pow(8));
		const formatted = scaled.decimalPlaces(4, BigNumber.ROUND_DOWN).toFixed(4);
		const trimmed = new BigNumber(formatted).toString();
		return unit ? `${trimmed} ${unit}` : trimmed;
	};

	const formatToken = (value: any) => {
		const text = String(value ?? "");
		if (text.length <= 10) return text;
		return `${text.slice(0, 10)}...`;
	};

	const getAddressUrl = (address: any) => {
		const base = DEFAULT_CHAIN_CONFIG?.explorerUrl;
		if (!base || !address) return "";
		return `${base}/address/${address}`;
	};

	const transactions = (() => {
		const list = normalizeList(swapList);
		return list.map((item: any, index: number) => ({
			id: item?.id ?? item?.swap_id ?? index,
			address: formatAddress(item?.user),
			rawAddress: item?.user,
			type: item?.is_buy ? '买入' : '卖出',
			amount: formatAmount(item?.is_buy ? item?.input_amount : item?.output_amount, 'BNB'),
			token: formatToken(item?.is_buy ? item?.output_symbol : item?.input_symbol),
			mint: item?.is_buy ? item?.base_token : item?.quote_token,
			img: item?.is_buy ? item?.output_logo : item?.input_logo,
		}));
	})();

	return (
		<div className="w-full bg-transparent">
			<Marquee
				speed={50}           // 速度（数值越大越快）
				gradient={true}      // 开启左右渐变遮罩，视觉更高级
				gradientColor="black" // 渐变颜色（根据背景调整）
				gradientWidth={50}   // 渐变宽度
				pauseOnHover={true}  // 鼠标悬停暂停
			>
				{transactions.map((tx: any, index: any) => {
					const colorScheme = colorSchemes[index % colorSchemes.length];
					return (
						<div
							key={tx.id}
							className="flex items-center gap-1 px-3 h-[26px] mx-1 rounded-[6px] text-[12px] flex-shrink-0"
							style={{
								backgroundColor: colorScheme.bg,
								color: colorScheme.text,
								backdropFilter: 'blur(2px)'
							}}
						>
							<a
								href={getAddressUrl(tx.rawAddress)}
								target="_blank"
								rel="noreferrer"
								className="underline cursor-pointer"
							>
								{tx.address}
							</a>
							<span className="">{tx.type} {tx.amount}</span>
							<MyAvatar src={tx.img || '/images/common/default.png'} alt="avatar" className="w-[14px] h-[14px]" />
							<span
								className={`underline ${tx.mint ? "cursor-pointer" : "cursor-default"}`}
								onClick={() => {
									if (tx.mint) {
										router.push(`/token/${tx.mint}`);
									}
								}}
							>
								{tx.token}
							</span>
						</div>
					);
				})}
			</Marquee>
		</div>
	);
}
