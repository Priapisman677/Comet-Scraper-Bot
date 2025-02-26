// prettier-ignore
import { describe, it, expect, vi, beforeEach, afterAll, test, beforeAll } from "vitest";
import request from 'supertest';
import app, { prisma } from '../../src/app-setup.ts';
import comet from '../../src/utils/crypto/index.ts';


/**
 *  How JWT Authentication Works in This Test Setup
 *
 * This test suite follows a **stateless approach** where each test run begins 
 * with a clean database state. The process works as follows:
 *
 * 1️⃣ Before tests start (`beforeAll`), any existing users matching test emails 
 *    are deleted to ensure no leftover data affects the test results.
 *
 * 2️⃣ A **new test user** is created in the database for each test run. 
 *    Since the **user ID changes every time**, the generated JWT token will 
 *    always be different.
 *
 * 3️⃣ When a user logs in or signs up, a **JWT token is issued**, signed using 
 *    the HMAC secret key stored in the environment variables (`HMAC_SECRT_KEY`).
 *    The token payload contains the `userId`, ensuring authentication is user-specific.
 *
 * 4️⃣ Middleware tests verify that:
 *    - A **valid token** allows access to protected routes.
 *    - A **tampered token** results in a 401 Unauthorized error.
 *    - **Missing tokens** prevent access to protected endpoints.
 *
 *  **Stateless Design Benefits**
 * - Each test runs **independently** without relying on previous test data.
 * - JWTs are **always different** due to dynamic user creation.
 * - The database remains clean after tests, ensuring **consistent results**.
 */





// User entity used across tests (re-created in a stateless manner)
let user;

// Delete any existing users before tests to ensure clean, stateless runs
beforeAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['example@one.com', 'Exapmle@two.com'],
      },
    },
  });

  // Create a new user; the generated token will differ each time because user ID changes
  const salt = comet.cometGetRandomSalt();
  user = await prisma.user.create({
    data: {
      email: 'Exapmle@two.com',
      username: 'constructor',
      password: comet.cometHash('ExamplePassword', salt),
      salt: salt,
    },
  });
});

describe('users/login /', () => {
  test('Should Be able to log in', async () => {
    const result = await request(app)
      .get('/users/login')
      .send({
        email: 'Exapmle@two.com',
        password: 'ExamplePassword',
      })
      .set('Content-Type', 'application/json')
      .expect(200);

    console.log(result.body);

    // Token validation: starts with the JWT header/payload format (always different user ID)
    expect(
      result.body.token.startsWith(
        'eyJhbGciOiJIUzI1NiIsInR5cGUiOiJqd3QifQ.eyJ1c2VySWQiOj'
      )
    ).toBe(true);
  });

  test('Should receive an error if password is incorrect (users/login)', async () => {
    const result = await request(app)
      .get('/users/login')
      .send({
        email: 'Exapmle@two.com',
        password: 'aldkñaldk',
      })
      .set('Content-Type', 'application/json')
      .expect(400);

    console.log(result.body);
    expect(result.body).toEqual({
      error: null,
      errorCode: 1003,
      error_message: 'Invalid password',
    });
  });

  test('Should receive an error if body for /users/login is empty', async () => {
    const result = await request(app)
      .get('/users/login')
      .send({})
      .set('Content-Type', 'application/json');

    expect(result.body).toEqual({
      error_message: 'Unprocessable entity',
      errorCode: 1004,
      error: ['Please provide an email', 'Please provide a password'],
    });
  });

  test('Should receive an error if credentials are empty', async () => {
    const result = await request(app)
      .get('/users/login')
      .send({ email: '', password: '' })
      .set('Content-Type', 'application/json');

    expect(result.body).toEqual({
      error_message: 'Unprocessable entity',
      errorCode: 1004,
      error: ['Email cannot be empty', 'Password cannot be empty'],
    });
  });
});

describe('Signup /', () => {
  test('Should receive an error if trying to take existing user', async () => {
    const result = await request(app)
      .post('/users/signup')
      .send({
        email: 'Exapmle@two.com',
        password: 'ExamplePassword',
        username: 'Constructor',
      })
      .set('Content-Type', 'application/json')
      .expect(400);

    expect(result.body).toEqual({
      error_message: 'User already exists',
      errorCode: 1002,
      error: null,
    });
  });

  test('Should be able to sign up successfully', async () => {
    const result = await request(app)
      .post('/users/signup')
      .send({
        email: 'example@one.com',
        password: 'ExamplePassword',
        username: 'Constructor',
      })
      .set('Content-Type', 'application/json')
      .expect(200);

    console.log(result.body);

    // Token reflects new user ID each run (stateless approach)
    expect(
      result.body.token.startsWith(
        'eyJhbGciOiJIUzI1NiIsInR5cGUiOiJqd3QifQ'
      )
    ).toBe(true);
  });

  test('Should trigger precise validation error', async () => {
    const result = await request(app)
      .post('/users/signup')
      .send({
        email: 'example@one.com',
        password: 'Carbo',
        username: 'Constructor',
      })
      .set('Content-Type', 'application/json');

    expect(result.body.error[0]).toBe(
      'Password must be at least 6 characters long'
    );
  });
});

describe('Middleware /', () => {
  test('Authorization middleware should work', async () => {
    // Generate a valid token from the newly created user
    if (!process.env.HMAC_SECRT_KEY) {
      console.error('Please set a secret key in the .env file');
      return;
    }

    const token = comet.cometJWTsign(
      { userId: user.id },
      process.env.HMAC_SECRT_KEY
    );

    const result = await request(app)
      .get('/authtest')
      .send()
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    console.log(result.body);
    expect(result.body.email).toBe('Exapmle@two.com');
  });

  test('Authorization middleware should not work with tampered token', async () => {
    const result = await request(app)
      .get('/authtest')
      .send()
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cGUiOiJqd3QifQ.eyJ1c2VySWQiOjF9.ZZOCTQh3VpIJMINmMpaGUm3BJOtbHYmIkbuZlA36ZZ'
      )
      .expect(401);

    expect(result.body.error_message).toBe('Unauthorized');
  });

  test('Authorization middleware should not work if token is missing', async () => {
    const result = await request(app)
      .get('/authtest')
      .send()
      .expect(401);

    expect(result.body.error_message).toBe('Unauthorized');
  });
});
