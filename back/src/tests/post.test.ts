import { Express } from 'express';
import request from 'supertest';
import User from '../models/User';
import Post from '../models/Post';

let app: Express;
let accessToken = '';

beforeAll(async () => {
  app = await global.initTestServer();
  await User.deleteMany({});
  await Post.deleteMany({});

  await request(app).post('/api/auth/register').send({
    username: 'postuser',
    email: 'post@test.com',
    password: 'password123',
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'post@test.com',
    password: 'password123',
  });

  const setCookie = (loginRes.get('Set-Cookie') as string[]) || [];
  const tokenCookie = setCookie.find(c => c.includes('accessToken'));
  if (tokenCookie) accessToken = tokenCookie.split('=')[1].split(';')[0];
});

afterAll(async () => {
  await global.closeTestServer();
});

describe('Post Endpoints - Deep Testing', () => {
  test('Create Post with Jersey Details - Success', async () => {
    const jerseyDetails = {
      team: 'Real Madrid',
      league: 'La Liga',
      price: 90,
      size: 'L'
    };

    const response = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', Buffer.from('fake-image'), 'jersey.jpg')
      .field('text', 'Check out this new jersey!')
      .field('jerseyDetails', JSON.stringify(jerseyDetails)); // השרת שלך מצפה ל-string ב-multipart

    expect(response.statusCode).toBe(201);
    expect(response.body.jerseyDetails.team).toBe('Real Madrid');
    expect(response.body.image).toBeDefined();
  });

  test('Get Posts - Pagination check', async () => {
    const response = await request(app).get('/api/post?page=1&limit=10');
    expect(response.statusCode).toBe(200);
    expect(response.body.posts).toBeInstanceOf(Array);
    expect(response.body.meta).toBeDefined();
  });
});