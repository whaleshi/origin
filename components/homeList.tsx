import { useState } from 'react';
import { SearchIcon } from './icons';
import TokenItem from './tokenItem';
import router from 'next/router';


export default function HomeList() {
	const [activeTab, setActiveTab] = useState('新创建');

	const tabs = ['新创建', '已发射', '矿池'];

	return <div>
		<div className='block md:hidden'>
			<div className="h-[52px] px-[14px] flex items-center justify-between">
				<div className="text-[16px] flex gap-[12px]">
					{tabs.map((tab) => (
						<div
							key={tab}
							className={`cursor-pointer ${activeTab === tab ? 'text-white' : 'text-[#868789]'
								}`}
							onClick={() => setActiveTab(tab)}
						>
							{tab}
						</div>
					))}
				</div>
				<div className='h-[28px] bg-[#191B1F] rounded-full text-[13px] text-[#5A575E] flex items-center gap-[4px] px-[12px]' onClick={() => { router.push("/search"); }}><SearchIcon />搜索</div>
			</div>
			<div className='w-full px-[14px]'>
				{
					Array.from({ length: 9 }).map((_, index) => (
						<div key={index} className='mt-[8px]'>
							<TokenItem type={index % 3 + 1} />
						</div>
					))
				}
			</div>
		</div>
		<div className='hidden md:flex gap-[12px] px-[24px] h-[calc(100vh-330px-64px)]'>
			<div className='flex-1 h-[100%]'>
				<div className='h-[50px] text-[16px] text-[#fff] font-bold flex items-center'>{tabs[0]}</div>
				<div className='h-[calc(100vh-330px-64px-50px)] overflow-y-auto bg-[rgba(13,15,19,0.35)] border-[1px] border-[#25262A] rounded-[8px] flex flex-col items-center justify-center'>
					<img src="/images/nothing.png" className="w-[80px] h-[80px]" />
					<div className="text-[#868789] text-[14px]">暂无数据</div>
				</div>
			</div>
			<div className='flex-1 h-[100%]'>
				<div className='h-[50px] text-[16px] text-[#fff] font-bold flex items-center'>{tabs[1]}</div>
				<div className='h-[calc(100vh-330px-64px-50px)] overflow-y-auto'>
					{
						Array.from({ length: 19 }).map((_, index) => (
							<div key={index} className='mb-[8px]'>
								<TokenItem type={2} />
							</div>
						))
					}
				</div>
			</div>
			<div className='flex-1 h-[100%]'>
				<div className='h-[50px] text-[16px] text-[#fff] font-bold flex items-center'>{tabs[2]}</div>
				<div className='h-[calc(100vh-330px-64px-50px)] overflow-y-auto'>
					{
						Array.from({ length: 19 }).map((_, index) => (
							<div key={index} className='mb-[8px]'>
								<TokenItem type={3} />
							</div>
						))
					}
				</div>
			</div>
		</div>
	</div>;
}