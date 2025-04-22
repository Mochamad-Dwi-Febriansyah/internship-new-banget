// src/utils/statusUtils.ts
export const getIconName = (status: string): string => {
    const icons: Record<string, string> = {
        approved: 'material-symbols:check-circle-outline-rounded',
        accepted: 'hugeicons:tick-double-03',
        pending: 'material-symbols-light:hourglass-bottom',
        rejected: 'material-symbols:cancel',
        tolak: 'material-symbols:cancel',
    };
    return icons[status] || 'material-symbols:cancel'; // Default jika status tidak dikenali
};

export const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        approved: 'Disetujui',
        accepted: 'Disetujui',
        pending: 'Menunggu',
        rejected: 'Ditolak',
        tolak: 'Ditolak',
    };
    return labels[status] || 'Status tidak dikenal';
};
