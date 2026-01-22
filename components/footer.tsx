import { useRouter } from "next/router";
import { useTranslation } from 'react-i18next';
import { FooterIcon1, FooterIcon2, SwapIcon } from "./icons";
import { usePrivy } from "@privy-io/react-auth";
import usePrivyLogin from "@/hooks/usePrivyLogin";
import { useAuthStore } from "@/stores/auth";

interface FooterItem {
	id: string;
	label: string;
	icon: React.ReactNode;
	path: string;
}



export default function Footer() {
	const router = useRouter();
	const { t } = useTranslation();
	const { authenticated, logout } = usePrivy();
	const { toLogin } = usePrivyLogin();
	const { isLoggedIn, address, clearAuthState } = useAuthStore();

	const handleNavigation = (item: FooterItem) => {
		if (item.id === "me" && !address) {
			newLogin();
			return;
		}
		router.push(item.path);
	};

	const footerItems: FooterItem[] = [
		{
			id: "origin",
			label: '起源',
			icon: (<FooterIcon1 />),
			path: "/"
		},
		{
			id: "swap",
			label: 'swap',
			icon: (<div className="w-[20px] h-[20px]"></div>),
			path: "/swap"
		},
		{
			id: "me",
			label: '我的',
			icon: (<FooterIcon2 />),
			path: "/me"
		},
	];

	const newLogin = async () => {
		if (authenticated) {
			clearAuthState();
			await logout();
		}
		toLogin();
	}

	return (
		<footer className="fixed bottom-0 left-0 right-0 bg-[#1A1C20] border-t border-[#25262A] z-50 md:hidden">
			<div className="flex items-center justify-around h-[52px]">
				{footerItems.map((item) => {
					const isActive = item.id === "swap"
						? router.asPath.startsWith("/swap")
						: router.pathname === item.path;
					return (
						<div
							key={item.id}
							onClick={() => handleNavigation(item)}
							className="flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 min-w-0 flex-1 relative"
						>
							{item.id === 'swap' && (
								<SwapIcon
									className={`absolute inset-0 m-auto bottom-[38px] transition-transform duration-200 ${isActive ? "rotate-90" : "rotate-0"}`}
								/>
							)}
							<div className={`mb-1 transition-colors duration-200 ${isActive ? 'text-[#FFF]' : 'text-[#606164]'}`}>
								{item.icon}
							</div>
							<span className={`text-[12px] font-medium transition-colors duration-200 ${isActive ? 'text-[#FFF]' : 'text-[#606164]'}`}>
								{item.label}
							</span>
						</div>
					);
				})}
			</div>
		</footer>
	);
}
