import { ESortType } from "@/stores/settings/enums";
import { ref } from "vue";

export const valueOnChange = (event: Event) => Number((event.target as HTMLInputElement).value.replace(/\D/g, ""));

export const usePopup = () => {
  const visible = ref(false);

  const toggle = () => {
    visible.value = !visible.value;
    document.body.classList.toggle("popup-wrapper", visible.value);

  };

  const close = (e: Event) => {
    if ((e.target as HTMLElement).nodeName !== "HTML") return;
    toggle();
    document.removeEventListener("pointerdown", close);

  };

  const addClose = () => {
    document.removeEventListener("pointerdown", close);
    if (visible.value) document.addEventListener("pointerdown", close);
  };


  return { visible, toggle, addClose };
};

export const sortOptions = [
  { type: ESortType.TIME, label: "时间" },
  { type: ESortType.VALUE, label: "价值" },
];

export const FilterTypeList = [
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
    text: "主播自发红包"
  },
  {
    key: "intimacyRedPocket",
    color: "#e83ca8",
    text: "亲密度红包"
  }
] as const;