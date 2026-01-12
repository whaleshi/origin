import _bignumber from "bignumber.js";
import { ethers } from "ethers";

const BigNumber = _bignumber;

/**
 * 格式化 Origin 数量
 * @param value - 需要格式化的值 (BigInt 或 string)
 * @param decimals - 小数位数，默认为8
 * @param roundingMode - 舍入模式，默认为向下舍入
 * @param precision - 精度，默认为0（整数）
 * @returns 格式化后的字符串
 */
export const formatOriginAmount = (
    value: string | number | bigint | undefined | null,
    decimals: number = 8,
    roundingMode: _bignumber.RoundingMode = BigNumber.ROUND_DOWN,
    precision: number = 2
): string => {
    if (!value) return "0";

    try {
        const formatted = BigNumber(ethers.formatUnits(BigInt(value), decimals)).dp(precision, roundingMode);

        if (formatted.gte(1)) {
            const num = formatted.toNumber();
            return num % 1 === 0
                ? num.toLocaleString()
                : num.toLocaleString(undefined, {
                      minimumFractionDigits: precision > 0 ? 2 : 0,
                      maximumFractionDigits: precision > 0 ? 2 : 0,
                  });
        }

        return formatted.toString();
    } catch (error) {
        console.error("Format origin amount error:", error);
        return "0";
    }
};

/**
 * 格式化 Origin 数量（保留6位小数）
 */
export const formatOriginAmountWithDecimals = (value: string | number | bigint | undefined | null): string => {
    return formatOriginAmount(value, 8, BigNumber.ROUND_DOWN, 6);
};
