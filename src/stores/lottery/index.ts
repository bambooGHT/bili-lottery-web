import { getRedPocketTotal } from "./filter";
import { useSettingsStore } from "../settings";
import { formatJoinTotal } from "./format";
import { Ticker } from "@/utils/ticker";
import { throttle } from "@/utils/throttle";
import { globalTicker } from "../ticker";
import { useLotteryData } from "./lotteryData";

export * from "./copyLottery";
export { getMaxEndTime } from "../lotteryIdDeduplication";

const lotteryStore = () => {
  let autoRefreshTicker: Ticker | null = null;
  let unAutoRefreshTicker: (() => void) | undefined;

  const {
    displayLotteryList,
    replaceLotteryList,
    addLottery,
    refreshLotteryList: refreshList,
    refreshLotteryDisplayList,
    updateDisplayLotteryListShowTime,
    getLotterySize,
  } = useLotteryData();
  const settings = useSettingsStore();

  const refreshLotteryList = throttle(refreshList, 1500);
  const updateAutoRefreshTicker = () => {
    unAutoRefreshTicker?.();
    unAutoRefreshTicker = undefined;
    autoRefreshTicker = null;

    if (!settings.settings.autoRefreshInterval) return;

    autoRefreshTicker = new Ticker(settings.settings.autoRefreshInterval * 1000);
    unAutoRefreshTicker = autoRefreshTicker.subscribe(refreshLotteryList);
  };


  globalTicker.subscribe(updateDisplayLotteryListShowTime);
  updateAutoRefreshTicker();

  return {
    displayLotteryList,
    addLottery,
    replaceLotteryList,
    refreshLotteryList,
    refreshLotteryDisplayList,
    updateAutoRefreshTicker,
    getLotterySize,
  };
};

const instance = lotteryStore();
const useLotteryStore = () => instance;

export { getRedPocketTotal, useLotteryStore, formatJoinTotal };