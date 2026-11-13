import { ESortType } from "@/stores/settings/enums";
import type { ILotteryFromAnchor, ILotteryFromRedPocket } from "@/stores/settings/types";
import { ref } from "vue";

export const usePopup = () => {
  const visible = ref(false);

  const toggle = () => {
    visible.value = !visible.value;
    document.body.classList.toggle("popup-wrapper", visible.value);

  };

  const close = (e: Event) => {
    if ((e.target as HTMLElement).nodeName !== "HTML") return;
    toggle();
    document.removeEventListener("pointerup", close);

  };

  const addClose = () => {
    document.removeEventListener("pointerup", close);
    if (visible.value) document.addEventListener("pointerup", close);
  };


  return { visible, toggle, addClose };
};

export const sortOptions = [
  { type: ESortType.TIME, label: "时间" },
  { type: ESortType.VALUE, label: "价值" },
];

export const FilterTypeList: {
  key: keyof ILotteryFromAnchor | keyof ILotteryFromRedPocket;
  color: string;
  color2?: string;
  text: string;
}[] = [
    {
      key: "anchorLot",
      color: "#7655f5",
      text: "天选"
    },
    {
      key: "zeroValueAnchorLot",
      color: "#7655f5",
      text: "无价值天选"
    },
    {
      key: "batteryRedPocket",
      color: "#e91d36",
      text: "电池红包"
    },
    {
      key: "giftRedPocket",
      color: "#e91d36",
      text: "礼物红包"
    },
    {
      key: "roomExclusiveRedPocket",
      color: "#e91d36",
      text: "房间专属礼物红包"
    },
    {
      key: "captainRedPocket",
      color: "#e91d36",
      text: "上舰红包"
    },
    {
      key: "redPocketFromAnchor",
      color: "#FFF",
      color2: "#e91d36",
      text: "主播自发红包"
    },
    {
      key: "intimacyRedPocket",
      color: "#e83ca8",
      text: "亲密度红包"
    }
  ];