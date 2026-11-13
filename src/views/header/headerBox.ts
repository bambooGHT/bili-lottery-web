import { ESort } from "@/stores/settings/enums";
import { h } from "vue";
import { sortOptions } from "./header";
import { useSettingsStore } from "@/stores";
import { filterBox } from "./components/headerBox-filters";
import { settingsBox } from "./components";

export const headerBox = () => {
  return h("header", { class: "header" }, [
    h("nav", { class: "header-toolbar" }, [
      h("h1", { class: "header-logo" }, "✦ Lottery"),
      sortBox(),
      h(filterBox),
      h(settingsBox),
    ]),
  ]);
};


const sortBox = () => {
  const { settings } = useSettingsStore();

  return [
    h("div", { class: "sort" }, sortOptions.map(({ type, label }) => {
      return h("button", {
        class: ["sort-toggle-button", { active: settings.sortType === type }],
        onClick: () => {
          settings.sortType = type;
        }
      }, label);
    })),
    h("button", {
      class: "sort-icon options-button sort-button",
      onClick: () => {
        settings.sort = settings.sort === ESort.ASC ? ESort.DESC : ESort.ASC;
      }
    }, settings.sort)
  ];
};
