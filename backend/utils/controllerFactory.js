/**
 * Controller Factory
 * Creates CRUD controllers for any model
 */

const controllerFactory = (Model) => {
  return {
    // Get all
    getAll: async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const query = {};
        if (req.query.search) {
          query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { code: { $regex: req.query.search, $options: 'i' } }
          ];
        }

        const documents = await Model.find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean();

        const total = await Model.countDocuments(query);

        res.json({
          success: true,
          data: documents,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    // Get by ID
    getById: async (req, res) => {
      try {
        const document = await Model.findById(req.params.id).lean();
        if (!document) {
          return res.status(404).json({ success: false, message: 'Not found' });
        }
        res.json({ success: true, data: document });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    // Create
    create: async (req, res) => {
      try {
        const document = await Model.create(req.body);
        res.status(201).json({ success: true, message: 'Created successfully', data: document });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    // Update
    update: async (req, res) => {
      try {
        const document = await Model.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );
        if (!document) {
          return res.status(404).json({ success: false, message: 'Not found' });
        }
        res.json({ success: true, message: 'Updated successfully', data: document });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    // Delete
    delete: async (req, res) => {
      try {
        const document = await Model.findByIdAndDelete(req.params.id);
        if (!document) {
          return res.status(404).json({ success: false, message: 'Not found' });
        }
        res.json({ success: true, message: 'Deleted successfully' });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };
};

module.exports = controllerFactory;

