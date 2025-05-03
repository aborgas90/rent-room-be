const prismaClient = require("../../prisma-client");

const createRoom = async ({
  room_number,
  price,
  status,
  description,
  facilities = [],
  bathType,
  owner_id,
  owner_name,
}) => {
  try {
    // Step 1: Create Room
    const room = await prismaClient.room.create({
      data: {
        room_number,
        price,
        status,
        description,
        bathroomType: bathType,
        owner_id,
        owner_name,
      },
      select: {
        room_id: true,
      },
    });

    if (facilities.length > 0) {
      const roomFacilities = facilities.map((facilityId) => ({
        roomId: room.room_id, // ✅ camelCase sesuai Prisma
        facilityId: facilityId, // ✅ camelCase sesuai Prisma
      }));

      console.log(roomFacilities);

      await prismaClient.roomFacility.createMany({
        data: roomFacilities,
      });
    }
    const result = await prismaClient.room.findUnique({
      where: { room_id: room.room_id },
      include: {
        owner: {
          select: {
            user_id: true,
            name: true,
          },
        },
        roomFacilities: {
          include: {
            facility: {
              select: {
                facility_id: true,
                facilities_name: true,
              },
            },
          },
        },
      },
    });

    return result;
  } catch (error) {
    console.error("Error create room (explicit):", error);
    throw error;
  }
};

const getAllRoom = async ({ offset, limit }) => {
  try {
    const total = await prismaClient.room.count();

    const roomsData = await prismaClient.room.findMany({
      skip: offset,
      take: limit,
      include: {
        roomFacilities: {
          include: {
            facility: true,
          },
        },
        owner: {
          select: {
            user_id: true,
            name: true,
          },
        },
        tenant: {
          select: {
            user_id: true,
            name: true,
            email: true,
            telephone: true,
          },
        },
        payments: true,
      },
    });

    const rooms = roomsData.map((room) => {
      const facilities = room.roomFacilities.map((rf) => rf.facility);
      const { roomFacilities, ...restRoom } = room;

      return {
        ...restRoom,
        facilities,
      };
    });

    return { rooms, total };
  } catch (error) {
    console.log("Error get all data room :", error);
    throw error;
  }
};

const getAllRoomPublic = async ({ offset, limit }) => {
  try {
    const total = await prismaClient.room.count();

    const roomsData = await prismaClient.room.findMany({
      skip: offset,
      take: limit,
      include: {
        roomFacilities: {
          include: {
            facility: true,
          },
        },
        owner: {
          select: {
            user_id: true,
            name: true,
          },
        },
      },
    });

    const rooms = roomsData.map((room) => {
      const facilities = room.roomFacilities.map((rf) => rf.facility);
      const { roomFacilities, ...restRoom } = room;

      return {
        ...restRoom,
        facilities,
      };
    });

    return { rooms, total };
  } catch (error) {
    console.log("Error get all data room :", error);
    throw error;
  }
};

const getByIdRoom = async ({ room_id }) => {
  try {
    const roomData = await prismaClient.room.findUnique({
      where: {
        room_id: room_id,
      },
      include: {
        roomFacilities: {
          include: {
            facility: true,
          },
        },
        owner: {
          select: {
            user_id: true,
            name: true,
          },
        },
        tenant: true,
        payments: true,
      },
    });

    if (!roomData) {
      throw new Error("Room not found");
    }

    // Ambil daftar fasilitas langsung
    const facilities = roomData.roomFacilities.map((rf) => rf.facility);

    // Return tanpa roomFacilities
    const { roomFacilities, ...roomWithoutRoomFacilities } = roomData;

    return {
      ...roomWithoutRoomFacilities,
      facilities,
    };
  } catch (error) {
    console.log("Error get room by id:", error);
    throw error;
  }
};

const updateRoom = async ({
  room_id,
  room_number,
  price,
  status,
  description,
  facilities = [],
  bathType,
  owner_id,
  owner_name, // opsional, di schema room ga ada owner_name kalo mau bisa update field manual
  tenant_id,
  tenant_name, // sama kaya owner_name, cek schema mu
}) => {
  try {
    const existingRoom = await prismaClient.room.findUnique({
      where: { room_id },
    });

    if (!existingRoom) {
      throw new Error(`Room with id ${room_id} not found`);
    }

    const updatedRoom = await prismaClient.room.update({
      where: { room_id },
      data: {
        room_number,
        price,
        status,
        description,
        bathroomType: bathType,
        owner_id,
        owner_name,
        tenant_id,
      },
    });

    if (facilities.length > 0) {
      await prismaClient.roomFacility.deleteMany({
        where: { roomId: room_id },
      });

      const newFacilities = facilities.map((facilityId) => ({
        roomId: room_id,
        facilityId: facilityId,
      }));

      await prismaClient.roomFacility.createMany({
        data: newFacilities,
      });
    }

    return updatedRoom;
  } catch (error) {
    console.log("Error update room by id:", error);
    throw error;
  }
};

const deleteRoom = async ({ room_id }) => {
  try {
    const deletedRoom = await prismaClient.room.update({
      where: { room_id },
      data: { is_deleted: true },
    });
    return deletedRoom;
  } catch (error) {
    throw error;
  }
};

const getAllfacities = async () => {
  try {
    const facilities = await prismaClient.facility.findMany();
    return facilities;
  } catch (error) {
    console.error("Error get all data facilities :", error);
    throw error;
  }
};

module.exports = {
  createRoom,
  getAllRoom,
  getByIdRoom,
  updateRoom,
  deleteRoom,
  getAllRoomPublic,
  getAllfacities
};
