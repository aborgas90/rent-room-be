const { ResponseError } = require("../../error/error-response");

const bcrypt = require("bcrypt");
const prismaClient = require("../../prisma-client");

//Admin
const findIdAdmin = async ({ id }) => {
  console.log(typeof id, "service");
  try {
    const find = await prismaClient.user.findUnique({
      where: {
        user_id: id,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        password: true,
        User_Roles: {
          select: {
            Role: {
              select: {
                roles_id: true,
                roles_name: true,
              },
            },
          },
        },
      },
    });

    return find;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findAllDataAdmin = async () => {
  try {
    const adminUsers = await prismaClient.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        createdAt: true,
        User_Roles: {
          select: {
            Role: {
              select: {
                roles_name: true,
              },
            },
          },
        },
      },
      where: {
        User_Roles: {
          some: {
            Role: {
              roles_name: "admin",
            },
          },
        },
      },
    });

    const cleanResult = adminUsers.map((user) => {
      return {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        roles: user.User_Roles.map((ur) => ur.Role.roles_name),
      };
    });

    return cleanResult;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createAdmin = async ({ name, email, password, roles_name }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await prismaClient.roles.findUnique({
      where: {
        roles_name: roles_name,
      },
    });

    if (!role) {
      throw new ResponseError(`Role "${roles_name}" not found!`);
    }

    const create = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        User_Roles: {
          create: [
            {
              Role: {
                connect: { roles_id: role.roles_id },
              },
            },
          ],
        },
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        createdAt: true,
        User_Roles: {
          select: {
            Role: {
              select: { roles_name: true },
            },
          },
        },
      },
    });

    return {
      user_id: create.user_id,
      name: create.name,
      email: create.email,
      roles: create.User_Roles.map((userRole) => userRole.Role.roles_name),
    };
  } catch (error) {
    console.log("Error createAdmin:", error);
    throw error;
  }
};

const updateAdmin = async ({ id, name, email, password, roles_name }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update data user
    await prismaClient.user.update({
      where: { user_id: id },
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Update role user via raw query
    await updateUserRoleRaw({ user_id: id, roles_name });

    console.log(`✅ Admin ${id} updated successfully!`);
    return { message: "Admin updated successfully!" };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteAdmin = async ({ id }) => {
  try {
    await prismaClient.user_Roles.deleteMany({
      where: { user_id: id },
    });

    const deleteAdmin = await prismaClient.user.delete({
      where: { user_id: id },
    });

    console.log(`✅ Admin dengan user_id ${id} berhasil dihapus!`);
    return deleteAdmin;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//User
const findIdUser = async ({ id }) => {
  try {
    const find = await prismaClient.user.findUnique({
      where: {
        user_id: id,
        User_Roles: {
          some: {
            Role: {
              roles_name: "member",
            },
          },
        },
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        User_Roles: {
          select: {
            Role: {
              select: {
                roles_id: true,
                roles_name: true,
              },
            },
          },
        },
      },
    });

    return find;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findAllUsersQuery = async (roleFilter) => {
  try {
    // Build the where clause conditionally
    const whereClause = roleFilter
      ? {
          User_Roles: {
            some: {
              Role: {
                roles_name: roleFilter,
              },
            },
          },
        }
      : {}; // Empty where clause returns all users

    const users = await prismaClient.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        telephone: true,
        nik: true,
        address: true,
        createdAt: true,
        User_Roles: {
          select: {
            Role: {
              select: {
                roles_name: true,
              },
            },
          },
        },
      },
      where: whereClause,
    });

    // Format the result
    const result = users.map((user) => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      telephone: user.telephone,
      nik: user.nik,
      address: user.address,
      createdAt: user.createdAt,
      roles: user.User_Roles.map((ur) => ur.Role.roles_name),
    }));

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findAllDataUserMember = async () => {
  try {
    const adminUsers = await prismaClient.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        telephone: true,
        nik: true,
        address: true,
        createdAt: true,
        User_Roles: {
          select: {
            Role: {
              select: {
                roles_name: true,
              },
            },
          },
        },
      },
      where: {
        User_Roles: {
          some: {
            Role: {
              roles_name: "member",
            },
          },
        },
      },
    });

    const result = adminUsers.map((user) => {
      return {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        nik: user.nik,
        address: user.address,
        createdAt: user.createdAt,
        roles: user.User_Roles.map((ur) => ur.Role.roles_name),
      };
    });

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createUser = async ({
  name,
  email,
  password,
  nik,
  telephone,
  address,
  roles_name,
}) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await prismaClient.roles.findUnique({
      where: {
        roles_name: roles_name,
      },
    });

    if (!role) {
      throw new ResponseError(`Role "${roles_name}" not found!`);
    }

    const create = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        nik,
        telephone,
        address,
        User_Roles: {
          create: [
            {
              Role: {
                connect: { roles_id: role.roles_id },
              },
            },
          ],
        },
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        createdAt: true,
        User_Roles: {
          select: {
            Role: {
              select: { roles_name: true },
            },
          },
        },
      },
    });

    return {
      user_id: create.user_id,
      name: create.name,
      email: create.email,
      roles: create.User_Roles.map((userRole) => userRole.Role.roles_name),
    };
  } catch (error) {
    console.log("Error createAdmin:", error);
    throw error;
  }
};

const updateUser = async ({
  id,
  name,
  email,
  // password,
  telephone,
  nik,
  address,
  roles_name,
}) => {
  try {
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Update data user
    await prismaClient.user.update({
      where: { user_id: id },
      data: {
        name,
        email,
        telephone,
        nik,
        address,
        // password: hashedPassword,
      },
    });

    // Update role user via raw query
    await updateUserRoleRaw({ user_id: id, roles_name });

    console.log(`✅ User ${id} updated successfully!`);
    return { message: "User updated successfully!" };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUserRoleRaw = async ({ user_id, roles_name }) => {
  try {
    const role = await prismaClient.roles.findUnique({
      where: { roles_name },
    });

    if (!role) {
      throw new Error(`Role "${roles_name}" not found!`);
    }

    const result = await prismaClient.$executeRaw`
        UPDATE User_Roles
        SET roles_id = ${role.roles_id}
        WHERE user_id = ${user_id};
      `;

    console.log(`✅ User ${user_id} role updated to "${roles_name}"`);
    return result;
  } catch (error) {
    console.error("❌ Error updating user role:", error.message);
    throw error;
  }
};

const deleteUser = async ({ id }) => {
  try {
    await prismaClient.user_Roles.deleteMany({
      where: { user_id: id },
    });

    const deleteAdmin = await prismaClient.user.delete({
      where: { user_id: id },
    });

    console.log(`✅ Admin dengan user_id ${id} berhasil dihapus!`);
    return deleteAdmin;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const resetPassword = async ({ id, password }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const update = await prismaClient.user.update({
      where: { user_id: id },
      data: { password: hashedPassword },
    });

    return update;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


module.exports = {
  findIdUser,
  findAllDataUserMember,
  createUser,
  updateUser,
  deleteUser,
  findIdAdmin,
  findAllDataAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  findAllUsersQuery,
  resetPassword
};
