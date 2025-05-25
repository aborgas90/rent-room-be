const prismaClient = require("../../prisma-client");
const {
  createUser,
  authentication,
} = require("../../services/auth/auth-services");

const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utils/emailSender");
const { sendResetEmail } = require("../../utils/templates/forgotPasswordEmail");
const bcrypt = require("bcryptjs");
const { ResponseError } = require("../../error/error-response");

const handleRegister = async (req, res, next) => {
  const { user_id, name, email, password, telephone, address } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        errors: {
          email: email ? null : "Email is required",
          password: password ? null : "Password is required",
        },
      });
    }

    await createUser({ name, email, password, telephone, address });
    res.status(201).json({
      status: 201,
      message: "Registration Successful",
      data: {
        name,
        email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleLogin = async (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        errors: "Unable to login",
        message: "Email and password are required!",
      });
    }

    const user = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user || !user.email || !user.password) {
      return res.status(401).json({
        errors: "Unable to login",
        message: "Invalid email or password!",
      });
    }

    const { token, User } = await authentication({ email, password });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userData = {
      user_id: decoded.user_id,
      email: decoded.email,
      name: decoded.name,
      roles: decoded.roles,
    };

    res.cookie("userData", JSON.stringify(userData), {
      httpOnly: false,
      sameSite: "Lax", // or 'Strict' if needed
      secure: false, // true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // HARUS true karena frontend pakai HTTPS
      sameSite: "none", // wajib kalau cross-origin supaya cookie terkirim
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      status: 200,
      message: "Login Successful",
      data: {
        token,
        User,
      },
    });
  } catch (error) {
    if (error instanceof ResponseError) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }

    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const handleLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true, // Selalu true untuk keamanan
    secure: true, // WAJIB true di production (HTTPS)
    sameSite: "None", // Diperlukan untuk cross-site
    path: "/", // Pastikan path sama dengan saat set cookie
  });

  res.status(200).json({ message: "Logged out successfully" });
};

const handleForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user)
      return res
        .status(400)
        .json({ status: false, message: "Email tidak ditemukan" });

    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET_KEY_PASS,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.APP_FRONTEND_URL}/reset-password?token=${token}`;
    // const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "📢 Permintaan Reset Password",
      html: sendResetEmail({ resetLink }),
    });

    res.json({
      status: true,
      message: "Link reset password telah dikirim ke email Anda",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const handleResetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY_PASS);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prismaClient.user.update({
      where: { user_id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ message: "Token tidak valid atau sudah kedaluwarsa" });
  }
};

module.exports = {
  handleRegister,
  handleLogin,
  handleLogout,
  handleForgetPassword,
  handleResetPassword,
};
