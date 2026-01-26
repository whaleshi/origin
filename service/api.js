import { getApiBaseUrl } from "./base";
import { post } from "./tool";

export const getCoinList = (params) => post(getApiBaseUrl() + "/originfun/coin_list", params);

export const getSwapList = (params) => post(getApiBaseUrl() + "/originfun/swap/list", params);

export const getLuckyToken = (params) => post(getApiBaseUrl() + "/originfun/lucky_token", params);

export const getCoinShow = (params) => post(getApiBaseUrl() + "/originfun/coin_show", params);

export const getGameInfo = (params) => post(getApiBaseUrl() + "/originfun/game/info", params);

export const getPrice = (params) => post(getApiBaseUrl() + "/originfun/query/chain_asset_config", params);

export const getHolderCoins = (params) => post(getApiBaseUrl() + "/originfun/holder/coins", params);

export const getMiningList = (params) => post(getApiBaseUrl() + "/originfun/mining/list", params);

export const getUserAsset = (params) => post(getApiBaseUrl() + "/originfun/game/user_asset", params);

export const getGameRecords = (params) => post(getApiBaseUrl() + "/originfun/game/record_list", params);

export const getKlines = (params) => post(getApiBaseUrl() + "/originfun/swap/klines", params);

export const getGameTradeRecords = (params) => post(getApiBaseUrl() + "/originfun/game/trade_records", params);

export const checkData = (params) => post(getApiBaseUrl() + "/originfun/check_data", params);
