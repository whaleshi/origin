import { BNBIcon } from "@/components/icons";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGameTradeRecords } from '@/service/api';
import { ethers } from 'ethers';
import _bignumber from 'bignumber.js';
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
const BigNumber = _bignumber;
import MyAvatar from "@/components/avatar";

type SwapListProps = {
	coinInfo?: any | null;
};

export const SwapList = ({ coinInfo }: SwapListProps) => {
	const { t } = useTranslation();
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	// 合并后的记录查询
	const { data: miningGameRecords, isLoading } = useQuery({
		queryKey: ['swapRecords', currentPage, coinInfo?.mint],
		queryFn: async () => {
			const params: Record<string, string | number | boolean> = {
				mining_address: coinInfo?.mint,
				page: currentPage.toString(),
				page_size: pageSize.toString(),
			};
			const result = await getGameTradeRecords(params);
			return result?.data;
		},
		enabled: !!coinInfo?.mint,
		refetchInterval: 10000, // 10秒一次
	});

	// 统一数据
	const displayData = miningGameRecords || { list: [], total: 0 };

	return (
		<div className="w-full">
			<div className="text-[20px] text-[#fff] mb-[8px]">{t('Game.tradeRecords')}</div>

			{/* Horizontal Scrollable Table */}
			<div className="w-full overflow-x-auto mb-[30px]">
				<div className="min-w-[424px]">
					{/* Table Header */}
					<div className="flex border-b border-dashed border-[#25262A] h-[38px] items-center text-[12px] text-[#868789] px-[12px]">
						<div className="w-[60px] md:flex-[0.6] shrink-0 text-left">{t('Game.type')}</div>
						<div className="w-[100px] md:flex-[1] shrink-0 text-right">起源</div>
						<div className="w-[100px] flex-[1] shrink-0 text-right">{t('Game.amount')}</div>
						<div className="w-[120px] flex-[1.2] shrink-0 text-right">{t('Game.time')}</div>
					</div>

					{/* Table Rows */}
					<div className="">
						{isLoading ? (
							<div className="flex h-[380px] items-center justify-center text-[14px] text-[#868789]">
								<div className="flex flex-col items-center gap-[12px]">
									<img src="/images/logo.png" alt="Loading" className="w-[40px] h-[40px]" />
								</div>
							</div>
						) : displayData?.list?.length > 0 ? (
							displayData.list.map((row: any, index: any) => (
								<div key={index} className="flex min-h-[38px] items-center text-[12px] hover:bg-[#191B1F] transition-colors cursor-pointer px-[12px] rounded-[8px] py-[2px]">
									<div className={`w-[60px] md:flex-[0.6] shrink-0 break-words text-left ${row?.is_buy === 0 ? 'text-[#FF5160]' : 'text-[#2ED075]'}`}>
										{
											row?.is_buy === 0 ? t('Game.sell') : t('Game.buy')
										}
									</div>
									<div className="w-[100px] md:flex-[1] shrink-0 text-[#fff] break-words text-right flex items-center justify-end gap-[4px]">
										<MyAvatar src="/images/origin.png" alt="icon" className="w-[14px] h-[14px] bg-[transparent]" />
										{BigNumber(ethers.formatUnits(BigInt(row?.is_buy === 0 ? row?.amount_out : row?.amount_in || '0'), 8)).dp(6, BigNumber.ROUND_DOWN).toFixed()}
									</div>
									<div className="w-[100px] flex-[1] shrink-0 flex items-center justify-end gap-[4px] min-w-0">
										<MyAvatar src={coinInfo?.image_url} alt="icon" className="w-[14px] h-[14px] bg-[transparent]" />
										{BigNumber(ethers.formatUnits(BigInt(row?.is_buy === 0 ? row?.amount_in : row?.amount_out || '0'), 8)).dp(6, BigNumber.ROUND_DOWN).toFixed()}
									</div>
									<div className="w-[120px] flex-[1.2] shrink-0 text-[#fff] text-right text-[11px] leading-tight flex items-center justify-end gap-[4px] min-w-0">
										{row?.event_timestamp ? new Date(row?.event_timestamp * 1000).toLocaleString() : '-'}
									</div>
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
