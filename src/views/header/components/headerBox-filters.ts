import { Popup } from "tdesign-vue-next";
import { FilterTypeList, usePopup } from "../header";
import { computed, h, ref } from "vue";
import { filterIcon } from "@/views/components/icon";
import { notify, useLotteryStore, useSettingsStore } from "@/stores";
import { optionsCheckbox, optionsNumberBox, optionsTextBox } from "@/views/components/input";
import { EAtteryValueFilterOperator } from "@/stores/settings/enums";

export const filterBox = {
  setup: () => {
    const { visible, toggle, addClose } = usePopup();
    return () => h(Popup, {
      visible: visible.value,
      placement: "bottom-right",
      overlayStyle: {
        transition: "none",
      },
    },
      {
        default: () =>
          h("button", {
            class: [
              "options-popup-button options-button vertically-center",
              { "popup-content": visible.value },
            ],
            onClick: () => {
              toggle();
              addClose();
            }
          }, [
            filterIcon(),
            "筛选"
          ]),

        content: () => h(filterContent)
      },
    );
  }
};

const filterContent = {
  setup: () => {
    const { lotteryFilterOptions, addLotteryFilter, removeLotteryFilter } = useSettingsStore();
    const { filterLotteryAll } = useLotteryStore();
    const currentIndex = ref(0);
    const curLotteryFilterOptions = computed(() => {
      return lotteryFilterOptions.lotteryFilterList[currentIndex.value];
    });

    if (lotteryFilterOptions.lotteryFilterList.some(p => p.systemNotificationLottery)) {
      notify.requestNotifyPermission();
    }

    return () => h("section", { class: "popup-content options-content" }, [
      h("h3", { class: "options-title" }, "显示"),
      h(optionsCheckbox, {
        label: "天选",
        modelValue: lotteryFilterOptions.show.anchorLot,
        "onUpdate:modelValue": (value: boolean) => {
          lotteryFilterOptions.show.anchorLot = value;
          filterLotteryAll();
        },
      }),
      h(optionsCheckbox, {
        label: "红包",
        modelValue: lotteryFilterOptions.show.redPocket,
        "onUpdate:modelValue": (value: boolean) => {
          lotteryFilterOptions.show.redPocket = value;
          filterLotteryAll();
        },
      }),

      h("hr"),
      h("div", { class: "filter-conditions" }, [
        h("div", { class: "filter-conditions-list" }, lotteryFilterOptions.lotteryFilterList?.map((item, index) =>
          h("div", {
            key: index,
            class: ["filter-condition-item", index === currentIndex.value && "active"],
            onClick: () => currentIndex.value = index
          }, [
            h("span", { class: "text-ellipsis" }, item.name),
            h("span", {
              class: "filter-condition-remove",
              onClick: (event: Event) => {
                event.stopPropagation();
                removeLotteryFilter(index);
                currentIndex.value = Math.min(
                  currentIndex.value - Number(index < currentIndex.value),
                  lotteryFilterOptions.lotteryFilterList.length - 1
                );
                filterLotteryAll();
              }
            }, "×")
          ]))),
        h("button", {
          class: "filter-condition-add",
          title: "新增条件",
          onClick: (e: Event) => {
            e.stopPropagation();
            addLotteryFilter();
          }
        }, "+")
      ]),

      h(optionsCheckbox, {
        label: "启用筛选",
        modelValue: curLotteryFilterOptions.value.enable,
        "onUpdate:modelValue": (value: boolean) => {
          curLotteryFilterOptions.value.enable = value;
          filterLotteryAll();
        },
      }),
      h(optionsCheckbox, {
        label: "系统通知",
        modelValue: curLotteryFilterOptions.value.systemNotificationLottery,
        "onUpdate:modelValue": (value: boolean) => {
          curLotteryFilterOptions.value.systemNotificationLottery = value;
          if (value) notify.requestNotifyPermission();
        },
      }),
      h(optionsCheckbox, {
        label: "自动打开直播间",
        modelValue: curLotteryFilterOptions.value.autoOpenLiveRoom,
        "onUpdate:modelValue": (value: boolean) => {
          curLotteryFilterOptions.value.autoOpenLiveRoom = value;
        },
      }),
      h(optionsTextBox, {
        label: "filter title",
        placeholder: "filter title",
        modelValue: curLotteryFilterOptions.value.name,
        "onUpdate:modelValue": (value: string) => {
          if (!value) return;
          curLotteryFilterOptions.value.name = value;
        },
      }),

      h("hr"),
      h("h3", { class: "options-title" }, "红包价值"),
      h("div", { class: "options-value" }, [
        h(optionsNumberBox, {
          modelValue: curLotteryFilterOptions.value.batteryValue.gteValue,
          placeholder: "≥ 电池",
          "onUpdate:modelValue": (value: number) => {
            curLotteryFilterOptions.value.batteryValue.gteValue = value;
            filterLotteryAll();
          }
        }),
        h(optionsNumberBox, {
          modelValue: curLotteryFilterOptions.value.batteryValue.lteValue,
          placeholder: "≤ 电池",
          "onUpdate:modelValue": (value: number) => {
            curLotteryFilterOptions.value.batteryValue.lteValue = value;
            filterLotteryAll();
          }
        }),
      ]),
      h("div", { class: "options-value" }, [
        h("div", "平均值"),
        h(optionsNumberBox, {
          modelValue: curLotteryFilterOptions.value.batteryValue.average,
          placeholder: "≥ 电池",
          "onUpdate:modelValue": (value: number) => {
            curLotteryFilterOptions.value.batteryValue.average = value;
            filterLotteryAll();
          }
        }),
      ]),

      h("div", { class: "options-value options-operator" }, [
        h("label", [
          h("input", {
            type: "radio",
            name: "value-operator",
            value: "||",
            checked: curLotteryFilterOptions.value.batteryValueFilterOperator === EAtteryValueFilterOperator.OR,
            onChange: () => {
              curLotteryFilterOptions.value.batteryValueFilterOperator = EAtteryValueFilterOperator.OR;
              filterLotteryAll();
            }
          }),
          "OR (||)"
        ]),
        h("label", [
          h("input", {
            type: "radio",
            name: "value-operator",
            value: "&&",
            checked: curLotteryFilterOptions.value.batteryValueFilterOperator === EAtteryValueFilterOperator.AND,
            onChange: () => {
              curLotteryFilterOptions.value.batteryValueFilterOperator = EAtteryValueFilterOperator.AND;
              filterLotteryAll();
            }
          }),
          "AND (&&)"
        ])
      ]),
      h("div", { class: "options-value" }, [
        h("div", "天选价值"),
        h(optionsNumberBox, {
          modelValue: curLotteryFilterOptions.value.batteryValue.anchorLotValue,
          placeholder: "≥ 电池",
          "onUpdate:modelValue": (value: number) => {
            curLotteryFilterOptions.value.batteryValue.anchorLotValue = value;
            filterLotteryAll();
          }
        }),
      ]),

      h("hr"),
      h("h3", { class: "options-title" }, "类型"),
      h("div", FilterTypeList.map(item => {
        return h(optionsCheckbox, {
          label: item.text,
          modelValue: curLotteryFilterOptions.value.type[item.key],
          "onUpdate:modelValue": (value: boolean) => {
            curLotteryFilterOptions.value.type[item.key] = value;
            filterLotteryAll();
          },
        }, {
          default: () => h("i", { style: `background: ${item.color2 ? `linear-gradient(135deg, ${item.color2} 0% 50%, ${item.color} 50% 100%)` : item.color};` })
        });
      }))
    ]);
  }
};

