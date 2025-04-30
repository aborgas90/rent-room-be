const prismaClient = require("../../prisma-client");
const {
  createUser,
  authentication,
} = require("../../services/auth/auth-services");

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

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax", // or 'Strict' if needed
      secure: false, // true if using HTTPS
      maxAge: 60 * 60 * 1000, // 1 hour
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
    next(error);
  }
};

const handleLogout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  handleRegister,
  handleLogin,
  handleLogout
};
