import { copyLottery, useSettingsStore } from "@/stores";
import { anchorLotJoinCondition } from "@/stores/lottery/data";
import type { TAnchorLot, TLotteryInfo } from "@/types";
import { h } from "vue";

export const copyBtn = async (item: TLotteryInfo) => {
  const { settings } = useSettingsStore();
  settings.copyId ? await navigator.clipboard.writeText("" + item.room_id) : copyLottery(item);
};

export const getRedPocketStyle = (price: number) => {
  const s = RedPocketStyle.find(t => price <= t.value)!;
  return s.style;
};

export const getAnchorJoinCondition = (at: TAnchorLot) => {
  const text = anchorLotJoinCondition[at.require_type](at);
  const gift = at.gift_name ? [
    h("span", `\u00A0|\u00A0`),
    h("span", { style: "color: #e05224" }, `${at.gift_name}x${at.gift_num} (${at.gift_price / 100 * at.gift_num}电池)`)
  ] : [];
  return [
    text ? h("span", "\u00A0| " + text) : null,
    ...gift
  ];
};

export const RedPocketStyle = [
  {
    value: 0,
    style: "red-pocket-intimacy"
  },
  {
    value: 9999,
    style: "red-pocket-small"
  },
  {
    value: 20000,
    style: "red-pocket-medium-2"
  },
  {
    value: 52000,
    style: "red-pocket-medium"
  },
  {
    value: 100000000,
    style: "red-pocket-large"
  },
];