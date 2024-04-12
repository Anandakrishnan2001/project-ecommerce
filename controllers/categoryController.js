
const Category = require('../model/categorySchema');

const categoryGet = async (req, res) => {
    try {
        const category = await Category.find({deleted: false})
        res.render('category', { category })
    } catch (error) {
        console.error("Error rendering Cateory: ", error);
        res.status(500).send('Internet Server Error');
    }
}

const addcategoryPost = async (req, res) => {
    try {
        const { name, status } = req.body;
        const cat_name =
            name.charAt(0).toUpperCase() +
            name.slice(1).toLowerCase();

        const catFound = await Category.findOne({
            name: { $regex: new RegExp(`^${cat_name}$`, "i") }, 
        });

        if (!catFound) {
            const newCategory = new Category({
                name: cat_name,
                status
            });
            await newCategory.save();
        }

        res.redirect('/admin/category');
    } catch (error) {
        console.log("Error occurred: ", error);
    }
}


const updatecategoryPost = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, status } = req.body;

        const updateCategory = await Category.findByIdAndUpdate(categoryId, { name, status }, { new: true });

        if (!updateCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        console.log("start")
        res.status(200).json({ success: true });
        console.log("finish")
    } catch (error) {
        console.log('Error Occurred: ', error);
        res.status(500).send('Internal Server Error'); // Send appropriate error response
    }
};
const deletecategoryPost = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        category.deleted = true;
        await category.save();
        res.redirect('/admin/category')
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
categoryGet,
addcategoryPost,
updatecategoryPost,
deletecategoryPost

}