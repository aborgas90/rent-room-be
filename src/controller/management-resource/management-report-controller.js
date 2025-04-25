const { getAllReport, getByIdReport, actionReport } = require("../../services/management-resource/report-management-service")

const handleGetAllReport = async (req, res, next) => {
    const {status} = req.query
    console.log(typeof(status))
    try {
        const allReport = await getAllReport({status})

        return  res.status(200).json({
            status: true,
            message: 'Success get all report',
            data : allReport
        })
    } catch (error) {
        next(error)
    }
}

const handleGetByIdReport = async (req, res, next) => {
    const {id} = req.params
    const parseId= parseInt(id,10)

    console.log(parseId, 'parsed ID ')
    try {
        const getReport = await getByIdReport({id: parseId})
        return res.status(200).json({
            status: true,
            message: 'Success get by id report',
            data: getReport
        })
    } catch (error) {
        next(error)
    }
}

const handleActionReport = async (req, res, next) => {
    const {id} = req.params
    const parseId= parseInt(id,10)

    try {
        const result = await actionReport({id: parseId})
        return res.status(200).json({
            status: true,
            message: `Success update by id report on id ${id}`,
            data: result
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    handleGetAllReport,
    handleGetByIdReport,
    handleActionReport
}