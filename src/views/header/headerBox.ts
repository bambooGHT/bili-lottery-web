import { computed, h, ref } from "vue";
import { EAtteryValueFilterOperator, ESort } from "@/stores/settings/enums";
import { Popup } from "tdesign-vue-next";
import { filterIcon, settingsIcon } from "../icon";
import { FilterTypeList, valueOnChange, sortOptions, usePopup } from "./header";
import { notify, useLotteryStore, useSettingsStore } from "@/stores";

export const headerBox = () => {
  return h("header", [
    h("div", [
      titleBox(),
      ...sortBox(),
      h(filterBox),
      h(settingsButton),
    ]),
  ]);
};

const titleBox = () =>
  h("h1", { id: "logo" }, "✦ Lottery");

const sortBox = () => {
  const { settings } = useSettingsStore();

  return [
    h("div", { class: "sort" }, sortOptions.map(({ type, label }) => {
      return h("button", {
        class: ["sort-button", { active: settings.sortType === type }],
        onClick: () => {
          settings.sortType = type;
        }
      }, label);
    })),
    h("button", {
      class: "sort-icon button-style",
      onClick: () => {
        settings.sort = settings.sort === ESort.ASC ? ESort.DESC : ESort.ASC;
      }
    }, settings.sort)
  ];
};

const filterBox = {
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
              "options-button button-style vertically-center",
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
  setup() {
    const { lotteryFilterOptions, addLotteryFilter, removeLotteryFilter } = useSettingsStore();
    const { filterLotteryAll } = useLotteryStore();
    const currentIndex = ref(0);
    const curLotteryFilterOptions = computed(() => {
      return lotteryFilterOptions.lotteryFilterList[currentIndex.value];
    });

    if (lotteryFilterOptions.lotteryFilterList.some(p => p.systemNotificationLottery)) {
      notify.requestNotifyPermission();
    }

    const content = () => h("section", { class: "filter-content" }, [
      h("article", [
        h("h3", { class: "h3-title" }, "显示"),
        h("div", { class: "options-item" }, [
          h("label", { class: "vertically-center" }, [
            h("input", {
              class: "input-default input-checkbox",
              type: "checkbox",
              checked: lotteryFilterOptions.show.anchorLot,
              onChange: (event: Event) => {
                lotteryFilterOptions.show.anchorLot = (event.target as HTMLInputElement).checked;
                filterLotteryAll();

              }
            }),
            h("div", "天选"),
          ]),
          h("label", { class: "vertically-center" }, [
            h("input", {
              class: "input-default input-checkbox",
              type: "checkbox",
              checked: lotteryFilterOptions.show.redPocket,
              onChange: (event: Event) => {
                lotteryFilterOptions.show.redPocket = (event.target as HTMLInputElement).checked;
                filterLotteryAll();
              }
            }),
            h("div", "红包")
          ])
        ])
      ]),

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

      h("label", { class: "vertically-center" }, [
        h("input", {
          class: "input-default input-checkbox",
          type: "checkbox",
          checked: curLotteryFilterOptions.value.enable,
          onChange: (event: Event) => {
            curLotteryFilterOptions.value.enable = (event.target as HTMLInputElement).checked;
            filterLotteryAll();
          }
        }),
        h("div", { class: "filter-condition" }, "启用筛选"),
      ]),
      h("label", { class: "vertically-center" }, [
        h("input", {
          class: "input-default input-checkbox",
          type: "checkbox",
          checked: curLotteryFilterOptions.value.systemNotificationLottery,
          onChange: (event: Event) => {
            const v = (event.target as HTMLInputElement).checked;
            curLotteryFilterOptions.value.systemNotificationLottery = v;
            if (v) notify.requestNotifyPermission();
          }
        }),
        h("div", { class: "filter-condition" }, "系统通知"),

      ]),
      h("label", { class: "vertically-center" }, [
        h("input", {
          class: "input-default input-checkbox",
          type: "checkbox",
          checked: curLotteryFilterOptions.value.autoOpenLiveRoom,
          onChange: (event: Event) => {
            curLotteryFilterOptions.value.autoOpenLiveRoom = (event.target as HTMLInputElement).checked;
          }
        }),
        h("div", { class: "filter-condition" }, "自动打开直播间"),
      ]),

      h("div", { class: "vertically-center filter-mr-top" }, [
        h("div", { class: "mr-auto" }, "name"),
        h("input", {
          class: "input-default",
          type: "text",
          placeholder: "auto-open",
          value: curLotteryFilterOptions.value.name,
          onChange: (event: Event) => {
            curLotteryFilterOptions.value.name = (event.target as HTMLInputElement).value;
          }
        }),
      ]),

      h("hr"),
      h("article", [
        h("h3", { class: "h3-title" }, "红包价值"),
        h("div", [
          h("div", { class: "vertically-center" }, [
            h("input", {
              class: "input-default input-number mr-auto",
              type: "number",
              min: 0,
              step: 1,
              placeholder: "≥ 电池",
              inputmode: "numeric",
              value: curLotteryFilterOptions.value.batteryValue.gteValue,
              onChange: (event: Event) => {
                curLotteryFilterOptions.value.batteryValue.gteValue = valueOnChange(event);
                filterLotteryAll();
              }
            }),
            h("input", {
              class: "input-default input-number",
              type: "number",
              min: 0,
              step: 1,
              placeholder: "≤ 电池",
              inputmode: "numeric",
              value: curLotteryFilterOptions.value.batteryValue.lteValue,
              onChange: (event: Event) => {
                curLotteryFilterOptions.value.batteryValue.lteValue = valueOnChange(event);
                filterLotteryAll();
              }
            }),
          ]),
          h("div", { class: "vertically-center filter-mr-top" }, [
            h("div", { class: "mr-auto" }, "平均值"),
            h("input", {
              class: "input-default input-number",
              type: "number",
              min: 0,
              step: 1,
              placeholder: "≥ 电池",
              inputmode: "numeric",
              value: curLotteryFilterOptions.value.batteryValue.average,
              onChange: (event: Event) => {
                curLotteryFilterOptions.value.batteryValue.average = valueOnChange(event);
                filterLotteryAll();
              }
            }),
          ]),
          h("div", { class: "value-operator" }, [
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
          ])
        ])
      ]),

      h("hr"),
      h("article", [
        h("h3", { class: "h3-title" }, "天选价值(不包含无价值天选)"),
        h("div", { class: "vertically-center filter-mr-top" }, [
          h("div", { class: "mr-auto" }, "天选礼物电池≥"),
          h("input", {
            class: "input-default input-number",
            type: "number",
            min: 0,
            step: 1,
            placeholder: "≥ 电池",
            inputmode: "numeric",
            value: curLotteryFilterOptions.value.batteryValue.anchorLotValue,
            onChange: (event: Event) => {
              curLotteryFilterOptions.value.batteryValue.anchorLotValue = valueOnChange(event);
              filterLotteryAll();
            }
          }),
        ])
      ]),

      h("hr"),
      h("article", [
        h("h3", { class: "h3-title" }, "类型"),
        h("div", { class: "options-item" }, FilterTypeList.map(item => {
          return h("label", { class: "vertically-center" }, [
            h("input", {
              class: "input-default input-checkbox",
              type: "checkbox",
              checked: curLotteryFilterOptions.value.type[item.key],
              onChange: (event: Event) => {
                curLotteryFilterOptions.value.type[item.key] = (event.target as HTMLInputElement).checked;
                filterLotteryAll();
              }
            }),
            h("i", { style: `background: ${item.color};` }),
            h("div", item.text)
          ]);
        }))
      ]),
    ]);

    return () => h("section", { class: "popup-content" }, content());
  }
};


