import { useEffect, useMemo, useState } from 'react';
import MeTokenItem, { MeTokenItemSkeleton } from './meTokenItem';
import router from 'next/router';
import { getCoinList, getHolderCoins, getMiningList } from '@/service/api';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import { useReadContracts } from "wagmi";
import IERC20Abi from "@/constant/IERC20.json";
import { DEFAULT_CHAIN_ID } from "@/config/chains";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { Pagination } from "@heroui/react";


export default function MeList() {
	const [activeTab, setActiveTab] = useState('持仓代币');
	const { address } = useAuthStore();
	const tabs = useMemo(() => ([
		{ label: '持仓代币', key: 'holder' },
		{ label: '挖矿', key: 'mining' },
		{ label: '我创建的', key: 'created' },
	]), []);
	const pageSize = 20;
	const [currentPage, setCurrentPage] = useState(1);
	const activeTabIndex = tabs.findIndex((tab) => tab.label === activeTab);
	const safeActiveIndex = activeTabIndex === -1 ? 0 : activeTabIndex;
	const activeTabKey = tabs[safeActiveIndex]?.key;

	useEffect(() => {
		setCurrentPage(1);
	}, [activeTabKey]);

	const activeQuery = useQuery({
		queryKey: ['meList', activeTabKey, address, currentPage],
		queryFn: async () => {
			if (!activeTabKey) return null;
			if (activeTabKey === "holder") {
				const result = await getHolderCoins({ user: address, page: currentPage, page_size: pageSize });
				return result?.data;
			}
			if (activeTabKey === "mining") {
				const result = await getMiningList({ user: address, page: currentPage, page_size: pageSize });
				return result?.data;
			}
			const result = await getCoinList({ page: currentPage, page_size: pageSize, user_addr: address });
			return result?.data;
		},
		enabled: !!address && !!activeTabKey,
		refetchInterval: activeTabKey ? 3000 : false,
	});
	const normalizeList = (data: { list?: any[] } | any[] | null | undefined) => {
		if (Array.isArray((data as { list?: unknown[] } | null | undefined)?.list)) {
			return (data as { list?: any[] }).list ?? [];
		}
		if (Array.isArray(data)) return data;
		return [];
	};
	const activeItems = normalizeList(activeQuery.data);
	const isActiveLoading = activeQuery.isLoading || activeQuery.isFetching;
	const totalCount = (activeQuery.data as any)?.total
		?? (activeQuery.data as any)?.count
		?? (activeQuery.data as any)?.total_count
		?? activeItems.length;
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const shouldFetchBalances = activeTabKey === "holder" || activeTabKey === "created";
	const getTokenAddress = (item: any) => {
		const tokenInfo = item?.coin_info ?? item;
		const address = tokenInfo?.mint ?? tokenInfo?.address ?? tokenInfo?.token_address;
		return typeof address === "string" && address.startsWith("0x") ? (address as `0x${string}`) : undefined;
	};
	const activeTokenAddresses = useMemo(() => {
		if (!shouldFetchBalances) return [];
		const sourceItems = activeItems;
		const unique = new Set<string>();
		sourceItems.forEach((item) => {
			const tokenAddress = getTokenAddress(item);
			if (tokenAddress) unique.add(tokenAddress);
		});
		return Array.from(unique) as `0x${string}`[];
	}, [activeTabKey, activeItems, shouldFetchBalances]);
	const { data: balanceReads } = useReadContracts({
		contracts: activeTokenAddresses.map((tokenAddress) => ({
			address: tokenAddress,
			abi: (IERC20Abi as any).abi ?? IERC20Abi,
			functionName: "balanceOf",
			args: address ? [address as `0x${string}`] : undefined,
			chainId: DEFAULT_CHAIN_ID,
		})),
		query: {
			enabled: shouldFetchBalances && !!address && activeTokenAddresses.length > 0,
			refetchInterval: 3000,
		},
	});
	const balanceByToken = useMemo(() => {
		const map = new Map<string, bigint>();
		if (!balanceReads) return map;
		balanceReads.forEach((entry, index) => {
			const tokenAddress = activeTokenAddresses[index];
			if (!tokenAddress) return;
			const value = (entry as any)?.result ?? 0n;
			map.set(tokenAddress.toLowerCase(), value as bigint);
		});
		return map;
	}, [balanceReads, activeTokenAddresses]);

	return <div>
		<div className=''>
			<div className="h-[52px] flex items-center justify-between">
				<div className="text-[16px] flex gap-[12px]">
					{tabs.map((tab) => (
						<div
							key={tab.label}
							className={`cursor-pointer ${activeTab === tab.label ? 'text-white' : 'text-[#868789]'
								}`}
							onClick={() => setActiveTab(tab.label)}
						>
							{tab.label}
						</div>
					))}
				</div>
			</div>
			<div className='w-full' key={activeTabKey}>
				{
					(isActiveLoading && activeItems.length === 0) ? (
						<div className="mt-[8px] flex flex-col gap-[8px]">
							{Array.from({ length: 10 }).map((_, index) => (
								<MeTokenItemSkeleton key={index} />
							))}
						</div>
					) : (
						activeTabKey === "holder" && activeItems.length > 0 ? (
							activeItems.map((item, index) => {
								const key = item?.id ?? item?.coin_id ?? item?.address ?? index;
								const tokenAddress = getTokenAddress(item);
								const tokenBalanceValue = tokenAddress ? balanceByToken.get(tokenAddress.toLowerCase()) : undefined;
								const tokenBalanceText = tokenBalanceValue !== undefined
									? formatBigNumber(tokenBalanceValue, {
										decimals: 18,
										compact: false,
										withComma: true,
										precision: 4,
										trimTrailingZero: true,
									})
									: "--";
								return (
									<div key={key} className='mb-[8px]'>
										<MeTokenItem
											type="holder"
											data={item}
											tokenBalanceText={tokenBalanceText}
											tokenBalanceValue={tokenBalanceValue}
											onClick={(clicked) => router.push(`/token/${clicked?.mint}`)}
										/>
									</div>
								);
							})
						) : activeTabKey === "mining" && activeItems.length > 0 ? (
							activeItems.map((item, index) => {
								const itemData = item?.coin_info ?? item;
								const key = itemData?.id ?? itemData?.coin_id ?? item?.mining_address ?? itemData?.address ?? index;
								return (
									<div key={key} className='mb-[8px]'>
										<MeTokenItem
											type="mining"
											data={item}
											onClick={(clicked) => router.push(`/token/${clicked?.coin_info?.mint}`)}
										/>
									</div>
								);
							})
						) : activeTabKey === "created" && activeItems.length > 0 ? (
							activeItems.map((item, index) => {
								const key = item?.id ?? item?.coin_id ?? item?.address ?? index;
								const tokenAddress = getTokenAddress(item);
								const tokenBalanceValue = tokenAddress ? balanceByToken.get(tokenAddress.toLowerCase()) : undefined;
								const tokenBalanceText = tokenBalanceValue !== undefined
									? formatBigNumber(tokenBalanceValue, {
										decimals: 18,
										compact: false,
										withComma: true,
										precision: 4,
										trimTrailingZero: true,
									})
									: "--";
								return (
									<div key={key} className='mb-[8px]'>
										<MeTokenItem
											type="created"
											data={item}
											tokenBalanceText={tokenBalanceText}
											tokenBalanceValue={tokenBalanceValue}
											onClick={(clicked) => router.push(`/token/${clicked?.mint}`)}
										/>
									</div>
								);
							})
						) : (
							<div className='h-[200px] mt-[8px] bg-[rgba(13,15,19,0.35)] border-[1px] border-[#25262A] rounded-[8px] flex flex-col items-center justify-center'>
								<img src="/images/nothing.png" className="w-[80px] h-[80px]" />
								<div className="text-[#868789] text-[14px]">暂无数据</div>
							</div>
						)
					)
				}
			</div>
			{totalPages > 1 && (
				<div className="flex justify-center mt-[12px]">
					<Pagination
						total={totalPages}
						page={currentPage}
						onChange={setCurrentPage}
						showControls
						className="text-[#fff]"
						classNames={{
							item: "w-[28px] h-[28px] min-w-[28px] text-[#868789] p-0 rounded-[8px]",
							cursor: "w-[28px] h-[28px] min-w-[28px] bg-[#fff] text-[#000] p-0 rounded-[8px]",
							prev: "w-[28px] h-[28px] min-w-[28px] p-0 rounded-[8px]",
							next: "w-[28px] h-[28px] min-w-[28px] p-0 rounded-[8px]",
						}}
					/>
				</div>
			)}
		</div>
	</div>;
}
