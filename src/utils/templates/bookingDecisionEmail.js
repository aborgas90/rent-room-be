const bookingDecisionEmail = ({
  userName,
  roomNumber,
  startDate,
  endDate,
  isApproved,
  notes,
}) => {
  const status = isApproved ? "DISETUJUI" : "DITOLAK";
  const color = isApproved ? "#28a745" : "#dc3545";
  const icon = isApproved ? "✅" : "❌";

  return `
    <div style="font-family: Arial, sans-serif; padding: 16px; color: #333;">
      <h2 style="color: ${color};">${icon} Permintaan Booking ${status}</h2>
      <p>Halo <strong>${userName}</strong>,</p>
      <p>Permintaan booking Anda untuk kamar <strong>No. ${roomNumber}</strong> telah ${
    isApproved ? "disetujui" : "ditolak"
  }.</p>
      
      ${
        isApproved
          ? `
        <p>
          <strong>Detail Booking:</strong><br>
          Kamar: ${roomNumber}<br>
          Tanggal Mulai: ${startDate}<br>
          Tanggal Selesai: ${endDate}
        </p>
        <p>Silakan selesaikan pembayaran Anda menggunakan link pembayaran yang tersedia di dashboard Anda.</p>
      `
          : `
        <p>
          <strong>Alasan penolakan:</strong><br>
          ${notes || "Tidak ada alasan spesifik yang diberikan."}
        </p>
      `
      }
      
      <hr>
      <p style="font-size: 12px; color: #999;">Pesan ini dikirim secara otomatis oleh Sistem Poniran Kost</p>
    </div>
  `;
};

module.exports = { bookingDecisionEmail };
