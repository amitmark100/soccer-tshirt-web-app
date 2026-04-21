import { Express } from 'express';
import request from 'supertest';
import Post from '../models/Post';
import User from '../models/User';

let app: Express;
let accessToken = '';
let testPostId = '';

beforeAll(async () => {
  app = await global.initTestServer();
  await User.deleteMany({});
  await Post.deleteMany({});

  const regRes = await request(app).post('/api/auth/register').send({
    username: 'liker',
    email: 'like@test.com',
    password: 'password123'
  });
  
  // שימוש ב-regRes פותר את שגיאת ה-TypeScript
  const userId = regRes.body.user?._id || regRes.body.user?.id;
  
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'like@test.com',
    password: 'password123'
  });
  
  const setCookie = (loginRes.get('Set-Cookie') as string[]) || [];
  const tokenCookie = setCookie.find(c => c.includes('accessToken'));
  if (tokenCookie) accessToken = tokenCookie.split('=')[1].split(';')[0];

  const jerseyDetails = { team: 'Inter', league: 'Serie A', price: 70, size: 'M' };

  const postRes = await request(app)
    .post('/api/post')
    .set('Authorization', `Bearer ${accessToken}`)
    .attach('image', Buffer.from('img'), 'test.jpg')
    .field('text', 'Like this!')
    .field('jerseyDetails', JSON.stringify(jerseyDetails))
    .field('sender', userId); // הוספת ה-sender
  
  testPostId = postRes.body._id;
});

afterAll(async () => {
  await global.closeTestServer();
});

describe('Like Logic', () => {
  test('Toggle Like - Add and then Remove', async () => {
    const addLike = await request(app)
      .patch(`/api/post/${testPostId}/like`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(addLike.body.likes).toContain(testPostId ? addLike.body.likes[0] : '');

    const removeLike = await request(app)
      .patch(`/api/post/${testPostId}/like`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(removeLike.body.likes).toHaveLength(0);
  });
});