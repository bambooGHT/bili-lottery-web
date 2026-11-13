import { defineComponent, h } from "vue";

export const valueOnChange = (event: Event) => Number((event.target as HTMLInputElement).value.replace(/\D/g, ""));

export const optionsCheckbox = defineComponent<{
  label: string;
  modelValue: boolean;
}, ["update:modelValue"]>((props, { emit, slots }) => {

  return () => h("label", { class: "vertically-center options-checkbox" }, [
    h("input", {
      class: "input-default",
      type: "checkbox",
      checked: props.modelValue,
      onChange: (event: Event) => {
        emit("update:modelValue", (event.target as HTMLInputElement).checked);
      }
    }),
    slots.default?.(),
    h("div", props.label),
  ]);
}, { props: ['label', 'modelValue'] });

export const optionsRadioBox = defineComponent<{
  name: string;
  value?: string;
  label: string;
  modelValue: boolean;
}>((props, { emit }) => {

  return () => h("label", { class: "vertically-center options-checkbox" }, [
    h("input", {
      class: "input-default",
      type: "radio",
      name: props.name,
      value: props.value,
      checked: props.modelValue,
      onChange: (event: Event) => {
        emit("update:modelValue", (event.target as HTMLInputElement).checked);
      }
    }),
    h("div", props.label),
  ]);
}, { props: ["name", "value", 'label', 'modelValue'] });

export const optionsTextBox = defineComponent<{
  label: string;
  placeholder?: string;
  modelValue: string;
}, ["update:modelValue"]>((props, { emit }) => {
  return () => h("div", { class: "vertically-center options-text-box" }, [
    h("div", props.label),
    h("input", {
      class: "input-default",
      type: "text",
      placeholder: props.placeholder,
      value: props.modelValue,
      onChange: (event: Event) => {
        emit("update:modelValue", (event.target as HTMLInputElement).value);
      }
    })
  ]);
}, { props: ['label', 'modelValue', "placeholder"] });

export const optionsNumberBox = defineComponent<{
  modelValue: number;
  placeholder: string;
}, ["update:modelValue"]>((props, { emit }) => {
  return () => h("input", {
    class: "input-default options-number",
    type: "number",
    min: 0,
    step: 1,
    inputmode: "numeric",
    placeholder: props.placeholder,
    value: props.modelValue,
    onChange: (event: Event) => {
      emit("update:modelValue", valueOnChange(event));
    }
  });
}, { props: ['modelValue', 'placeholder'] });