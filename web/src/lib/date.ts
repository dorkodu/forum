import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
export const date = dayjs;

const locales: Record<string, () => Promise<any>> = {
  en: () => import("dayjs/locale/en"),
  tr: () => import("dayjs/locale/tr"),
}

export const changeDateLanguage = async (language: string) => {
  await locales[language]?.();
  date.locale(language);
}