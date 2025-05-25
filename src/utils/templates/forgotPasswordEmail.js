const sendResetEmail = ({ resetLink }) => {
  return `
      <h2>Permintaan Reset Password</h2>
      <p>Kami menerima permintaan untuk mengatur ulang password Anda.</p>
      <p>Klik link di bawah ini untuk melanjutkan:</p>
      <a href="${resetLink}" style="color: white; background: #0070f3; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      <p><small>Link ini hanya berlaku selama 15 menit.</small></p>
    `;
};

module.exports = { sendResetEmail };
