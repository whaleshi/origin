import { useMemo } from 'react';
import { SearchIcon } from './icons';
import TokenItem, { TokenItemSkeleton } from './tokenItem';
import router from 'next/router';
import { getCoinList } from '@/service/api';
import { useQueries } from '@tanstack/react-query';
import { useUserStore } from '@/stores/user';
import { useTranslation } from "react-i18next";


export default function HomeList() {
	const { t } = useTranslation();
	const tabs = useMemo(() => ([
		{ label: t("Home.tabNewCreated"), sortType: 1, itemType: 1 },
		{ label: t("Home.tabLaunched"), sortType: 3, itemType: 2 },
		{ label: t("Home.tabPool"), sortType: 4, itemType: 3 },
	]), [t]);
	const { homeListActive, setHomeListActive } = useUserStore();
	const safeActiveIndex = Math.min(Math.max(homeListActive, 0), tabs.length - 1);

	type CoinItem = any;

	const tabQueries = useQueries({
		queries: tabs.map((tab) => ({
			queryKey: ['coinList', tab.sortType],
			queryFn: async () => {
				const params = {
					page: 1,
					page_size: 50,
					user_addr: "",
					keyword: "",
					sort_type: tab.sortType
				};
				const result = await getCoinList(params);
				return result?.data;
			},
			refetchInterval: 3000, // 3秒一次
		})),
	});

	const normalizeList = (data: { list?: CoinItem[] } | CoinItem[] | null | undefined) => {
		if (Array.isArray((data as { list?: unknown[] } | null | undefined)?.list)) {
			return (data as { list?: CoinItem[] }).list ?? [];
		}
		if (Array.isArray(data)) return data;
		return [];
	};

	const activeData = tabQueries[safeActiveIndex]?.data;
	const activeItems = normalizeList(activeData);

	return <div>
		<div className='block md:hidden'>
			<div className="h-[52px] px-[14px] flex items-center justify-between">
				<div className="text-[16px] flex gap-[12px]">
					{tabs.map((tab, index) => (
						<div
							key={tab.label}
							className={`cursor-pointer ${safeActiveIndex === index ? 'text-white' : 'text-[#868789]'
								}`}
							onClick={() => setHomeListActive(index)}
						>
							{tab.label}
						</div>
					))}
				</div>
				<div className='h-[28px] bg-[#191B1F] rounded-full text-[13px] text-[#5A575E] flex items-center gap-[4px] px-[12px]' onClick={() => { router.push("/search"); }}><SearchIcon />{t("Home.search")}</div>
			</div>
			<div className='w-full px-[14px]'>
				{
					tabQueries[safeActiveIndex]?.isLoading ? (
						<div className="mt-[8px] flex flex-col gap-[8px]">
							{Array.from({ length: 10 }).map((_, index) => (
								<TokenItemSkeleton key={index} />
							))}
						</div>
					) : activeItems.length > 0 ? (
						activeItems.map((item, index) => (
							<div key={item?.id ?? item?.coin_id ?? item?.address ?? index} className='mt-[8px]'>
								<TokenItem
									data={item}
									onClick={(clicked) => router.push(`/token/${clicked?.mint}`)}
								/>
							</div>
						))
					) : (
						<div className='h-[calc(100vh-56px-200px-52px-52px-20px)] mt-[8px] bg-[rgba(13,15,19,0.35)] border-[1px] border-[#25262A] rounded-[8px] flex flex-col items-center justify-center'>
							<img src="/images/nothing.png" className="w-[80px] h-[80px]" />
							<div className="text-[#868789] text-[14px]">{t("Common.noData")}</div>
						</div>
					)
				}
			</div>
		</div>
		<div className='hidden md:flex gap-[12px] px-[24px] h-[calc(100vh-330px-64px)]'>
			{tabs.map((tab, index) => {
				const list = normalizeList(tabQueries[index]?.data);
				return (
					<div key={tab.label} className='flex-1 h-[100%]'>
						<div className='h-[50px] text-[16px] text-[#fff] font-bold flex items-center'>{tab.label}</div>
						<div className='h-[calc(100vh-330px-64px-50px)] overflow-y-auto'>
							{
								tabQueries[index]?.isLoading ? (
									<div className="flex flex-col gap-[8px]">
										{Array.from({ length: 10 }).map((_, skeletonIndex) => (
											<TokenItemSkeleton key={skeletonIndex} />
										))}
									</div>
								) : list.length > 0 ? (
									list.map((item, itemIndex) => (
										<div key={item?.id ?? item?.coin_id ?? item?.address ?? itemIndex} className='mb-[8px]'>
											<TokenItem
												data={item}
												onClick={(clicked) => router.push(`/token/${clicked?.mint}`)}
											/>
										</div>
									))
								) : (
									<div className='h-full bg-[rgba(13,15,19,0.35)] border-[1px] border-[#25262A] rounded-[8px] flex flex-col items-center justify-center'>
										<img src="/images/nothing.png" className="w-[80px] h-[80px]" />
										<div className="text-[#868789] text-[14px]">{t("Common.noData")}</div>
									</div>
								)
							}
						</div>
					</div>
				);
			})}
		</div>
	</div>;
}
