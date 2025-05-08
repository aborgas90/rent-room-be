const { ResponseError } = require("../../error/error-response");
const prismaClient = require("../../prisma-client");
const {
  findIdAdmin,
  findAllDataAdmin,
  createAdmin,
  deleteAdmin,
  updateAdmin,
  findIdUser,
  findAllDataUserMember,
  createUser,
  updateUser,
  deleteUser,
  findAllUsersQuery,
  resetPassword,
} = require("../../services/management-resource/user-management-service");

const handleFindIdUser = async (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  try {
    const result = await findIdUser({ id: parsedId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID ${id} tidak ditemukan.`,
      });
    }

    // Kalau ketemu, kirim data
    return res.status(200).json({
      message: "✅ User ditemukan!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetAllDataUserMember = async (req, res, next) => {
  try {
    const { roles } = req.user;
    console.log(roles);

    if (roles !== "super_admin" && roles !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Forbidden. You don't have permission to access this data.",
      });
    }

    const admin = await findAllDataUserMember();

    return res.status(200).json({
      message: "Successfull",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetAllUsersQuery = async (req, res, next) => {
  try {
    const { roles: userRoles } = req.user;
    const { role: filterRole } = req.query;

    // Permission check
    if (userRoles !== "super_admin" && userRoles !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Forbidden. You don't have permission to access this data.",
      });
    }

    const users = await findAllUsersQuery(filterRole);

    if (users.length === 0) {
      return res.status(200).json({
        status: true,
        message: filterRole
          ? `No users found with role '${filterRole}'`
          : "No users found",
        data: [],
      });
    }

    return res.status(200).json({
      status: true,
      message: filterRole
        ? `Successfully retrieved users with role '${filterRole}'`
        : "Successfully retrieved all users",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const handleCreateUser = async (req, res, next) => {
  const { name, email, password, nik, telephone, address, roles_name } =
    req.body;
  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    // 2. Kalau email sudah ada, lempar error
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email Already exists",
      });
    }

    const admin = await createUser({
      name,
      email,
      password,
      nik,
      telephone,
      address,
      roles_name,
    });
    return res.status(201).json({
      message: "Successfull",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdateUser = async (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  const { name, email, telephone, nik, address, roles_name } = req.body;
  try {
    if (!id) {
      throw new ResponseError(400, "Params id is required");
    }

    const existingUser = await prismaClient.user.findUnique({
      where: { user_id: parsedId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Id not Found",
      });
    }

    const result = await updateUser({
      id: parsedId,
      name,
      email,
      telephone,
      nik,
      address,
      roles_name,
    });
    return res.status(200).json({
      message: "✅ Update Successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteUser = async (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { user_id: parsedId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Id not Found",
      });
    }
    const user = await deleteUser({ id: parsedId });
    return res.status(200).json({
      message: "Delete User Successfull",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const { password } = req.body;
    const existingUser = await prismaClient.user.findUnique({
      where: { user_id: parsedId },
    });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Id not Found",
      });
    }
    const user = await resetPassword({
      id: parsedId,
      password,
    });

    return res.status(200).json({
      message: "Reset Password Successfull",
      data: [
        
      ],
    });
  } catch (error) {}
};

const handleFindIdAdmin = async (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  try {
    const admin = await findIdAdmin({ id: parsedId });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: `Admin dengan ID ${id} tidak ditemukan.`,
      });
    }

    // Kalau ketemu, kirim data
    return res.status(200).json({
      message: "✅ Admin ditemukan!",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetAllDataAdmin = async (req, res, next) => {
  const { user_id, name, roles } = req.user;
  console.log("Auth Header:", req.headers.authorization);
  console.log(user_id, name, roles, "requestttttt");

  try {
    const admin = await findAllDataAdmin();

    return res.status(200).json({
      message: "Successfull",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const handleCreateAdmin = async (req, res, next) => {
  const { name, email, password, roles_name } = req.body;
  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    // 2. Kalau email sudah ada, lempar error
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email Already exists",
      });
    }

    const admin = await createAdmin({ name, email, password, roles_name });

    return res.status(201).json({
      message: "Successfull",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdateAdmin = async (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  const { name, email, password, roles_name } = req.body;
  try {
    if (!id) {
      throw new ResponseError(400, "Params id is required");
    }

    const existingAdmin = await prismaClient.user.findUnique({
      where: { user_id: parsedId },
    });

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: "Id not Found",
      });
    }

    const admin = await updateAdmin({
      id: parsedId,
      name,
      email,
      password,
      roles_name,
    });
    return res.status(200).json({
      message: "✅ Update Successful",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteAdmin = async (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  try {
    const existingAdmin = await prismaClient.user.findUnique({
      where: { user_id: parsedId },
    });

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: "Id not Found",
      });
    }

    const admin = await deleteAdmin({ id: parsedId });
    return res.status(204).json({
      message: "Delete Admin Successfull",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleFindIdUser,
  handleGetAllDataUserMember,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleFindIdAdmin,
  handleGetAllDataAdmin,
  handleCreateAdmin,
  handleDeleteAdmin,
  handleUpdateAdmin,
  handleGetAllUsersQuery,
  handleResetPassword,
};
