import { ESortType } from "@/stores/settings/enums";
import type { ILotteryFromAnchor, ILotteryFromRedPocket } from "@/stores/settings/types";
import { ref } from "vue";

export const usePopup = () => {
  const visible = ref(false);

  const toggle = () => {
    visible.value = !visible.value;
    document.body.classList.toggle("popup-wrapper", visible.value);
  };

  let isOutside = false;

  const handlePointerDown = (e: PointerEvent) => {
    isOutside = (e.target as HTMLElement).nodeName === "HTML";
  };

  const close = (e: MouseEvent) => {
    if (!isOutside || (e.target as HTMLElement).nodeName !== "HTML") return;

    removeClose();
    toggle();
  };

  const removeClose = () => {
    document.removeEventListener("pointerdown", handlePointerDown);
    document.removeEventListener("click", close, true);
  };

  const addClose = () => {
    removeClose();

    if (visible.value) {
      document.addEventListener("pointerdown", handlePointerDown);
      document.addEventListener("click", close, true);
    }
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