import { Navbar as HeroUINavbar, NavbarContent, Button, useDisclosure, Drawer, DrawerContent, DrawerHeader, DrawerBody, Divider } from "@heroui/react";
import NextLink from "next/link";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';

import { LogoIcon, TextIcon, MenuIcon, LangIcon, HeaderXIcon, HeaderTgIcon, SearchInputIcon, WalletIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";


export const NavbarNew = () => {
	const { t, i18n } = useTranslation();
	const [lang, setLang] = useState('zh');

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


	const handleLangSwitch = () => {
		const newLang = lang === 'en' ? 'zh' : 'en';
		i18n.changeLanguage(newLang);
	};

	return (
		<>
			<HeroUINavbar maxWidth="full" position="static" className="fixed top-0 left-0 right-0 z-50 bg-[#0D0F13] border-b-[1px] border-[#25262A]" classNames={{ wrapper: "gap-[6px] px-[14px] md:px-[24px] h-[56px] md:h-[64px]" }}>
				<NextLink className="flex justify-start items-center gap-[6px] logo-container" href="/preheat">
					<LogoIcon className="w-[24px] h-[24px]" />
					<TextIcon />
				</NextLink>
				<div className="flex flex-1"></div>
				<NavbarContent justify="end" className="gap-[8px]">
					<HeaderXIcon
						className="cursor-pointer hover:opacity-80 transition-opacity block"
						onClick={() => window.open(siteConfig.links.tg, "_blank", "noopener,noreferrer")}
					/>
					<HeaderTgIcon
						className="cursor-pointer hover:opacity-80 transition-opacity block"
						onClick={() => window.open(siteConfig.links.x, "_blank", "noopener,noreferrer")}
					/>
					<LangIcon
						lang={lang as 'zh' | 'en'}
						className="cursor-pointer hover:opacity-80 transition-opacity block"
						onClick={handleLangSwitch}
					/>
				</NavbarContent>
			</HeroUINavbar>
		</>
	);
};
