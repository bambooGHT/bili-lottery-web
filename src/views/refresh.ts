import { useLotteryStore } from "@/stores";
import { h } from "vue";

export const refreshLotteryBtn = () => {
  const { refreshLotteryList } = useLotteryStore();
  return h(
    "button",
    {
      class: "refresh-btn",
      title: "更新",
      onClick: refreshLotteryList
    },
    [
      h("svg", {
        viewBox: "0 0 24 24",
        width: 18,
        height: 18,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 2,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        innerHTML: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>',
      }),
    ],
  );
};