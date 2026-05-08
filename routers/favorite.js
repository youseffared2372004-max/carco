const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Favorite = require('../models/Favorite'); // تأكد من إنشاء الموديل الذي صممناه سابقاً
const { verifyToken } = require('../middleware/auth');

// 1. إضافة أو حذف منتج من المفضلة (Toggle)
// [POST] /api/favorites/toggle
router.post('/toggle', verifyToken, asyncHandler(async (req, res) => {
    const { productId, productModel } = req.body;
    const userId = req.user.id;

    if (!productId || !productModel) {
        return res.status(400).json({ message: "البيانات غير مكتملة (productId, productModel)" });
    }

    // البحث عن العنصر في مفضلة المستخدم
    const existingFav = await Favorite.findOne({ user: userId, productId });

    if (existingFav) {
        // إذا كان موجوداً، نقوم بحذفه
        await Favorite.deleteOne({ _id: existingFav._id });
        return res.status(200).json({ 
            success: true, 
            message: "تمت الإزالة من المفضلة", 
            isFavorite: false 
        });
    }

    // إذا لم يكن موجوداً، نقوم بإضافته
    const newFav = new Favorite({
        user: userId,
        productId,
        productModel
    });

    await newFav.save();
    res.status(201).json({ 
        success: true, 
        message: "تمت الإضافة للمفضلة", 
        isFavorite: true 
    });
}));

// 2. جلب كافة مفضلات المستخدم الحالي
// [GET] /api/favorites
router.get('/', verifyToken, asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ user: req.user.id })
        .populate('productId') // سيجلب بيانات السيارة من Car أو Caruser تلقائياً
        .sort({ createdAt: -1 });

    res.status(200).json({ 
        success: true, 
        count: favorites.length, 
        favorites 
    });
}));

// 3. التحقق من وجود منتج معين في المفضلة (مفيد جداً لزر القلب في Angular)
// [GET] /api/favorites/check/:productId
router.get('/check/:productId', verifyToken, asyncHandler(async (req, res) => {
    const isFav = await Favorite.exists({ 
        user: req.user.id, 
        productId: req.params.productId 
    });

    res.status(200).json({ 
        success: true, 
        isFavorite: !!isFav 
    });
}));

// 1. حذف عنصر واحد محدد عن طريق الـ ID
// [DELETE] /api/favorites/remove/:productId
router.delete('/remove/:productId', verifyToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await Favorite.findOneAndDelete({ user: userId, productId: productId });

    if (!result) {
        return res.status(404).json({ message: "هذا العنصر غير موجود في مفضلتك" });
    }

    res.status(200).json({ success: true, message: "تمت الإزالة من المفضلة" });
}));

// 2. مسح كل المفضلة للمستخدم الحالي
// [DELETE] /api/favorites/clear-all
router.delete('/clear-all', verifyToken, asyncHandler(async (req, res) => {
    await Favorite.deleteMany({ user: req.user.id });
    res.status(200).json({ success: true, message: "تم تنظيف قائمة المفضلة بالكامل" });
}));


module.exports = router;