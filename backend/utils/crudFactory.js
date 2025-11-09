/**
 * CRUD Factory
 * Generic CRUD operations for models
 */

const logger = require('./logger');

/**
 * Get all documents with pagination, filtering, and sorting
 */
exports.getAll = (Model, populateOptions = []) => async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Filtering
    const filter = { ...req.query };
    const excludedFields = ['page', 'limit', 'sortBy', 'sortOrder', 'search'];
    excludedFields.forEach(field => delete filter[field]);

    // Search
    if (req.query.search) {
      // Implement text search if needed
      filter.$text = { $search: req.query.search };
    }

    // Execute query
    let query = Model.find(filter).sort(sort).skip(skip).limit(limit);

    // Populate if needed
    if (populateOptions.length > 0) {
      populateOptions.forEach(option => {
        query = query.populate(option);
      });
    }

    const documents = await query;
    const total = await Model.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error(`Get all ${Model.modelName} error:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${Model.modelName}s`,
      error: error.message
    });
  }
};

/**
 * Get single document by ID
 */
exports.getOne = (Model, populateOptions = []) => async (req, res) => {
  try {
    let query = Model.findById(req.params.id);

    // Populate if needed
    if (populateOptions.length > 0) {
      populateOptions.forEach(option => {
        query = query.populate(option);
      });
    }

    const document = await query;

    if (!document) {
      return res.status(404).json({
        success: false,
        message: `${Model.modelName} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: { document }
    });
  } catch (error) {
    logger.error(`Get ${Model.modelName} error:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${Model.modelName}`,
      error: error.message
    });
  }
};

/**
 * Create new document
 */
exports.createOne = (Model) => async (req, res) => {
  try {
    const document = await Model.create({
      ...req.body,
      createdBy: req.user.id
    });

    logger.info(`${Model.modelName} created:`, document._id);

    res.status(201).json({
      success: true,
      message: `${Model.modelName} created successfully`,
      data: { document }
    });
  } catch (error) {
    logger.error(`Create ${Model.modelName} error:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to create ${Model.modelName}`,
      error: error.message
    });
  }
};

/**
 * Update document
 */
exports.updateOne = (Model) => async (req, res) => {
  try {
    const document = await Model.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user.id
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: `${Model.modelName} not found`
      });
    }

    logger.info(`${Model.modelName} updated:`, document._id);

    res.status(200).json({
      success: true,
      message: `${Model.modelName} updated successfully`,
      data: { document }
    });
  } catch (error) {
    logger.error(`Update ${Model.modelName} error:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to update ${Model.modelName}`,
      error: error.message
    });
  }
};

/**
 * Delete document
 */
exports.deleteOne = (Model) => async (req, res) => {
  try {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: `${Model.modelName} not found`
      });
    }

    logger.info(`${Model.modelName} deleted:`, document._id);

    res.status(200).json({
      success: true,
      message: `${Model.modelName} deleted successfully`
    });
  } catch (error) {
    logger.error(`Delete ${Model.modelName} error:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to delete ${Model.modelName}`,
      error: error.message
    });
  }
};

/**
 * Get statistics
 */
exports.getStats = (Model, statsConfig) => async (req, res) => {
  try {
    const stats = await Model.aggregate(statsConfig);

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error(`Get ${Model.modelName} stats error:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${Model.modelName} statistics`,
      error: error.message
    });
  }
};

