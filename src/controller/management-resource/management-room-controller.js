const {
  createRoom,
  getAllRoom,
  getByIdRoom,
  updateRoom,
  deleteRoom,
  getAllRoomPublic,
  getAllfacities,
} = require("../../services/management-resource/room-management-service");

const handleCreateRoom = async (req, res, next) => {
  const { user_id, name, roles } = req.user;
  const {
    room_number,
    price,
    status,
    description,
    facilities = [],
    bathType,
  } = req.body;

  try {
    const newRoom = await createRoom({
      room_number,
      price,
      status,
      description,
      bathType,
      owner_id: user_id,
      owner_name: name,
      facilities,
    });

    res.status(201).json({
      status: true,
      message: "Room successfully created",
      data: newRoom,
    });
  } catch (error) {
    console.error("Error handleCreateRoom:", error);
    next(error);
  }
};

const handleGetAllRoom = async (req, res, next) => {
  try {
    // Ambil page dan limit dari query params, kasih default kalau ga ada
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Hitung offset buat skip data
    const offset = (page - 1) * limit;

    // Panggil service yang udah support pagination
    const { rooms, total } = await getAllRoom({ limit, offset });

    res.status(200).json({
      status: true,
      message: "Get All Room Successfully",
      data: rooms,
      totalData: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error handleGetAllRoom: ", error);
    next(error);
  }
};

const handleGetAllRoomPublic = async (req, res, next) => {
  try {
    // Ambil page dan limit dari query params, kasih default kalau ga ada
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Hitung offset buat skip data
    const offset = (page - 1) * limit;

    // Panggil service yang udah support pagination
    const { rooms, total } = await getAllRoomPublic({ limit, offset });

    res.status(200).json({
      status: true,
      message: "Get All Room Successfully",
      data: rooms,
      totalData: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error handleGetAllRoom: ", error);
    next(error);
  }
};

const handleGetIdRoom = async (req, res, next) => {
  const { id } = req.params;
  const parseRoomId = parseInt(id, 10);
  try {
    if (isNaN(parseRoomId)) {
      return res.status(400).json({
        message: "room_id parameter is not a valid number",
      });
    }

    const findRoom = await getByIdRoom({ room_id: parseRoomId });

    if (!findRoom) {
      return res.status(404).json({
        status: false,
        message: `Room with ID ${parseRoomId} not found`,
      });
    }

    res.status(200).json({
      status: true,
      message: "Get By Id Successfully",
      data: findRoom,
    });
  } catch (error) {
    console.error("Error handleGetIdRoom: ", error);
    next(error);
  }
};

const handleUpdateRoom = async (req, res, next) => {
  const { id } = req.params;
  const {
    room_number,
    price,
    status,
    description,
    facilities = [], // default array kosong kalau gak ada
    bathType,
    owner_id,
    tenant_id,
  } = req.body;
  try {
    const update = await updateRoom({
      room_id: Number(id), // pastiin ID bentuk number
      room_number,
      price,
      status,
      description,
      facilities,
      bathType,
      owner_id,
      tenant_id,
    });

    res.status(200).json({
      status: true,
      message: "Update Successfull",
      data: update,
    });
  } catch (error) {
    console.error("error handleUpdateRoom", error);
    next(error);
  }
};

const handleDeleteRoom = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  try {
    const deleted = await deleteRoom({ room_id: parseInt(id) });
    console.log(deleted);

    res.status(200).json({
      status: true,
      message: "Room deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    next(error);
  }
};

const handleGetAllFacilities = async (req, res, next) => {
  try {
    const facilities = await getAllfacities();
    res.status(200).json({
      status: true,
      message: "Get All Facilities Successfully",
      data: facilities,
    });
  } catch (error) {
    console.error("Error handleGetAllFacilities:", error);
    next(error);
  }
};

module.exports = {
  handleCreateRoom,
  handleGetAllRoom,
  handleGetIdRoom,
  handleUpdateRoom,
  handleDeleteRoom,
  handleGetAllRoomPublic,
  handleGetAllFacilities,
};
