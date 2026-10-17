import mongoose from 'mongoose';

let connectionPromise;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  // Reuse one connection attempt across requests handled by a warm serverless instance.
  if (mongoose.connection.readyState === 0) connectionPromise = undefined;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri)
      .then(connection => {
        console.log(`MongoDB connected: ${mongoose.connection.name}`);
        return connection;
      })
      .catch(error => {
        connectionPromise = undefined;
        throw error;
      });
  }

  await connectionPromise;
  return mongoose.connection;
}
