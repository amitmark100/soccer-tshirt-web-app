import { Express } from 'express';
import mongoose from 'mongoose';
import { initApp } from '../index';

process.env.NODE_ENV = 'test';

declare global {
  var initTestServer: () => Promise<Express>;
  var closeTestServer: () => Promise<void>;
}

let appInstance: Express | null = null;
let serverInstance: any = null;

global.initTestServer = async (): Promise<Express> => {
  if (!appInstance) {
    const res = await initApp();
    appInstance = res.app;
    serverInstance = res.server;
  }
  return appInstance!;
};

global.closeTestServer = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (serverInstance && serverInstance.close) {
    await new Promise<void>((resolve) => {
      serverInstance.close(() => resolve());
    });
  }
};