const settingsButton = {
  setup: () => {
    const { visible, toggle, addClose } = usePopup();

    return () => h(Popup, {
      visible: visible.value,
      trigger: "click",
      placement: "bottom-right",
      overlayStyle: {
        transition: "none",
      }
    },
      {
        default: () =>
          h("button", {
            class: [
              "options-button button-style vertically-center",
              {
                "popup-content": visible.value
              },
            ],
            onClick: () => {
              toggle();
              addClose();
            }
          }, [
            settingsIcon(),
            "设置",
          ]),

        content: () => h(settingsContent)
      },
    );
  }
};

const settingsContent = {
  setup() {
    const { settings } = useSettingsStore();
    const { updateAutoRefreshTicker } = useLotteryStore();

    const content = () => h("section", { class: "settings-content" }, [
      h("article", [
        h("div", { class: "vertically-center" }, [
          h("div", { class: "mr-auto" }, "user"),
          h("input", {
            class: "input-default",
            type: "text",
            placeholder: "user",
            value: settings.verify.user,
            onChange: (event: Event) => {
              settings.verify.user = (event.target as HTMLInputElement).value;
            }
          }),
        ]),
        h("div", { class: "vertically-center" }, [
          h("div", { class: "mr-auto" }, "key"),
          h("input", {
            class: "input-default",
            type: "text",
            placeholder: "key",
            value: settings.verify.key,
            onChange: (event: Event) => {
              settings.verify.key = (event.target as HTMLInputElement).value;
            }
          }),
        ])
      ]),

      h("hr"),
      h("article", [
        h("div", { class: "options-item" }, [
          h("label", { class: "vertically-center" }, [
            h("input", {
              class: "input-underline",
              type: "number",
              min: 0,
              max: 30,
              step: 1,
              placeholder: "0-30秒",
              inputmode: "numeric",
              onInput: (event: Event) => {
                const input = event.target as HTMLInputElement;
                if (input.value === "" || input.value === "0") return;

                const value = Number(input.value);
                if (value > 30) input.value = "30";
                if (value < 0) input.value = "0";
              },
              value: settings.autoRefreshInterval,
              onChange: (event: Event) => {
                settings.autoRefreshInterval = valueOnChange(event);
                updateAutoRefreshTicker();
              }
            }),
            h("div", "自动刷新列表间隔(秒)"),
          ])
        ])
      ]),

      h("hr"),
      h("article", [
        h("h3", { class: "h3-title" }, "复制"),
        h("div", { class: "options-item" }, [
          h("label", { class: "vertically-center" }, [
            h("input", {
              class: "input-default input-checkbox",
              name: "copy",
              type: "radio",
              checked: !settings.copyId,
              onChange: () => {
                settings.copyId = false;
              }
            }),
            h("div", "完整信息"),
          ]),
          h("label", { class: "vertically-center" }, [
            h("input", {
              class: "input-default input-checkbox",
              name: "copy",
              type: "radio",
              checked: settings.copyId,
              onChange: () => {
                settings.copyId = true;
              }
            }),
            h("div", "房间id")
          ])
        ])
      ]),
    ]);

    return () => h("section", { class: "popup-content" }, content());
  }
};