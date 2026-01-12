import { Navbar as HeroUINavbar, NavbarContent, Button, useDisclosure, Drawer, DrawerContent, DrawerHeader, DrawerBody, Divider } from "@heroui/react";
import NextLink from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router"
import { Image, Input } from "@heroui/react"
import { usePrivy } from "@privy-io/react-auth";
import usePrivyLogin from "@/hooks/usePrivyLogin";
import { useAuthStore } from "@/stores/auth";
import { shortenAddress, useIsMobile } from "@/utils";
import { useTranslation } from 'react-i18next';
import { useBalanceContext } from "@/providers/balanceProvider";

import { LogoIcon, TextIcon, MenuIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { DEFAULT_CHAIN_CONFIG } from "@/config/chains";
import { formatBigNumber } from '@/utils/formatBigNumber';


export const Navbar = () => {
	const router = useRouter();
	const { t, i18n } = useTranslation();
	const { isOpen: isWalletDrawerOpen, onOpen: onWalletDrawerOpen, onOpenChange: onWalletDrawerOpenChange } = useDisclosure();
	const { isOpen: isMobileMenuOpen, onOpen: onMobileMenuOpen, onOpenChange: onMobileMenuOpenChange } = useDisclosure();
	const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
	const [lang, setLang] = useState('zh');
	const [isAccessOpen, setIsAccessOpen] = useState(false);
	const [accessTab, setAccessTab] = useState<'deposit' | 'withdraw'>('deposit');

	// 跳转到代币详情页
	const handleTokenClick = () => {
		window.open(`https://web3.binance.com/token/bsc/${DEFAULT_CHAIN_CONFIG.ori}`, '_blank');
	};
	const walletRef = useRef<HTMLDivElement>(null);
	const { price } = useBalanceContext();

	const { authenticated, logout } = usePrivy();
	const { toLogin } = usePrivyLogin();
	const { isLoggedIn, address, clearAuthState } = useAuthStore();
	const isMobile = useIsMobile();

	// 语言切换效果
	useEffect(() => {
		if (typeof window !== "undefined") {
			const currentLang = i18n?.language || 'zh';
			const html = document.documentElement;
			html.lang = currentLang;
			html.classList.remove("lang-en", "lang-zh");
			html.classList.add(`lang-${currentLang}`);
			setLang(currentLang);
		}
	}, [i18n.language]);

	const newLogin = async () => {
		if (authenticated) {
			clearAuthState();
			await logout();
		}
		toLogin();
	}

	// 监听路由变化，关闭弹窗
	useEffect(() => {
		const handleRouteChange = () => {
			// 同时关闭钱包抽屉
			if (isWalletDrawerOpen) {
				onWalletDrawerOpenChange();
			}
			// 关闭移动端菜单
			if (isMobileMenuOpen) {
				onMobileMenuOpenChange();
			}
			// 关闭钱包下拉菜单
			setIsWalletDropdownOpen(false);
		};

		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events, isWalletDrawerOpen, onWalletDrawerOpenChange, isMobileMenuOpen, onMobileMenuOpenChange]);

	// 监听登录状态变化，重置下拉菜单状态
	useEffect(() => {
		setIsWalletDropdownOpen(false);
	}, [isLoggedIn]);


	// 处理点击外部关闭下拉框
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
				setIsWalletDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);


	const handleWalletClick = () => {
		// 使用hook检查屏幕尺寸，PC上打开下拉菜单，H5上打开抽屉
		if (isMobile) {
			onWalletDrawerOpen();
		} else {
			setIsWalletDropdownOpen(!isWalletDropdownOpen);
		}
	};

	const handleLangSwitch = () => {
		const newLang = lang === 'en' ? 'zh' : 'en';
		i18n.changeLanguage(newLang);
	};

	// 根据语言获取白皮书链接
	const getWhitepaperUrl = () => {
		return lang === 'en' ? 'https://whitepaper.ori.supply/en' : 'https://whitepaper.ori.supply';
	};

	const openAccessModal = (tab: 'deposit' | 'withdraw') => {
		setAccessTab(tab);
		setIsAccessOpen(true);
		setIsWalletDropdownOpen(false);
	};

	const openAccessModalFromDrawer = (tab: 'deposit' | 'withdraw') => {
		setAccessTab(tab);
		setIsAccessOpen(true);
		onWalletDrawerOpenChange();
	};

	return (
		<>
			<HeroUINavbar maxWidth="full" position="static" className="fixed top-0 left-0 right-0 z-50 bg-[#0D0F13] border-b-[1px] border-[#25262A]" classNames={{ wrapper: "gap-[6px] px-[14px] h-[56px] lg:h-[64px]" }}>
				<NextLink className="flex justify-start items-center gap-[6px] logo-container" href="/">
					<LogoIcon className="w-[24px] h-[24px]" />
					<TextIcon />
				</NextLink>

				<NavbarContent justify="end" className="gap-[8px]">
					<Button className="h-[32px] md:h-[36px] bg-[transparent] px-[12px] text-[13px] text-[#FD7438] rounded-[8px] border-[1px] border-[#FD7438] gap-[4px] min-h-[32px]" variant="flat" onPress={newLogin}>
						创建代币
					</Button>
					{
						isLoggedIn ? (
							<div className="relative" ref={walletRef}>
								<Button className="h-[32px] md:h-[36px] bg-[#191B1F] px-[12px] text-[13px] text-[#fff] rounded-[8px] gap-[4px] min-h-[32px]" variant="flat" onPress={handleWalletClick}>
									{shortenAddress(address!)}
								</Button>
								{isWalletDropdownOpen && (
									<div className="absolute top-full right-0 mt-[8px] w-[375px] bg-[#191B1F] border border-[#25262A] rounded-[12px] p-[16px] z-50">
										<div className="text-[16px] text-[#fff] font-semibold mb-[16px]">{t('Common.myWallet')}</div>
									</div>
								)}
							</div>
						) : <Button className="h-[32px] md:h-[36px] bg-[#FFF] px-[12px] text-[13px] text-[#0D0F13] rounded-[8px] border-[1px] border-[#FFF] gap-[4px] min-h-[32px]" variant="flat" onPress={newLogin}>
							连接钱包
						</Button>
					}
					<MenuIcon className="cursor-pointer" />
					{/* <LangIcon
						lang={lang as 'zh' | 'en'}
						className="cursor-pointer hover:opacity-80 transition-opacity hidden lg:block"
						onClick={handleLangSwitch}
					/>
					<MenuIcon className="cursor-pointer hover:opacity-80 transition-opacity block lg:hidden" onClick={onMobileMenuOpen} /> */}
				</NavbarContent>
			</HeroUINavbar>
			<Drawer isOpen={isWalletDrawerOpen} onOpenChange={onWalletDrawerOpenChange} placement="bottom" hideCloseButton classNames={{
				base: "max-h-[80vh]"
			}}>
				<DrawerContent>
					{(onClose) => (
						<>
							<DrawerHeader className="text-center relative p-0 pt-[8px]">
								<div className="h-[48px] flex items-center justify-center w-full text-[#fff]">{t('Common.myWallet')}</div>
							</DrawerHeader>
							<DrawerBody className="px-[16px] pb-[30px]">
							</DrawerBody>
						</>
					)}
				</DrawerContent>
			</Drawer>
			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 z-50 block lg:hidden"
					onClick={() => onMobileMenuOpenChange()}
				>
					<div
						className="absolute top-[50px] right-[10px] w-[200px] bg-[#191B1F] rounded-[8px] px-[16px] border border-[#25262A] shadow-lg"
						style={{ backdropFilter: 'blur(6px)' }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex flex-col">
							{/* Language Switcher */}
							<div className="flex items-center justify-between h-[48px]">
								<span className="text-[14px] text-[#fff] font-medium">{t('Common.language')}</span>
								{/* <LangIcon
									lang={lang as 'zh' | 'en'}
									className="cursor-pointer hover:opacity-80 transition-opacity"
									onClick={handleLangSwitch}
								/> */}
							</div>

							<Divider className="bg-[#0D0F13]" />

							{/* Whitepaper */}
							{/* <div
								className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity  h-[48px]"
								onClick={() => window.open(getWhitepaperUrl(), '_blank')}
							>
								<span className="text-[14px] text-[#fff] font-medium">{t('Common.book')}</span>
								<RightIcon />
							</div> */}

							<Divider className="bg-[#0D0F13]" />

							{/* Social Media */}
							<div className="flex items-center justify-between h-[48px]">
								<div className="text-[14px] text-[#fff] font-medium">{t('Common.followUs')}</div>
								<div className="flex items-center gap-[12px]">
									<Image src="/images/x.png" alt="x" className="w-[24px] h-[24px]" disableSkeleton disableAnimation radius="none" onClick={() => { window.open(siteConfig.links.x, '_blank'); }} />
									<Image src="/images/tg.png" alt="tg" className="w-[24px] h-[24px]" disableSkeleton disableAnimation radius="none" onClick={() => { window.open(siteConfig.links.tg, '_blank'); }} />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
