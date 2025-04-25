const { ResponseError } = require("../../error/error-response");
const prismaClient = require("../../prisma-client");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: [".env"] });
const jwt = require("jsonwebtoken");

const authentication = async ({ email, password }) => {
  try {
    const findUser = await findUserByEmail({ email });
    const User = await prismaClient.user.findUnique({
      where: {
        email,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        password: true,
        telephone: true,
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
    });

    if (!User) {
      throw new ResponseError(401, "User Not Found");
    }
    const isPasswordValid = await bcrypt.compare(password, findUser.password);

    if (!isPasswordValid) {
      throw new ResponseError(401, "Invalid Password");
    }

    const token = jwt.sign(
      {
        user_id: User.user_id,
        name: User.name,
        email: User.email,
        telephone: User.telephone,
        roles: User.User_Roles[0].Role.roles_name,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    console.log("Token created at login:", token);


    // Jangan kirim password ke response!
    delete User.password;

    // Ini yang akan dikirim ke controller/handler
    return {
      token,
      User,
    };
  } catch (error) {
    throw error;
  }
};

const logout = async ({ email }) => {
  const findUser = await prismaClient.user.findUnique(email);

  if (!userFinding) {
    throw new ResponseError(404, "User not found");
  }

  try {
  } catch (error) {
    throw error;
  }
};

const createUser = async ({ user_id, name, email, password, telephone, address }) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const createUser = await prismaClient.user.create({
      data: {
        user_id,
        name,
        email,
        password: passwordHash,
        telephone,
        address,
      },
    });

    await prismaClient.user_Roles.create({
      data : {
        user_id : createUser.user_id,
        roles_id: 2
      }
    })

    return createUser;
  } catch (error) {
    throw error;
  }
};

const findUserByEmail = async ({ email }) => {
  try {
    if (email) {
      const find = await prismaClient.user.findUnique({
        where: {
          email,
        },
      });

      return find;
    } else {
      throw new Error("Invalid parameters");
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
module.exports = {
  createUser,
  authentication,
  findUserByEmail,
  logout,
};
