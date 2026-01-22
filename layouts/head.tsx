import React from "react";
import NextHead from "next/head";
import { useRouter } from "next/router";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { TokenHead } from "@/layouts/tokenHead";

type HeadWebProps = {
	tokenMetadata?: {
		name?: string;
		symbol?: string;
		image?: string;
		is_refine?: number;
	};
};

export const HeadWeb = ({ tokenMetadata }: HeadWebProps) => {
	const router = useRouter();
	const { i18n } = useTranslation();
	const isEnglish = i18n?.language?.startsWith("en");
	const socialImage = isEnglish ? siteConfig.imgEn : siteConfig.img;
	if (router.pathname.startsWith('/token/')) {
		return <TokenHead serverMetadata={tokenMetadata} />;
	}
	return (
		<NextHead>
			<title>{siteConfig.name}</title>
			<meta key="title" content={siteConfig.name} property="og:title" />
			<meta content={siteConfig.description} name="description" />
			<meta
				key="viewport"
				content="viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
				name="viewport"
			/>
			<link href="/favicon.ico" rel="icon" />
			{
				!router.pathname.startsWith('/token/') && <>
					{/* Open Graph / Facebook */}
					<meta property="og:type" content="website" />
					<meta property="og:title" content={siteConfig.name} />
					<meta property="og:description" content={siteConfig.description} />
					<meta property="og:image" content={socialImage} />
					<meta property="og:url" content={siteConfig.url} />
					<meta property="og:site_name" content={siteConfig.name} />

					{/* Twitter */}
					<meta name="twitter:card" content="summary_large_image" />
					<meta name="twitter:title" content={siteConfig.name} />
					<meta name="twitter:description" content={siteConfig.description} />
					<meta name="twitter:image" content={socialImage} />
					<meta name="twitter:site" content={siteConfig.user} />
					<meta name="twitter:creator" content={siteConfig.user} />
				</>
			}

		</NextHead>
	);
};
