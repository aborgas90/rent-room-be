const bookingRequestEmail = ({ userName, roomNumber, startDate, endDate }) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 16px; color: #333;">
      <h2 style="color: #007BFF;">📢 Booking Request Masuk</h2>
      <p><strong>${userName}</strong> telah mengajukan permintaan untuk menyewa kamar <strong>No. ${roomNumber}</strong>.</p>
      <p>
        <strong>Tanggal Sewa:</strong><br>
        Mulai: ${startDate}<br>
        Selesai: ${endDate}
      </p>
      <hr>
      <p style="font-size: 12px; color: #999;">Email ini dikirim otomatis oleh sistem RentRoom</p>
    </div>
    `;
};

module.exports = { bookingRequestEmail };
