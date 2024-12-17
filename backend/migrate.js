const mongoose = require("mongoose");  
const Order = require("./models/Order");  
const Product = require("./models/Product");  

// Script migrasi (bisa dijalankan sekali)  
const migrateSoldCount = async () => {  
  try {  
    // Koneksi ke database  
    await mongoose.connect("mongodb://127.0.0.1:27017/e-commerce", {  
      useNewUrlParser: true,  
      useUnifiedTopology: true,  
    });  

    // Ambil semua order  
    const orders = await Order.find();  

    // Objek untuk menyimpan total penjualan per produk  
    const productSales = {};  

    // Hitung total penjualan per produk  
    orders.forEach((order) => {  
      order.items.forEach((item) => {  
        const productId = item.productId.toString();  
        const quantity = item.quantity;  

        if (!productSales[productId]) {  
          productSales[productId] = 0;  
        }  
        productSales[productId] += quantity;  
      });  
    });  

    // Update soldCount untuk setiap produk  
    for (let [productId, soldCount] of Object.entries(productSales)) {  
      await Product.findByIdAndUpdate(productId, { soldCount }, { new: true });  
    }  

    console.log("Migrasi soldCount selesai");  
  } catch (error) {  
    console.error("Error migrasi:", error);  
  } finally {  
    // Tutup koneksi database  
    mongoose.connection.close();  
  }  
};  

// Jalankan migrasi  
migrateSoldCount();