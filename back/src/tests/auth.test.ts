import { Express } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import User from '../models/User';

let app: Express;
let accessToken = '';

const testUserInfo = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123',
};

beforeAll(async () => {
  app = await global.initTestServer();
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await global.closeTestServer();
});

const baseUrl = '/api/auth';

describe('Auth Endpoints', () => {
  test('Register - should create a new user', async () => {
    const response = await request(app)
      .post(baseUrl + '/register')
      .send(testUserInfo);

    expect(response.statusCode).toBe(201);
    expect(response.body.user).toMatchObject({
        username: testUserInfo.username,
        email: testUserInfo.email,
    });
  });

  test('Login - should return tokens in cookies', async () => {
    const response = await request(app)
      .post(baseUrl + '/login')
      .send({
        email: testUserInfo.email,
        password: testUserInfo.password,
      });

    expect(response.statusCode).toBe(200);
    
    const setCookie = (response.get('Set-Cookie') as string[]) || [];
    expect(setCookie.some((cookie: string) => cookie.includes('accessToken'))).toBe(true);

    const accessTokenCookie = setCookie.find((cookie: string) => cookie.includes('accessToken'));
    if (accessTokenCookie) accessToken = accessTokenCookie.split('=')[1].split(';')[0];
  });

  test('Get current user - should work with valid token', async () => {
    const response = await request(app)
      .get(baseUrl + '/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user.email).toBe(testUserInfo.email);
  });
});