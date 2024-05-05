const Coupon = require('../model/couponSchema')


const coupon = async (req,res)=>{
    try {
        res.render('coupon')
    } catch (error) {
        console.log(error)
    }
}

 const getcoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons' });
    }
};

const addcoupon =  async (req, res) => {
    const { name, startDate, endDate, minimumAmount, maximumAmount, discount, couponCode } = req.body;

    try {
        const newCoupon = new Coupon({
            name,
            startDate,
            endDate,
            minimumAmount,
            maximumAmount,
            discount,
            couponCode
        });

        await newCoupon.save();
        res.status(201).json({ message: 'Coupon created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon' });
    }
};

const updatecoupon= async (req, res) => {
    const { name, startDate, endDate, minimumAmount, maximumAmount, discount, couponCode } = req.body;

    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, {
            name,
            startDate,
            endDate,
            minimumAmount,
            maximumAmount,
            discount,
            couponCode
        });

        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json({ message: 'Coupon updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon' });
    }
};


const deletecoupon =  async (req, res) => {
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!deletedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon' });
    }
};


 const getcouponsupdate = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json(coupon); 
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupon details' });
    }
};

const applycoupon = async (req, res) => {
    const { couponId, totalAmount } = req.body;
    console.log(couponId,totalAmount, 'kill');
  
    try {
      const coupon = await Coupon.findById(couponId);
  
      if (!coupon || coupon.status !== 'Active') {
        return res.json({ success: false, message: 'Coupon not found or inactive' });
      }
  
      const currentDate = new Date();
      if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
        return res.json({ success: false, message: 'Coupon has expired' });
      }
  
    //   const isCouponApplied = coupon.users.includes(req.session.user_id);
    //   if (isCouponApplied) {
    //     return res.json({ success: false, message: 'Coupon is already applied' });
    //   }
  
     
      if (totalAmount < coupon.minimumAmount) {
        return res.json({ success: false, message: `Minimum purchase amount required: ${coupon.minimumAmount}` });
      }
  
      
      const discountAmount = Math.min(totalAmount * (coupon.discount / 100), coupon.maximumAmount);
  
      
      coupon.users.push(req.session.user_id);
      await coupon.save();
  
      res.json({ success: true, discountAmount, message: 'Coupon applied successfully' });
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };

module.exports = {
    coupon,
    getcoupon,
    addcoupon,
    updatecoupon,
    deletecoupon,
    getcouponsupdate,
    applycoupon
}