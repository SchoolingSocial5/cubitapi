import { Query } from 'mongoose';

interface PaginationResult {
    success: boolean;
    count: number;
    pagination: {
        next?: {
            page: number;
            limit: number;
        };
        prev?: {
            page: number;
            limit: number;
        };
        total: number;
        pages: number;
    };
    data: any[];
}

/**
 * Reusable pagination helper for Mongoose
 * @param model Mongoose model
 * @param populate Path to populate
 * @param req Express request object
 */
const paginate = async (
    model: any,
    req: any,
    populate?: string | any
): Promise<PaginationResult> => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = model.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    // Executing query
    const results = await query;

    // Pagination result
    const pagination: any = {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    };

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    return {
        success: true,
        count: results.length,
        pagination,
        data: results
    };
};

export default paginate;
