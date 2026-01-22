import BigNumber from "bignumber.js";

export const formatNumber = (num: any, decimal = 2) => {
    if (!num) {
        return "0";
    }

    const magnitudeSteps = [
        { divisor: 1, unit: "" },
        { divisor: 1000, unit: "K" },
        { divisor: 1000000, unit: "M" },
        { divisor: 1000000000, unit: "B" },
        { divisor: 1000000000000, unit: "T" },
    ];

    for (let i = magnitudeSteps.length - 1; i >= 0; i--) {
        const { divisor, unit } = magnitudeSteps[i];
        if (num >= divisor) {
            const formatted = numToString(new BigNumber(num).div(new BigNumber(divisor)).dp(decimal, BigNumber.ROUND_DOWN));
            return `${formatted}${unit}`;
        }
    }
    return formatNumberWithSubscript(numToString(new BigNumber(num)));
};

export const formatNumberWithSubscript = (number: number | string, maxDecimalDigits: number = 4): string => {
    const num = Number(number);
    if (!Number.isFinite(num)) return "0";

    const isNegative = num < 0;
    const absStr = Math.abs(num).toString();

    if (!absStr.includes(".") || Math.abs(num) > 1000) {
        return (isNegative ? "-" : "") + formatNumber(Math.abs(num), 2);
    }

    const [integerPart, decimalPart] = absStr.split(".");
    if (!decimalPart) {
        return (isNegative ? "-" : "") + integerPart;
    }

    const leadingZerosMatch = decimalPart.match(/^0+/);
    const leadingZerosCount = leadingZerosMatch?.[0]?.length ?? 0;

    if (leadingZerosCount > 2) {
        const restDigits = decimalPart.slice(leadingZerosCount);
        const displayedDigits = restDigits.slice(0, maxDecimalDigits);
        return `${isNegative ? "-" : ""}${integerPart}.0${toSubscriptNumber(leadingZerosCount)}${displayedDigits}`;
    }

    const roundedNumber = new BigNumber(num).dp(
        Math.abs(num) > 1 ? maxDecimalDigits : maxDecimalDigits + 2,
        BigNumber.ROUND_DOWN
    );
    return roundedNumber.toString();
};

const SUBSCRIPT_MAP: Readonly<Record<string, string>> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
} as const;

const toSubscriptNumber = (num: number | string): string => {
    return num
        .toString()
        .split("")
        .map((char) => SUBSCRIPT_MAP[char] ?? char)
        .join("");
};

export const numToString = (num: any) => {
    const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || "").length - m[2]));
};

export const format8 = (value: any) => {
    const bn = new BigNumber(value ?? 0);
    return bn
        .dividedBy(new BigNumber(10).pow(8))
        .decimalPlaces(4, BigNumber.ROUND_DOWN)
        .toString();
};

export const formatPercent = (value: number | string | null | undefined, fallback: string) => {
    if (value === null || value === undefined) return fallback;
    const raw = String(value).replace("%", "").trim();
    if (!raw) return fallback;
    const bn = new BigNumber(raw);
    if (!bn.isFinite()) return fallback;
    const formatted = bn.decimalPlaces(2, BigNumber.ROUND_DOWN).toFixed(2);
    return `${formatted}%`;
};

export const getPercentClass = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return "text-[#868789]";
    const raw = String(value).replace("%", "").trim();
    if (!raw) return "text-[#868789]";
    const bn = new BigNumber(raw);
    if (!bn.isFinite()) return "text-[#868789]";
    const rounded = bn.decimalPlaces(2, BigNumber.ROUND_DOWN);
    if (rounded.isZero()) return "text-[#868789]";
    return bn.isNegative() ? "text-[#FF5160]" : "text-[#17C964]";
};
