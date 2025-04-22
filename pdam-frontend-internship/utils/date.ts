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