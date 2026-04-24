/**
 * Database configuration file
 * Handles MongoDB connection using Mongoose ODM
 */

import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB database
 * @returns {Promise<mongoose.Connection>} MongoDB connection object
 * @throws {Error} If connection fails, exits the process
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB using connection string from environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure code if database connection fails
    process.exit(1);
  }
};

export default connectDB;
