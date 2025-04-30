export const formatDateID = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

export const formatDateNoWeekday= (date: string | Date | null): string => {
    if (!date) return "--:--";

    const option: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "long",
        year: "numeric"
    };

    return new Date(date).toLocaleDateString("id-ID", option);
}

export function FormatDate(date: string | Date | null): string {
  if(!date) return "--:--"

  const option: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
  }

  return new Date(date).toLocaleDateString("id-ID", option)
}

export function formatIndonesianDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('id-ID', options);
}

export function formatIndonesianTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} WIB`;
}

export function formatIndonesianDateTime(dateString: string): string {
  return `${formatIndonesianDate(dateString)} pukul ${formatIndonesianTime(dateString)}`;
}

export function formatIndonesianDateTimeRange(rangeString: string): string {
  const [start, end] = rangeString.split(' to ');
  return `${formatIndonesianDate(start || '')} pukul ${formatIndonesianTime(start || '')} sampai ${formatIndonesianDate(end || '')} pukul ${formatIndonesianTime(end || '')}`;
}