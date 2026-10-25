const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fittrack';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`\n=============================================`);
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`=============================================\n`);
    return conn;
  } catch (error) {
    console.error(`\n=============================================`);
    console.error(`🔴 MongoDB Connection Error: ${error.message}`);
    console.error(`---------------------------------------------`);
    console.error(`💡 Setup Instructions:`);
    console.error(`   Option A - Local MongoDB:`);
    console.error(`   Ensure MongoDB Community Server is installed and running on port 27017.`);
    console.error(`   Run 'mongod' or start MongoDB service from Windows Services.`);
    console.error(`\n   Option B - MongoDB Atlas (Cloud Free Tier):`);
    console.error(`   1. Create a free cluster at https://cloud.mongodb.com`);
    console.error(`   2. In .env, update MONGODB_URI with your Atlas connection string:`);
    console.error(`      MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/fittrack?retryWrites=true&w=majority`);
    console.error(`=============================================\n`);
    return null;
  }
};

module.exports = connectDB;
