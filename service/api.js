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






export const getRoundInfo = (params) => post(getApiBaseUrl() + "/ori/round", params);

export const getEventInfo = (params) => post(getApiBaseUrl() + "/ori/latest/events", params);

export const getRoundWinInfo = (params) => post(getApiBaseUrl() + "/ori/round_winners/round", params);

export const getAutomation = (params) => post(getApiBaseUrl() + "/ori/automation/user", params);

export const getExploreInfo = (params) => post(getApiBaseUrl() + "/ori/explore", params);

export const resetEventList = (params) => post(getApiBaseUrl() + "/ori/reset_event/list", params);

export const getPointsList = (params) => post(getApiBaseUrl() + "/ori/points/list", params);

export const getUserPoints = (params) => post(getApiBaseUrl() + "/ori/points/user", params);

export const getSummary = (params) => post(getApiBaseUrl() + "/ori/summary", params);



export const buryEventList = (params) => post(getApiBaseUrl() + "/ori/bury_event/list", params);

export const userAssetEvents = (params) => post(getApiBaseUrl() + "/ori/activity/user_asset_events", params);

export const getOriginInfo = (params) => post(getApiBaseUrl() + "/ori/activity/origin_info", params);

export const buryPointEvents = (params) => post(getApiBaseUrl() + "/ori/activity/bury_point_events", params);

export const getSwapPrice = (params) => post(getApiBaseUrl() + "/ori/swap/price", params);

export const getSwapQuote = (params) => post(getApiBaseUrl() + "/ori/swap/quote", params);

export const getSwapNonce = (params) => post(getApiBaseUrl() + "/ori/swap/nonce", params);

export const submitSwap = (params) => post(getApiBaseUrl() + "/ori/swap/submit", params);

export const getMiningGameInfo = (params) => post(getApiBaseUrl() + "/ori/mining_game/info", params);

export const getMiningGameRecords = (params) => post(getApiBaseUrl() + "/ori/mining_game/record_list", params);

export const getMiningGameSwapRecords = (params) => post(getApiBaseUrl() + "/ori/mining_game/swap_record", params);

export const getOriGameInfo = (params) => post(getApiBaseUrl() + "/ori/ori_game/info", params);

export const getOriGameRecords = (params) => post(getApiBaseUrl() + "/ori/ori_game/record_list", params);

export const getOriGameSwapRecords = (params) => post(getApiBaseUrl() + "/ori/ori_game/swap_record", params);

export const getOriGameTradeRecords = (params) => post(getApiBaseUrl() + "/ori/ori_game/trade_records", params);

export const getOriGameStats = (params) => post(getApiBaseUrl() + "/ori/ori_game/stats", params);