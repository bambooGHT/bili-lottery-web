import { Popup } from "tdesign-vue-next";
import { usePopup } from "../header";
import { h } from "vue";
import { settingsIcon } from "@/views/components/icon";
import { useLotteryStore, useSettingsStore } from "@/stores";
import { optionsRadioBox, optionsTextBox, valueOnChange } from "@/views/components/input";

export const settingsBox = {
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
              "options-popup-button options-button vertically-center",
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
  setup: () => {
    const { settings } = useSettingsStore();
    const { updateAutoRefreshTicker } = useLotteryStore();

    return () => h("section", { class: "popup-content options-content" }, [
      h(optionsTextBox, {
        label: "user",
        placeholder: "user",
        modelValue: settings.verify.user,
        "onUpdate:modelValue": (value: string) => {
          if (!value) return;
          settings.verify.user = value;
        },
      }),
      h(optionsTextBox, {
        label: "key",
        placeholder: "key",
        modelValue: settings.verify.key,
        "onUpdate:modelValue": (value: string) => {
          if (!value) return;
          settings.verify.key = value;
        },
      }),

      h("hr"),
      h("label", { class: "vertically-center" }, [
        h("input", {
          class: "input-underline",
          type: "number",
          min: 0,
          max: 60,
          step: 1,
          placeholder: "0-60秒",
          inputmode: "numeric",
          onInput: (event: Event) => {
            const input = event.target as HTMLInputElement;
            if (input.value === "" || input.value === "0") return;

            const value = Number(input.value);
            if (value > 60) input.value = "60";
            if (value < 0) input.value = "0";
          },
          value: settings.autoRefreshInterval,
          onChange: (event: Event) => {
            settings.autoRefreshInterval = valueOnChange(event);
            updateAutoRefreshTicker();
          }
        }),
        h("div", "自动刷新列表间隔(秒)"),
      ]),

      h("hr"),
      h("h3", { class: "options-title" }, "复制"),
      h(optionsRadioBox, {
        name: "copy",
        label: "完整信息",
        modelValue: !settings.copyId,
        "onUpdate:modelValue": () => {
          settings.copyId = false;
        },
      }),
      h(optionsRadioBox, {
        name: "copy",
        label: "房间id",
        modelValue: settings.copyId,
        "onUpdate:modelValue": () => {
          settings.copyId = true;
        },
      }),
    ]);
  }
};
