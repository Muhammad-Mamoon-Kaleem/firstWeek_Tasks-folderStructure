export function handleMongoError(error, res) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    return res.status(500).json({
        success: false,
        message: error.message
    });
}
