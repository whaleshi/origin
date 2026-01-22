'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAuthStore } from "@/stores/auth";
import { ethers } from "ethers";
import { getPrice } from '@/service/api';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_CHAIN_CONFIG } from "@/config/chains";

interface BalanceContextType {
	balance: number;
	bnbPrice: number;
	symbol: string;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
	const { ready, authenticated, user } = usePrivy()
	const { wallets } = useWallets();
	const { isLoggedIn, address } = useAuthStore();
	const [balance, setBalance] = useState<any>(0);
	const [bnbPrice, setBnbPrice] = useState<any>(0);
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
	const { data: balanceData } = useQuery({
		queryKey: ['balance', currentAddress],
		queryFn: async () => {
			if (!provider || !currentAddress) return "0";
			const ethBalance = await provider.getBalance(currentAddress);
			return ethers.formatEther(ethBalance);
		},
		enabled: !!provider && !!currentAddress,
		refetchInterval: 10000,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (!provider || !currentAddress) {
			setBalance(0);
			return;
		}
		setBalance(balanceData ?? 0);
	}, [balanceData, provider, currentAddress]);

	// 获取价格，每10秒刷新一次
	const { data: priceData } = useQuery({
		queryKey: ['price'],
		queryFn: () => getPrice({}),
		refetchInterval: 10000, // 10秒
		refetchOnWindowFocus: false,
	});

	// 更新价格
	useEffect(() => {
		if (priceData?.data && Array.isArray(priceData.data)) {
			// 获取BNB价格
			const bnbPriceItem = priceData.data.find((item: { aux_contract_addr: string; }) => item.aux_contract_addr.toLocaleLowerCase() === DEFAULT_CHAIN_CONFIG.bnb.toLocaleLowerCase());
			setBnbPrice(bnbPriceItem?.price || 0);
		}
	}, [priceData]);

	return (
		<BalanceContext.Provider
			value={{
				balance,
				bnbPrice,
				symbol: 'BNB',
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
