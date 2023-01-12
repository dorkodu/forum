import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const date = dayjs;

export const changeDateLanguage = async (locale: string) => {
  switch (locale) {
    case "en": await import("dayjs/locale/en"); break;
    case "tr": await import("dayjs/locale/tr"); break;
    default: return;
  }

  date.locale(locale);
}