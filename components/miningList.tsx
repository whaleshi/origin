import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGameRecords } from '@/service/api';
import { ethers } from 'ethers';
import _bignumber from 'bignumber.js';
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
const BigNumber = _bignumber;
import { useAuthStore } from "@/stores/auth";
import MyAvatar from "@/components/avatar";

type MiningListProps = {
	coinInfo?: any;
};

export const MiningList = ({ coinInfo }: MiningListProps) => {
	const { t } = useTranslation();
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedTab, setSelectedTab] = useState<'my' | 'global'>('my');
	const pageSize = 10;
	const queryClient = useQueryClient();
	const { address } = useAuthStore();
	const miningAddress = coinInfo?.mint;
	const userAddr = address ?? "";

	// 合并后的记录查询
	const { data: gameRecords, isLoading } = useQuery({
		queryKey: ['gameRecords', selectedTab, currentPage, address, miningAddress],
		queryFn: async () => {
			const params: Record<string, string | number | boolean> = selectedTab === 'my'
				? {
					mining_address: miningAddress,
					page: currentPage.toString(),
					page_size: pageSize.toString(),
					user_addr: userAddr,
				}
				: {
					page: currentPage.toString(),
					page_size: pageSize.toString(),
					mother_reward_enabled: 0,
					mining_address: miningAddress,
				};
			const result = await getGameRecords(params);
			return result?.data;
		},
		enabled: selectedTab === 'global' ? !!miningAddress : !!address && !!miningAddress,
		refetchInterval: 10000, // 10秒一次
	});

	// 预加载下一页数据
	useEffect(() => {
		if (gameRecords?.total && miningAddress && (selectedTab === 'global' || address)) {
			const totalPages = Math.ceil(gameRecords.total / pageSize);
			const nextPage = currentPage + 1;

			if (nextPage <= totalPages) {
				queryClient.prefetchQuery({
					queryKey: [
						'gameRecords',
						selectedTab,
						nextPage,
						...(selectedTab === 'my' ? [address] : []),
						miningAddress
					],
					queryFn: async () => {
						const params: Record<string, string | number | boolean> = selectedTab === 'my'
							? {
								mining_address: miningAddress,
								page: nextPage.toString(),
								page_size: pageSize.toString(),
								user_addr: userAddr,
							}
							: {
								page: nextPage.toString(),
								page_size: pageSize.toString(),
								mother_reward_enabled: 0,
								mining_address: miningAddress,
							};
						const result = await getGameRecords(params);
						return result?.data;
					},
				});
			}
		}
	}, [currentPage, gameRecords, selectedTab, address, queryClient, pageSize, miningAddress]);

	// 统一数据
	const displayData = gameRecords || { list: [], total: 0 };
	const hasRecords = (displayData?.list?.length ?? 0) > 0;
	const showLoading = isLoading && !gameRecords;

	return (
		<div className="w-full max-w-[600px] mt-[28px]">
			<div className="flex items-center justify-between mb-[8px]">
				<div className="text-[20px] text-[#fff]">{t('Game.miningRecords')}</div>
				<div className="bg-[#0D0F13] rounded-[20px] flex border-[1px] border-[#25262A]">
					<button
						className={`px-[12px] py-[4px] rounded-[18px] text-[12px] font-medium transition-colors cursor-pointer ${selectedTab === 'my'
							? 'bg-[#25262A] text-[#fff]'
							: 'text-[#868789] hover:text-[#fff]'
							}`}
						onClick={() => setSelectedTab('my')}
					>
						{t('Game.my')}
					</button>
					<button
						className={`px-[12px] py-[4px] rounded-[18px] text-[12px] font-medium transition-colors cursor-pointer ${selectedTab === 'global'
							? 'bg-[#25262A] text-[#fff]'
							: 'text-[#868789] hover:text-[#fff]'
							}`}
						onClick={() => setSelectedTab('global')}
					>
						{t('Game.global')}
					</button>
				</div>
			</div>

			{/* Horizontal Scrollable Table */}
			<div className="w-full overflow-x-auto mb-[30px]">
				<div className={selectedTab === 'global' ? 'min-w-[564px]' : 'min-w-[604px]'}>
					{/* Table Header */}
					<div className="flex border-b border-dashed border-[#25262A] h-[38px] items-center text-[12px] text-[#868789] px-[12px]">
						<div className="w-[60px] md:flex-[0.6] shrink-0 text-left">{t('Game.round')}</div>
						<div className={selectedTab != 'global' ? 'w-[100px] md:flex-[1] shrink-0 text-right' : 'w-[60px] md:flex-[0.6] shrink-0 text-right'}>{selectedTab === 'global' ? t('Game.player') : t('Game.buy')}</div>
						<div className="w-[100px] md:flex-[1] shrink-0 text-right">{selectedTab === 'global' ? t('Game.buy') : t('Game.sell')}</div>
						<div className="w-[100px] md:flex-[1] shrink-0 text-right">{selectedTab === 'global' ? t('Game.sell') : t('Game.netBuys')}</div>
						<div className="w-[100px] md:flex-[1] shrink-0 text-right">{selectedTab === 'global' ? t('Game.netBuys') : t('Game.reward')}</div>
						<div className="w-[120px] md:flex-[1.2] shrink-0 text-right">{t('Game.time')}</div>
					</div>

					{/* Table Rows */}
					<div className="">
						{showLoading ? (
							<div className="flex h-[380px] items-center justify-center text-[14px] text-[#868789]">
								<div className="flex flex-col items-center gap-[12px]">
									<img src="/images/logo.png" alt="Loading" className="w-[40px] h-[40px]" />
								</div>
							</div>
						) : hasRecords ? (
							displayData.list.map((row: any, index: any) => (
								<div key={index} className="flex min-h-[38px] items-center text-[12px] hover:bg-[#191B1F] transition-colors cursor-pointer px-[12px] rounded-[8px] py-[2px]">
									<div className="w-[60px] md:flex-[0.6] shrink-0 text-[#fff] break-words text-left">#{row?.show_round_id}</div>
									<div className={selectedTab != 'global' ? 'w-[100px] md:flex-[1] shrink-0 text-[#fff] break-words text-right flex items-center justify-end gap-[4px]' : 'w-[60px] md:flex-[0.6] shrink-0 text-[#fff] break-words text-right flex items-center justify-end gap-[4px]'}>
										{
											selectedTab != 'global' && <MyAvatar src="/images/origin.png" alt="icon" className="w-[14px] h-[14px] bg-[transparent]" />
										}
										{selectedTab === 'global' ? row?.participant_count : BigNumber(ethers.formatUnits(BigInt(row?.buy_amount || '0'), 8)).dp(4, BigNumber.ROUND_DOWN).toFixed()}
									</div>
									<div className="w-[100px] md:flex-[1] shrink-0 text-[#fff] break-words overflow-hidden text-right flex items-center justify-end gap-[4px]">
										<MyAvatar src="/images/origin.png" alt="icon" className="w-[14px] h-[14px] bg-[transparent]" />
										{selectedTab === 'global' ? BigNumber(ethers.formatUnits(BigInt(row?.total_buy_amount || '0'), 8)).dp(4, BigNumber.ROUND_DOWN).toFixed() : BigNumber(ethers.formatUnits(BigInt(row?.sell_amount || '0'), 8)).dp(4, BigNumber.ROUND_DOWN).toFixed()}
									</div>
									<div className="w-[100px] md:flex-[1] shrink-0 text-[#fff] break-words text-right flex items-center justify-end gap-[4px]">
										<MyAvatar src="/images/origin.png" alt="icon" className="w-[14px] h-[14px] bg-[transparent]" />
										{selectedTab === 'global' ? BigNumber(ethers.formatUnits(BigInt(row?.total_sell_amount || '0'), 8)).dp(4, BigNumber.ROUND_DOWN).toFixed() : BigNumber(ethers.formatUnits(BigInt(row?.net_buy_amount || '0'), 8)).dp(4, BigNumber.ROUND_DOWN).toFixed()}
									</div>
									<div className="w-[100px] md:flex-[1] shrink-0 flex items-center justify-end gap-[4px] min-w-0">
										{
											selectedTab != 'global' ? <MyAvatar src={coinInfo?.image_url} alt="icon" className="w-[14px] h-[14px] bg-[transparent] grayscale" /> : <MyAvatar src="/images/origin.png" alt="icon" className="w-[14px] h-[14px] bg-[transparent]" />
										}
										{selectedTab === 'global' ? BigNumber(ethers.formatUnits(BigInt(row?.total_trade_amount || '0'), 8)).dp(4, BigNumber.ROUND_DOWN).toFixed() : BigNumber(ethers.formatUnits(BigInt(row?.normal_reward_amount || '0'), 8)).plus(ethers.formatUnits(BigInt(row?.mother_reward_amount || '0'), 8)).dp(2, BigNumber.ROUND_DOWN).toFixed()}
									</div>
									<div className="w-[120px] md:flex-[1.2] shrink-0 text-[#fff] text-right text-[11px] leading-tight">{row?.created_ts ? new Date(row?.created_ts * 1000).toLocaleString() : '-'}</div>
								</div>
							))
						) : (
							<div className="flex h-[380px] items-center justify-center text-[14px] text-[#868789]">
								<div className="flex flex-col items-center gap-[12px]">
									<img src="/images/nothing.png" alt="No data" className="w-[80px] h-[80px] opacity-50" />
									<span>{t('Explore.noRecordsFound')}</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Navigation Arrows */}
			{Math.ceil((displayData?.total || 0) / pageSize) > 1 && (
				<div className="flex justify-end gap-[8px] mt-[16px] mb-[20px] w-full">
					<div
						className={`w-[32px] h-[32px] rounded-full border border-[#25262A] flex items-center justify-center cursor-pointer hover:bg-[#25262A] transition-colors ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
						onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#868789]">
							<path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
					<div className="flex items-center px-3 text-[12px] text-[#868789]">
						{currentPage} / {Math.ceil((displayData?.total || 0) / pageSize)}
					</div>
					<div
						className={`w-[32px] h-[32px] rounded-full border border-[#25262A] flex items-center justify-center cursor-pointer hover:bg-[#25262A] transition-colors ${currentPage >= Math.ceil((displayData?.total || 0) / pageSize) ? 'opacity-50 cursor-not-allowed' : ''}`}
						onClick={() => currentPage < Math.ceil((displayData?.total || 0) / pageSize) && setCurrentPage(currentPage + 1)}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#868789]">
							<path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
				</div>
			)}
		</div>
	);
};
