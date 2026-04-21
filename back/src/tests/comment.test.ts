import { Express } from 'express';
import request from 'supertest';
import User from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';

let app: Express;
let accessToken = '';
let testPostId = '';

beforeAll(async () => {
  app = await global.initTestServer();
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});

  const regRes = await request(app).post('/api/auth/register').send({
    username: 'commenter',
    email: 'c@test.com',
    password: 'password123'
  });
  const userId = regRes.body.user?._id || regRes.body.user?.id;

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'c@test.com',
    password: 'password123'
  });

  const setCookie = (loginRes.get('Set-Cookie') as string[]) || [];
  const tokenCookie = setCookie.find(c => c.includes('accessToken'));
  if (tokenCookie) accessToken = tokenCookie.split('=')[1].split(';')[0];

  const jersey = { team: 'Milan', league: 'Serie A', price: 80, size: 'L' };
  const postRes = await request(app)
    .post('/api/post')
    .set('Authorization', `Bearer ${accessToken}`)
    .attach('image', Buffer.from('img'), 'a.jpg')
    .field('text', 'New post')
    .field('jerseyDetails', JSON.stringify(jersey))
    .field('sender', userId);
    
  testPostId = postRes.body._id;
});

afterAll(async () => {
  await global.closeTestServer();
});

describe('Comment Logic', () => {
  test('Create Comment and Verify Post Count', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        postId: testPostId,
        content: 'Awesome jersey!'
      });
    
    expect(res.statusCode).toBe(201);
    
    const postRes = await request(app).get(`/api/post/${testPostId}`);
    expect(postRes.body.commentsCount).toBe(1);
  });
});