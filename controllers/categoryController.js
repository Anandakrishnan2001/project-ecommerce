const Category = require("../model/categorySchema");

const category = async (req, res) => {
    try {
        // Fetch categories from the database excluding soft-deleted ones
        const categories = await Category.find({ status: { $ne: 'deleted' } });

        res.render('category', { categories });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).send('Error loading dashboard');
    }
}



const addCategory = async (req, res) => {
    try {
        const { name, status } = req.body;
        // Create a new category instance
        const newCategory = new Category({ name, status });
        // Save the new category to the database
        await newCategory.save();

        res.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ success: false, error: 'Error adding category' });
    }
}

const editCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { name, status } = req.body;

    try {
        // Update category in the database (use your actual database update logic)
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name, status }, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Send updated category as response (optional)
        res.json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

const softDeleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        // Soft delete the category by setting its status to 'deleted'
        await Category.findByIdAndUpdate(categoryId, { status: 'deleted' });

        res.redirect('/admin/category'); // Redirect to the category page after soft deleting
    } catch (error) {
        console.error('Error soft deleting category:', error);
        res.status(500).send('Error soft deleting category');
    }
}

module.exports = {
    category,
    addCategory,
    editCategory,
    softDeleteCategory
};
