const prismaClient = require("../../../prisma-client");
const { sendEmail } = require("../../../utils/emailSender");
const { complaintEmail } = require("../../../utils/templates/complaintEmail");

const createReport = async ({
  user_id,
  title,
  fileUrl,
  description,
  category,
  owner_name,
}) => {
  try {
    const Room = await prismaClient.room.findUnique({
      where: { tenant_id: user_id },
    });

    const room_number = Room?.room_number || null;

    const report = await prismaClient.problemReport.create({
      data: {
        title,
        filename: fileUrl, // full GCS URL
        description,
        category,
        user_id,
        status: "PENDING",
        owner_name,
        room_number,
      },
    });

    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: "🚨 Pengaduan Baru",
        html: complaintEmail({
          userName: owner_name,
          category: category,
          description: description,
          roomNumber: room_number,
          filename: fileUrl,
        }),
      });
      console.log("✅ Complaint email notification sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send complaint email:", emailError.message);
    }

    return report;
  } catch (error) {
    console.error("❌ Error creating report:", error);
    throw error;
  }
};

const getReportUser = async ({ user_id }) => {
  try {
    const result = await prismaClient.problemReport.findMany({
      where: {
        user_id,
      },
    });

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  createReport,
  getReportUser,
};
