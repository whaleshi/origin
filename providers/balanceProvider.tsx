'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAuthStore } from "@/stores/auth";
import { ethers } from "ethers";
import { getPrice, getOriginInfo } from '@/service/api';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_CHAIN_CONFIG } from "@/config/chains";

interface BalanceContextType {
	balance: number;
	price: number;
	bnbPrice: number;
	originInnerPrice: number;
	originOuterPrice: number;
	symbol: string;
	originInfoData: any;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
	const { ready, authenticated, user } = usePrivy()
	const { wallets } = useWallets();
	const { isLoggedIn, address } = useAuthStore();
	const [balance, setBalance] = useState<any>(0);
	const [price, setPrice] = useState<any>(0);
	const [bnbPrice, setBnbPrice] = useState<any>(0);
	const [originInnerPrice, setOriginInnerPrice] = useState<any>(0);
	const [originOuterPrice, setOriginOuterPrice] = useState<any>(0);
	const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

	// 使用自定义认证状态的地址，并找到对应的钱包对象用于获取 provider
	const wallet = address ? wallets.find(w => w.address?.toLowerCase() === address.toLowerCase()) : null;
	const currentAddress = address;
	const isConnected = ready && isLoggedIn && !!currentAddress;

	// 初始化 provider
	useEffect(() => {
		const initializeProvider = async () => {
			if (wallet) {
				try {
					const ethereumProvider = await wallet.getEthereumProvider();
					const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
					setProvider(ethersProvider);
				} catch (error) {
					console.error('Failed to initialize provider:', error);
				}
			}
		};

		if (isConnected && wallet) {
			initializeProvider();
		}
	}, [wallet, isConnected]);

	// 获取余额
	useEffect(() => {
		const fetchBalance = async () => {
			if (!provider || !currentAddress) {
				setBalance(0);
				return;
			}

			try {
				const ethBalance = await provider.getBalance(currentAddress);
				// console.log(ethBalance)
				const formatted = ethers.formatEther(ethBalance);
				setBalance(formatted);
			} catch (error) {
				console.error('Failed to fetch balance:', error);
				setBalance(0);
			}
		};

		if (provider && currentAddress) {
			fetchBalance();
			// 每 10 秒更新一次余额
			const interval = setInterval(fetchBalance, 10000);
			return () => clearInterval(interval);
		} else {
			setBalance(0);
		}
	}, [provider, currentAddress]);

	// 获取价格，每10秒刷新一次
	const { data: priceData } = useQuery({
		queryKey: ['price'],
		queryFn: () => getPrice({}),
		refetchInterval: 10000, // 10秒
		refetchOnWindowFocus: false,
	});

	// 获取 Origin 信息
	const { data: originInfoData } = useQuery({
		queryKey: ['originInfo', currentAddress],
		queryFn: async () => {
			const result = await getOriginInfo({
				user_addr: currentAddress,
			});
			return result?.data;
		},
		refetchInterval: 5000,
		refetchIntervalInBackground: true,
		staleTime: 3000,
	});

	// 更新价格
	useEffect(() => {
		if (priceData?.data && Array.isArray(priceData.data)) {
			// 获取ORI价格
			const oriPriceItem = priceData.data.find((item: { aux_contract_addr: string; }) => item.aux_contract_addr.toLocaleLowerCase() === DEFAULT_CHAIN_CONFIG.ori.toLocaleLowerCase());
			setPrice(oriPriceItem?.price || 0);

			// 获取BNB价格
			const bnbPriceItem = priceData.data.find((item: { aux_contract_addr: string; }) => item.aux_contract_addr.toLocaleLowerCase() === DEFAULT_CHAIN_CONFIG.bnb.toLocaleLowerCase());
			setBnbPrice(bnbPriceItem?.price || 0);

			// 获取Origin内盘价格 (is_inner = 1)
			const originInnerPriceItem = priceData.data.find((item: { aux_contract_addr: string; is_inner: number; }) =>
				item.aux_contract_addr.toLocaleLowerCase() === DEFAULT_CHAIN_CONFIG.origin.toLocaleLowerCase() && item.is_inner === 1
			);
			setOriginInnerPrice(originInnerPriceItem?.price || 0);

			// 获取Origin外盘价格 (is_inner = 0)
			const originOuterPriceItem = priceData.data.find((item: { aux_contract_addr: string; is_inner: number; }) =>
				item.aux_contract_addr.toLocaleLowerCase() === DEFAULT_CHAIN_CONFIG.origin.toLocaleLowerCase() && item.is_inner === 0
			);
			setOriginOuterPrice(originOuterPriceItem?.price || 0);
		}
	}, [priceData]);

	return (
		<BalanceContext.Provider
			value={{
				balance,
				price,
				bnbPrice,
				originInnerPrice,
				originOuterPrice,
				symbol: 'BNB',
				originInfoData,
			}}
		>
			{children}
		</BalanceContext.Provider>
	);
}

export function useBalanceContext() {
	const ctx = useContext(BalanceContext);
	if (!ctx) throw new Error("useBalanceContext must be used within BalanceProvider");
	return ctx;
}
