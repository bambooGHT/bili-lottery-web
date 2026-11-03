import type { TLotteryInfo } from "@/types";
import { useLotteryStore } from "./lottery";
import { useSettingsStore } from "./settings";
import { api } from "@/api";

const lotteryWs = () => {
  const { setLotteryList, addLottery } = useLotteryStore();
  const { settings } = useSettingsStore();

  let closeWs = () => { };

  const createWs = (close?: () => void) => {
    closeWs();
    const { verify } = settings;

    // if (!verify.user.trim() || !verify.key.trim()) return;
    const ws = api.ws(verify.user, verify.key);

    ws.onopen = () => {
      console.log('webSocket connect');
    };

    ws.onmessage = (event) => {
      const item: TLotteryInfo | TLotteryInfo[] = JSON.parse(event.data);
      if (Array.isArray(item)) setLotteryList(item);
      else addLottery(item);
    };

    if (close) ws.onclose = close;

    closeWs = () => {
      ws.close();
      closeWs = () => { };
    };
  };

  createWs();

  return {
    createWs,
    close: () => closeWs()
  };
};

export const lotteryWebSocket = lotteryWs();