import Marquee from "react-fast-marquee";
import MyAvatar from "@/components/avatar";

export default function TopScroll() {
	const colorSchemes = [
		{ bg: '#EC42FF33', text: '#EC42FF' },
		{ bg: '#FF536133', text: '#FF5361' },
		{ bg: '#FCC72933', text: '#FCC729' },
		{ bg: '#22DAFA33', text: '#22DAFA' },
		{ bg: '#1DEE7E33', text: '#1DEE7E' },
		{ bg: '#6655FF33', text: '#6655FF' },
	];

	const transactions = [
		{ id: 1, address: '0x1234...1234', type: '卖出', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 2, address: '0x1234...1234', type: '卖出', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 3, address: '0x1234...1234', type: '卖出', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 4, address: '0x1234...1234', type: '买入', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 5, address: '0x1234...1234', type: '买入', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 6, address: '0x1234...1234', type: '买入', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 7, address: '0x1234...1234', type: '卖出', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 8, address: '0x1234...1234', type: '卖出', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 9, address: '0x1234...1234', type: '买入', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 10, address: '0x1234...1234', type: '买入', amount: '0.18 BNB', token: 'Launchcoin' },
		{ id: 11, address: '0x1234...1234', type: '买入', amount: '0.18 BNB', token: 'Launchcoin' },
	];

	return (
		<div className="w-full bg-transparent">
			<Marquee
				speed={50}           // 速度（数值越大越快）
				gradient={true}      // 开启左右渐变遮罩，视觉更高级
				gradientColor="black" // 渐变颜色（根据背景调整）
				gradientWidth={50}   // 渐变宽度
				pauseOnHover={true}  // 鼠标悬停暂停
			>
				{transactions.map((tx, index) => {
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
							<span className="underline cursor-pointer">{tx.address}</span>
							<span className="">{tx.type} {tx.amount}</span>
							<MyAvatar src={"/images/common/default.png"} alt="avatar" className="w-[14px] h-[14px]" />
							<span className="underline cursor-pointer">{tx.token}</span>
						</div>
					);
				})}
			</Marquee>
		</div>
	);
}