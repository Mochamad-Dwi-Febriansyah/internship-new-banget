export function statusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'inactive':
        return 'Tidak Aktif'
      default:
        return status // fallback, bisa juga dikasih "-"
    }
  }

  type ButtonVariant = 'default' | 'alternative' | 'dark' | 'light' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'custom'

  export const getStatusVariant = (status: string): ButtonVariant => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'green'
      case 'pending':
        return 'yellow'
      case 'rejected':
        return 'red'
      default:
        return 'light'
    }
  } 
  
 
// Label untuk setiap jenis purpose
export function purposeLabel(purpose: any): string {
  switch (purpose) {
    case 'receipt_letter':
      return 'Surat Balasan'
    case 'division_letter':
      return 'Surat Divisi'
    case 'certificate':
      return 'Sertifikat'
    case 'work_certificate':
      return 'Surat Keterangan'
    case 'daily_report':
      return 'Laporan Harian'
    case 'field_letter':
      return 'Surat Bidang'
    default:
      return purpose
  }
}
