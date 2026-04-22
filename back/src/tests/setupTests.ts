import { Express } from 'express';
import mongoose from 'mongoose';
import { initApp } from '../index';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/soccer_store_test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


declare global {
  var initTestServer: () => Promise<Express>;
  var closeTestServer: () => Promise<void>;
}

let appInstance: Express | null = null;

global.initTestServer = async (): Promise<Express> => {
  if (!appInstance) {
    const res = await initApp();
    appInstance = res.app;
  }
  return appInstance!;
};

global.closeTestServer = async (): Promise<void> => {
  // סגירת החיבור למונגו
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};