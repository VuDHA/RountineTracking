import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";

export const formatDate = (date: Date): string => {
  return format(date, "MMMM d, yyyy");
};

export const formatTime = (date: Date): string => {
  return format(date, "h:mm a");
};

export const formatDay = (date: Date): string => {
  return format(date, "EEEE");
};

export const getCurrentWeekDays = (): Date[] => {
  const start = startOfWeek(new Date());
  const end = endOfWeek(start);
  return eachDayOfInterval({ start, end });
};

export const getNextWeekDays = (): Date[] => {
  const start = addWeeks(startOfWeek(new Date()), 1);
  const end = endOfWeek(start);
  return eachDayOfInterval({ start, end });
};

export const getPreviousWeekDays = (): Date[] => {
  const start = subWeeks(startOfWeek(new Date()), 1);
  const end = endOfWeek(start);
  return eachDayOfInterval({ start, end });
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const getTomorrow = (): Date => {
  return addDays(new Date(), 1);
};

export const formatDateForServer = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};
