import { customToast } from "@/components/customToast";
import i18n from "@/i18n";

// 预定义的常用 toast 类型
export const showSuccessToast = (title: string, description?: string) => {
  return customToast({
    title,
    description: description || i18n.t("Toast.successDefault"),
    type: 'success',
  });
};

export const showErrorToast = (title: string, description?: string) => {
  return customToast({
    title,
    description: description || i18n.t("Toast.errorDefault"),
    type: 'error',
  });
};

export const showLoadingToast = (title: string, description?: string) => {
  return customToast({
    title,
    description: description || i18n.t("Toast.loadingDefault"),
    type: 'loading',
  });
};

export const showTransactionToast = (txHash: string) => {
  return customToast({
    title: 'Transaction Confirmed',
    description: `View on Bscscan >`,
    type: 'success',
    button: {
      label: 'View',
      onClick: () => window.open(`https://bscscan.com/tx/${txHash}`, '_blank'),
    },
  });
};

export const showDeploymentSuccessToast = (squares: number[], amount: string) => {
  return customToast({
    title: i18n.t("Toast.deploymentSuccessTitle"),
    description: i18n.t("Toast.deploymentSuccessDesc", { count: squares.length, amount }),
    type: 'success',
    button: {
      label: 'OK',
      onClick: () => {},
    },
  });
};
