import { useState } from 'react';
import { SearchIcon } from './icons';
import TokenItem from './tokenItem';


export default function MeList() {
	const [activeTab, setActiveTab] = useState('新创建');

	const tabs = ['新创建', '已发射', '矿池'];

	return <div>
		<div className=''>
			<div className="h-[52px] flex items-center justify-between">
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
			</div>
			<div className='w-full'>
				{
					Array.from({ length: 9 }).map((_, index) => (
						<div key={index} className='mb-[8px]'>
							<TokenItem type={index % 3 + 1} />
						</div>
					))
				}
			</div>
		</div>
	</div>;
}