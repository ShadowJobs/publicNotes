import dayjs from "dayjs";

export const isExpired = (createdTime: string, TTLday: number) => {
  return dayjs(createdTime).valueOf() + TTLday * 60 * 60 * 24 * 1000 < dayjs().valueOf();
};

export const getExpiredTime = (createdTime: string, TTLday: number): string => {
  if (TTLday === -1) {
    return "-";
  }
  return dayjs(dayjs(createdTime).valueOf() + TTLday * 60 * 60 * 24 * 1000).format("YYYY-MM-DD");
};

export function formatSeconds(secondsString: string) {
  const totalSeconds = parseInt(secondsString, 10);

  if (isNaN(totalSeconds)) {
    return "";
  }

  const minutes = Math.ceil(totalSeconds / 60) < 3 ? 3 : Math.ceil(totalSeconds / 60);

  return `${minutes} min`;
}
