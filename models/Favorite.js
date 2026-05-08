const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  // الشخص اللي عمل المفضلة
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // معرف المنتج (سواء كان سيارة معرض أو سيارة مستخدم)
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'productModel' 
  },
  
  // بنحدد هنا الموديل اللي هنـ Fetch منه البيانات (زي ما عملت في الـ Order)
  productModel: { 
    type: String, 
    enum: ['Car', 'Caruser'], 
    required: true 
  },

  addedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// عمل Index لضمان أن المستخدم لا يضيف نفس المنتج للمفضلة مرتين
favoriteSchema.index({ user: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);