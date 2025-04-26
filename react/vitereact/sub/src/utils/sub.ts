declare global {
  interface Window {
    __SUB_DATA: Record<string, any>;
  }
}

const DISABLED_LEGENDS_KEY = "disabledLegends";

const LegendsConfig = {
  getDisabled() {
    return JSON.parse(localStorage.getItem(DISABLED_LEGENDS_KEY) ?? "[]") as string[];
  },
  enable(name: string) {
    const disabledLegends = this.getDisabled().filter((item) => item !== name);
    localStorage.setItem(DISABLED_LEGENDS_KEY, JSON.stringify(disabledLegends));
    window.__SUB_DATA.disabledLegends = LegendsConfig.getDisabled();
  },
  disable(name: string) {
    const disabledLegends = this.getDisabled();
    if (!disabledLegends.includes(name)) disabledLegends.push(name);
    localStorage.setItem(DISABLED_LEGENDS_KEY, JSON.stringify(disabledLegends));
    window.__SUB_DATA.disabledLegends = LegendsConfig.getDisabled();
  }
};

type Message = {
  type: "legend_toggle";
  payload: {
    name: string;
    status: boolean;
  };
};

const handleLegendToggleEvent = (event: MessageEvent<Message | null>) => {
  console.log("message:", event.data?.type);
  if (event.data?.type !== "legend_toggle") return;

  const { name, status } = event.data.payload;

  if (status) {
    LegendsConfig.enable(name);
  } else {
    LegendsConfig.disable(name);
  }
};

window.addEventListener("message", handleLegendToggleEvent);

export const initSubStates = () => {
  window.__SUB_DATA = Object.fromEntries(new URLSearchParams(window.location.search));
  window.__SUB_DATA.disabledLegends = LegendsConfig.getDisabled();
};
