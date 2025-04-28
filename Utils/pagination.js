import mongoose from 'mongoose';

const paginate = async (model, id_tofilter, page = 1, limit = 5, sort = { createdAt: -1 }) => {
    const skip = (page - 1) * limit;

    const totalItems = await model.countDocuments(id_tofilter);  
    const data = await model.find(id_tofilter)
        .skip(skip)
        .limit(limit)
        .sort(sort);  

    return {
        totalItems,
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        data,
    };
};

export default paginate;
