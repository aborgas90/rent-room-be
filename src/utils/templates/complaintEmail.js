const complaintEmail = ({
  userName,
  category,
  description,
  roomNumber,
  filename,
}) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #dc3545;">🚨 Pengaduan Baru</h2>
      <p><strong>${userName}</strong> mengirimkan pengaduan untuk kamar <strong>${
    roomNumber || "-"
  }</strong>.</p>
      <p><strong>Kategori:</strong> ${category}</p>
      <p><strong>Deskripsi:</strong><br>${description}</p>

      ${
        filename
          ? `<div style="margin-top: 12px;">
              <strong>Lampiran Gambar:</strong><br>
              <img src="${filename}" alt="Lampiran" width="300" style="border: 1px solid #ccc; margin-top: 8px;" />
            </div>`
          : ""
      }

      <hr>
      <p style="font-size: 12px; color: #999;">Email ini dikirim otomatis oleh sistem Poniran Kost</p>
    </div>
  `;
};

module.exports = { complaintEmail };
