import { Navbar as HeroUINavbar, NavbarContent, Button, useDisclosure, Drawer, DrawerContent, DrawerHeader, DrawerBody, Divider } from "@heroui/react";
import NextLink from "next/link";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/router"
import { Image, Input } from "@heroui/react"
import { usePrivy } from "@privy-io/react-auth";
import usePrivyLogin from "@/hooks/usePrivyLogin";
import { useAuthStore } from "@/stores/auth";
import { shortenAddress, useIsMobile } from "@/utils";
import { useTranslation } from 'react-i18next';
import { useBalanceContext } from "@/providers/balanceProvider";
import { useQuery } from "@tanstack/react-query";
import { getCoinList } from "@/service/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { LogoIcon, TextIcon, MenuIcon, LangIcon, HeaderXIcon, HeaderTgIcon, SearchInputIcon, WalletIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { DEFAULT_CHAIN_CONFIG } from "@/config/chains";
import CreateDialog from "./createDialog";
import TokenItem, { TokenItemSkeleton } from "./tokenItem";
import { WalletBox } from "./wallet";
import MeList from "./meList";


export const Navbar = () => {
	const router = useRouter();
	const { t, i18n } = useTranslation();
	const { isOpen: isMobileMenuOpen, onOpen: onMobileMenuOpen, onOpenChange: onMobileMenuOpenChange } = useDisclosure();
	const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
	const [lang, setLang] = useState('zh');
	const [isAccessOpen, setIsAccessOpen] = useState(false);
	const [accessTab, setAccessTab] = useState<'deposit' | 'withdraw'>('deposit');
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [inputVal, setInputVal] = useState("");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);

	const searchKeyword = inputVal.trim();
	const debouncedKeyword = useDebouncedValue(searchKeyword, 300);
	const { data: searchData, isFetching: isSearching } = useQuery({
		queryKey: ["searchTokens", debouncedKeyword],
		queryFn: async () => {
			const result = await getCoinList({ keyword: debouncedKeyword, page: 1, page_size: 100 });
			return result?.data;
		},
		enabled: !!debouncedKeyword,
	});
	const isSearchPending = !!searchKeyword && debouncedKeyword !== searchKeyword;
	const searchResults = useMemo(() => {
		if (Array.isArray((searchData as { list?: unknown[] } | null | undefined)?.list)) {
			return (searchData as { list?: any[] }).list ?? [];
		}
		if (Array.isArray(searchData)) return searchData;
		return [];
	}, [searchData]);

	// 跳转到代币详情页
	const handleTokenClick = () => {
		window.open(`https://web3.binance.com/token/bsc/${DEFAULT_CHAIN_CONFIG}`, '_blank');
	};
	const walletRef = useRef<HTMLDivElement>(null);

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
			// 关闭移动端菜单
			if (isMobileMenuOpen) {
				onMobileMenuOpenChange();
			}
			// 关闭钱包下拉菜单
			setIsWalletDropdownOpen(false);
			setIsSearchOpen(false);
		};

		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events, isMobileMenuOpen, onMobileMenuOpenChange]);

	// 监听登录状态变化，重置下拉菜单状态
	useEffect(() => {
		setIsWalletDropdownOpen(false);
	}, [isLoggedIn]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setIsSearchOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);


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
			router.push("/me");
		} else {
			setIsWalletDropdownOpen(!isWalletDropdownOpen);
		}
	};

	const handleLangSwitch = () => {
		const newLang = lang === 'en' ? 'zh' : 'en';
		i18n.changeLanguage(newLang);
	};

	const openAccessModal = (tab: 'deposit' | 'withdraw') => {
		setAccessTab(tab);
		setIsAccessOpen(true);
		setIsWalletDropdownOpen(false);
	};

	const openAccessModalFromDrawer = (tab: 'deposit' | 'withdraw') => {
		setAccessTab(tab);
		setIsAccessOpen(true);
	};

	const toCreate = () => {
		if (!isLoggedIn) {
			newLogin();
			return;
		}
		if (isMobile) {
			router.push("/create");
		} else {
			setIsCreateDialogOpen(true)
		}
	};

	return (
		<>
			<HeroUINavbar maxWidth="full" position="static" className="fixed top-0 left-0 right-0 z-50 bg-[#0D0F13] border-b-[1px] border-[#25262A]" classNames={{ wrapper: "gap-[6px] px-[14px] md:px-[24px] h-[56px] md:h-[64px]" }}>
				<NextLink className="flex justify-start items-center gap-[6px] logo-container" href="/">
					<LogoIcon className="w-[24px] h-[24px]" />
					<TextIcon />
				</NextLink>
				<div className="text-[16px] hidden md:flex items-center gap-[16px] pl-[24px] font-semibold whitespace-nowrap">
					{[
						{ href: '/', label: t("Navbar.home"), isExternal: false },
						{ href: '/swap', label: t("Swap.title"), isExternal: false },
						{ href: 'https://www.baidu.com', label: t("Navbar.mechanism"), isExternal: true },
					].map(({ href, label, isExternal }) => (
						isExternal ? (
							<div
								key={href}
								className="hover:opacity-80 transition-opacity text-[#868789] cursor-pointer"
								onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
							>
								{label}
							</div>
						) : (
							<NextLink
								key={href}
								href={href}
								className={`hover:opacity-80 transition-opacity ${href === "/swap"
									? (router.asPath.startsWith("/swap") ? "text-[#fff]" : "text-[#868789]")
									: (router.pathname === href ? "text-[#fff]" : "text-[#868789]")}`}
							>
								{label}
							</NextLink>
						)
					))}
				</div>
				<div className="hidden md:flex flex-1"></div>
				<NavbarContent justify="end" className="gap-[8px]">
					<div className="hidden md:flex justify-end relative" ref={searchRef}>
						<Input
							classNames={{
								inputWrapper: "w-full  w-[400px] h-[36px] !border-[#191B1F] bg-[#191B1F] !border-[1.5px] rounded-[8px] hover:!border-[#191B1F] focus-within:!border-[#191B1F]",
								input: "text-[13px] text-[#FFF] font-semibold placeholder:text-[#5B5B5B] uppercase tracking-[-0.07px]",
							}}
							placeholder={t("Navbar.searchPlaceholder")}
							variant="bordered"
							value={inputVal}
							isDisabled={false}
							onChange={(e) => { setInputVal(e.target.value); setIsSearchOpen(true); }}
							onFocus={() => setIsSearchOpen(true)}
							onKeyDown={(e) => {
								if (e.key === "Escape") {
									setIsSearchOpen(false);
								}
							}}
							startContent={<SearchInputIcon />}
						/>
						{isSearchOpen && inputVal.trim() && (
							<div className="absolute right-0 top-full mt-[8px] w-[400px] bg-[#0D0F13] border border-[#25262A] rounded-[12px] overflow-hidden z-50 p-[14px]"
								style={{ boxShadow: "0 4px 16px 0 rgba(48, 49, 53, 0.65)" }}
							>
								{isSearching || isSearchPending ? (
									<div className="flex flex-col gap-[8px]">
										{Array.from({ length: 10 }).map((_, index) => (
											<TokenItemSkeleton key={index} />
										))}
									</div>
								) : searchResults.length > 0 ? (
									<div className="max-h-[400px] overflow-y-auto">
										{
											searchResults.map((item, index) => (
												<div key={item?.id ?? item?.coin_id ?? item?.address ?? index} className='mt-[8px]'>
													<TokenItem
														data={item}
														onClick={(clicked) => {
															setIsSearchOpen(false);
															setInputVal("");
															router.push(`/token/${clicked?.mint ?? clicked?.address ?? clicked?.coin_id ?? clicked?.id}`);
														}}
													/>
												</div>
											))
										}
									</div>
								) : (
									<div className="flex items-center justify-center flex-col py-[24px]">
										<img src="/images/nothing.png" className="w-[80px] h-[80px]" />
										<div className="text-[#868789] text-[14px]">{t("Common.noData")}</div>
									</div>
								)}
							</div>
						)}
					</div>
					<Button className="h-[32px] md:h-[36px] bg-[transparent] px-[12px] text-[13px] text-[#FD7438] rounded-[8px] border-[1px] border-[#FD7438] gap-[4px] min-h-[32px]" variant="flat" onPress={toCreate}>
						{t("Navbar.createToken")}
					</Button>
					{
						isLoggedIn ? (
							<div className="relative" ref={walletRef}>
								<Button className="h-[32px] md:h-[36px] bg-[#191B1F] px-[12px] text-[13px] text-[#fff] rounded-[8px] gap-[4px] min-h-[32px]" variant="flat" onPress={handleWalletClick}>
									<WalletIcon />
									{shortenAddress(address!)}
								</Button>
								{isWalletDropdownOpen && (
									<div className="absolute top-full right-0 mt-[8px] w-[400px] bg-[#0D0F13] border border-[#303135] rounded-[12px] p-[16px] px-[14px] z-50"
										style={{ boxShadow: "0 4px 16px 0 rgba(48, 49, 53, 0.65)" }}
									>
										<div className="text-[28px] text-[#fff] font-bold mb-[16px]">{t("Wallet.assets")}</div>
										<WalletBox />
										<div className="mt-[16px] max-h-[50vh] overflow-y-auto"><MeList /></div>
									</div>
								)}
							</div>
						) : <Button className="h-[32px] md:h-[36px] bg-[#FFF] px-[12px] text-[13px] text-[#0D0F13] rounded-[8px] border-[1px] border-[#FFF] gap-[4px] min-h-[32px]" variant="flat" onPress={newLogin}>
							{t("Navbar.connectWallet")}
						</Button>
					}
					<HeaderXIcon className="cursor-pointer hover:opacity-80 transition-opacity hidden md:block" />
					<HeaderTgIcon className="cursor-pointer hover:opacity-80 transition-opacity hidden md:block" />
					<LangIcon
						lang={lang as 'zh' | 'en'}
						className="cursor-pointer hover:opacity-80 transition-opacity hidden md:block"
						onClick={handleLangSwitch}
					/>
					<MenuIcon className="cursor-pointer hover:opacity-80 transition-opacity block md:hidden" onClick={onMobileMenuOpen} />
				</NavbarContent>
			</HeroUINavbar>
			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 z-50 block md:hidden"
					onClick={() => onMobileMenuOpenChange()}
				>
					<div
						className="absolute top-[50px] right-[10px] w-[200px] bg-[#191B1F] rounded-[8px] px-[16px] border border-[#25262A] shadow-lg"
						style={{ backdropFilter: 'blur(6px)' }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex flex-col">
							<div className="flex items-center justify-between h-[48px]">
								<span className="text-[14px] text-[#fff] font-medium">{t("Navbar.language")}</span>
								<LangIcon
									lang={lang as 'zh' | 'en'}
									className="cursor-pointer hover:opacity-80 transition-opacity"
									onClick={handleLangSwitch}
								/>
							</div>
							<Divider className="bg-[#0D0F13]" />
							<div className="flex items-center justify-between h-[48px]">
								<div className="text-[14px] text-[#fff] font-medium">{t("Navbar.joinCommunity")}</div>
								<div className="flex items-center gap-[12px]">
									<Image src="/images/x.png" alt="x" className="w-[24px] h-[24px]" disableSkeleton disableAnimation radius="none" onClick={() => { window.open(siteConfig.links.x, '_blank'); }} />
									<Image src="/images/tg.png" alt="tg" className="w-[24px] h-[24px]" disableSkeleton disableAnimation radius="none" onClick={() => { window.open(siteConfig.links.tg, '_blank'); }} />
								</div>
							</div>
							<Divider className="bg-[#0D0F13]" />
							<div
								className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity  h-[48px]"
							>
								<span className="text-[14px] text-[#fff] font-medium">{t("Navbar.mechanism")}</span>
							</div>
						</div>
					</div>
				</div>
			)}
			<CreateDialog isOpen={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
		</>
	);
};
