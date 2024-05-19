const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');
const Order = require('../model/orderSchema')
const Coupon = require('../model/couponSchema')
const Wallet = require('../model/walletSchema')



const walletCheck =  async (req, res) => {
    try {
       
        const userId = req.session.user_id; 
        
        
        const wallet = await Wallet.findOne({ user: userId });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

       
        res.json({ walletBalance: wallet.walletBalance });
    } catch (error) {
        console.error('Error checking wallet balance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const reducewallet = async (req, res) => {
    try {
      const { amount } = req.body;
      console.log(req.body,'kdieyiuofs')
      const userId = req.session.user_id;
      const wallet = await Wallet.findOne({ user: userId });
  
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
  
      if (wallet.walletBalance < amount) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
  
      wallet.walletBalance -= amount;
      wallet.amountSpent += amount;
      wallet.walletBalance = Number(wallet.walletBalance.toFixed(2));
      wallet.refundAmount = Number(wallet.walletBalance.toFixed(2));
  
      
      const newTransaction = {
        amount: -amount, 
        description: 'Product purchase',
        type: 'debit',
        transactionDate: new Date(),
      };
      wallet.transactions.push(newTransaction);
  
      await wallet.save();
  
      res.json({
        success: true,
        message: 'Wallet balance deducted successfully',
        walletBalance: wallet.walletBalance,
      });
    } catch (error) {
      console.error('Error deducting wallet balance:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };




module.exports = {
    walletCheck,
    reducewallet
}