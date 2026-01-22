import React, { useEffect, useState } from "react";
import NextHead from "next/head";
import { useRouter } from "next/router";
import { siteConfig } from "@/config/site";
import { getCoinShow } from "@/service/api";
import { useTranslation } from "react-i18next";

type TokenHeadProps = {
	fallbackTitle?: string;
	fallbackDescription?: string;
	fallbackImage?: string;
	serverMetadata?: {
		name?: string;
		symbol?: string;
		image?: string;
		is_refine?: number;
	};
};

export const TokenHead = ({
	fallbackTitle = siteConfig.name,
	fallbackDescription = siteConfig.description,
	fallbackImage = siteConfig.img,
	serverMetadata,
}: TokenHeadProps) => {
	const router = useRouter();
	const { addr } = router.query;
	const [metadata, setMetadata] = useState(serverMetadata ?? null);
	const { i18n } = useTranslation();
	const lang = i18n?.language ?? "zh";

	useEffect(() => {
		if (serverMetadata) {
			setMetadata(serverMetadata);
			return;
		}
		if (!addr || typeof addr !== "string") return;

		const fetchMetadata = async () => {
			try {
				const res = await getCoinShow({ mint: addr });
				const data = res?.data ?? null;
				if (data) {
					setMetadata({
						name: data?.name,
						symbol: data?.symbol,
						image: data?.image_url,
						is_refine: data?.is_refine,
					});
				}
			} catch {
				setMetadata(null);
			}
		};

		fetchMetadata();
	}, [addr, serverMetadata]);

	const title = metadata?.name
		? `${metadata.name} (${metadata.symbol ?? "--"}) - ${siteConfig.name}`
		: fallbackTitle;
	const description = fallbackDescription;
	const ogImageUrl = metadata?.name && metadata?.symbol && metadata?.image
		? `${siteConfig.url}api/og?name=${encodeURIComponent(metadata.name)}&symbol=${encodeURIComponent(metadata.symbol)}&imgUrl=${encodeURIComponent(metadata.image)}&is_refine=${metadata?.is_refine ?? 0}&lang=${encodeURIComponent(lang)}`
		: fallbackImage;
	const url = typeof addr === "string"
		? `${siteConfig.url}token/${addr}`
		: siteConfig.url;

	return (
		<NextHead>
			<title>{title}</title>
			<meta key="title" content={title} property="og:title" />
			<meta content={description} name="description" />
			<meta
				key="viewport"
				content="viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
				name="viewport"
			/>
			<link href="/favicon.ico" rel="icon" />
			<meta property="og:type" content="website" />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={ogImageUrl} />
			<meta property="og:url" content={url} />
			<meta property="og:site_name" content={siteConfig.name} />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={ogImageUrl} />
			<meta name="twitter:site" content={siteConfig.user} />
			<meta name="twitter:creator" content={siteConfig.user} />
		</NextHead>
	);
};
