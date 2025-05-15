// scheduler/paymentScheduler.js
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const prismaClient = require("../../prisma-client");
const TwilioService = require("../twilio-sending/twilio-services");

const logErrorToFile = (context, err) => {
  const logDir = path.join(__dirname, "../../logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const logFile = path.join(logDir, "twilio-errors.log");
  const timestamp = new Date().toISOString();
  const content = `[${timestamp}] [${context}] ${err.message}\n`;
  fs.appendFileSync(logFile, content);
};

// 🔔 H-7 Reminder for upcoming end_rent
cron.schedule("0 8 * * *", async () => {
  console.log("🔔 Mengecek pembayaran yang akan habis 7 hari lagi...");

  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + 7);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(targetDate.getDate() + 1);

  try {
    const payments = await prismaClient.payment.findMany({
      where: {
        status: "PAID",
        end_rent: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        user: true,
        room: true,
      },
    });

    for (const payment of payments) {
      const { user, room, end_rent } = payment;
      const formattedDate = end_rent.toLocaleDateString("id-ID");
      const message = `📢 Pengingat Masa Sewa Kost\n\nHalo ${user.name}, masa sewa kost untuk kamar ${room.room_number} akan berakhir pada ${formattedDate}. Silakan lakukan pembayaran untuk memperpanjang sebelum tanggal tersebut.`;

      if (user.telephone) {
        try {
          await TwilioService.sendWhatsApp(
            `whatsapp:${user.telephone}`,
            message
          );
        } catch (err) {
          console.error(
            `❌ Gagal kirim WA ke ${user.telephone}: ${err.message}`
          );
          logErrorToFile("H-7 Reminder", err);
        }
      }
    }

    console.log("✅ Pengingat masa sewa berhasil dikirim.");
  } catch (error) {
    console.error("❌ Gagal mengirim pengingat:", error.message);
  }
});

// 🔔 Notifikasi status pembayaran
const sendPaymentStatusNotification = async (user, room, status, payment) => {
  const statusMessages = {
    PAID: `✅ Pembayaran berhasil!\n\nTerima kasih ${
      user.name
    }, pembayaran untuk kamar ${
      room.room_number
    } telah diterima. Masa sewa aktif sampai ${new Date(
      payment.end_rent
    ).toLocaleDateString("id-ID")}.`,
    FAILED: `❌ Pembayaran gagal\n\nHalo ${user.name}, pembayaran untuk kamar ${room.room_number} gagal diproses. Silakan coba kembali.`,
    EXPIRED: `⌛ Pembayaran kadaluarsa\n\nHalo ${user.name}, pembayaran untuk kamar ${room.room_number} telah kadaluarsa. Silakan lakukan booking ulang jika masih berminat.`,
  };

  if (user.telephone && statusMessages[status]) {
    try {
      await TwilioService.sendWhatsApp(
        `whatsapp:${user.telephone}`,
        statusMessages[status]
      );
    } catch (err) {
      console.error(
        `❌ Gagal kirim notifikasi status ke ${user.telephone}: ${err.message}`
      );
      logErrorToFile("Payment Status", err);
    }
  }
};

// 🔔 Notifikasi booking disetujui/ditolak
const sendBookingDecisionNotification = async (
  user,
  room,
  approved,
  notes = ""
) => {
  const message = approved
    ? `✅ Booking Disetujui\n\nHalo ${user.name}, permintaan booking Anda untuk kamar ${room.room_number} telah disetujui. Silakan lanjutkan ke pembayaran.`
    : `❌ Booking Ditolak\n\nHalo ${user.name}, permintaan booking Anda untuk kamar ${room.room_number} ditolak. ${notes}`;

  console.log("NotESS", notes);
  if (user.telephone) {
    try {
      await TwilioService.sendWhatsApp(`whatsapp:${user.telephone}`, message);
      console.log(user.telephone, "INI BAGIAN TWILIO");
    } catch (err) {
      console.error(
        `❌ Gagal kirim notifikasi booking ke ${user.telephone}: ${err.message}`
      );
      logErrorToFile("Booking Decision", err);
    }
  }
};

// 🕐 Unlock rooms if user didn't pay within 1 hour
const unlockExpiredRooms = async () => {
  const lockTimeout = 60 * 60 * 1000;

  const roomToUnlock = await prismaClient.room.findMany({
    where: {
      status: "TERKUNCI",
      locked_at: {
        lt: new Date(Date.now() - lockTimeout),
      },
    },
  });

  for (const room of roomToUnlock) {
    await prismaClient.room.update({
      where: { room_id: room.room_id },
      data: { status: "TERSEDIA", locked_at: null },
    });
    console.log(`🔓 Room ${room.room_id} is now available.`);
  }
};

// 🕑 Release room if rental period has ended
const expireFinishedRentals = async () => {
  const now = new Date();
  console.log(
    `⏰ [${now.toISOString()}] Mengecek kamar yang masa sewanya habis...`
  );

  const expiredPayments = await prismaClient.payment.findMany({
    where: {
      status: "PAID",
      end_rent: {
        lt: now,
      },
    },
    include: {
      room: true,
    },
  });

  for (const payment of expiredPayments) {
    const roomId = payment.room_id;
    await prismaClient.room.update({
      where: { room_id: roomId },
      data: {
        status: "TERSEDIA",
        tenant_id: null,
      },
    });
    console.log(
      `⏰ Masa sewa kamar ${roomId} habis. Kamar jadi tersedia kembali.`
    );
  }
};

// ⏱️ Schedule unlockExpiredRooms to run every hour
cron.schedule("0 * * * *", async () => {
  await unlockExpiredRooms();
});

// ⏱️ Schedule expireFinishedRentals to run every day at 8am
cron.schedule("0 8 * * *", async () => {
  await expireFinishedRentals();
});

module.exports = {
  unlockExpiredRooms,
  expireFinishedRentals,
  sendPaymentStatusNotification,
  sendBookingDecisionNotification,
};
