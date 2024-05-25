const User = require('../model/userSchema');
const Order = require('../model/orderSchema');
const Product = require('../model/productSchema');
const Category = require('../model/categorySchema')
const bcrypt = require('bcrypt');

const adminlogin = async (req, res) => {
    try {
        res.render('adminlogin');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading admin login page');
        
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
 
        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('adminlogin');
                } else {
                    req.session.user_id = userData._id;
                    
                    res.redirect('/admin/dashboard');
                }
            } else {
                res.render('adminlogin', { message: "Email or password is incorrect" });
            }
        } else {
            res.render('adminlogin', { message: "You are not the admin" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error verifying admin login');
        
    }
}

const dashboard = async (req, res) => {
    try {
        const products = await Product.find({status:'active'})
        const deliveredOrders = await Order.find({ orderStatus: 'Delivered' });

       
        const totalRevenue = deliveredOrders.reduce((total, order) => total + order.billTotal, 0);

        const orderCount = deliveredOrders.length;
        const productCount = products.length;

        
        res.render('dashboard', { totalRevenue, orderCount,productCount });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading dashboard');
    }
}



const dashboardgraph = async (req, res) => {
  const timePeriod = req.query.timePeriod;
  console.log(timePeriod, 'timeperiod');

  const getOrdersData = async () => {
    const currentDate = new Date();
    const startDate = new Date();

    switch (timePeriod) {
      case 'weekly':
        startDate.setDate(currentDate.getDate() - 6); // Including today
        break;
      case 'monthly':
        startDate.setMonth(currentDate.getMonth() - 11); // Last 12 months
        break;
      case 'yearly':
        startDate.setFullYear(currentDate.getFullYear() - 4); // Last 5 years
        break;
      default:
        throw new Error('Invalid time period');
    }

    const orders = await Order.aggregate([
      {
        $match: {
          orderStatus: 'Delivered',
          orderDate: { $gte: startDate, $lte: currentDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: timePeriod === 'weekly' ? '%Y-%m-%d' : timePeriod === 'monthly' ? '%Y-%m' : '%Y',
              date: '$orderDate'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);

    const formattedOrders = orders.map(order => ({
      label: order._id,
      count: order.count
    }));

    return formattedOrders;
  };

  try {
    const ordersData = await getOrdersData();
    console.log(ordersData, 'ordersData');
    res.json(ordersData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




const categorygraph = async (req, res) => {
  try {
    const topCategories = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } }, // Filter only delivered orders
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $addFields: {
          'productDetails.category': { $toObjectId: '$productDetails.category' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails._id',
          categoryName: { $first: '$categoryDetails.name' },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          category: '$categoryName',
          count: 1,
          _id: 0
        }
      }
    ]);

    console.log(topCategories, 'topcategories is coming');
    res.json(topCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};







const  productgraph = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } }, // Filter only delivered orders
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails._id',
          productName: { $first: '$productDetails.name' },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          product: '$productName',
          count: 1,
          _id: 0
        }
      }
    ]);

    console.log(topProducts, 'topProducts is coming');
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const orderdetail = async (req, res) => {
    try {
      const id = req.params.id;
      const order = await Order.findById(id);
      const orders = [order];
      console.log(orders, 'kill');
      res.render('orderdetail', { orders });
    } catch (error) {
      console.log(error);
    }
  };


const pagenotfound = async(req,res)=>{
    res.render('pagenotfound')
}



module.exports = {
    adminlogin,
    verifyLogin,
    dashboard,
    pagenotfound,
    orderdetail ,
    dashboardgraph,
    categorygraph,
    productgraph
}
