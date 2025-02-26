import { beforeAll, describe, test, expect } from 'vitest';
import request from 'supertest';
import app, { prisma } from '../../src/app-setup.ts';
import comet from '../../src/utils/crypto/index.ts';

/**
 * 📌 Independent Test File for Basic API Connectivity
 *
 * - This test file ensures **basic API functionality** such as authentication, validation errors, and proper request handling.
 * - It is **independent** of item-related tests, meaning it does not rely on product data.
 * - JWT authentication is tested statelessly, ensuring token validity per session.
 */

let user;
let token;

beforeAll(async () => {
	// Delete any existing test users to ensure a fresh start.
	await prisma.user.deleteMany({
		where: {
			email: {
				in: ['', 'miguel@dwati.com'],
			},
		},
	});

	// Create a new test user
	const salt = comet.cometGetRandomSalt();
	user = await prisma.user.create({
		data: {
			email: 'miguel@dwati.com',
			username: 'constructor',
			password: comet.cometHash('Carbon7', salt),
			salt,
		},
	});

	// Generate a test token based on the dynamically created user
	token = comet.cometJWTsign({ userId: user.id }, '123456');
});

//
// ────────────────────────────────────────────
//   SECTION: Price Retrieval Tests
// ────────────────────────────────────────────
//

describe('GET-ALL-PRICES ROUTER', () => {
	test('/getAllPrices should reject invalid payload', async () => {
		const result = await request(app)
			.post('/getAllPrices')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(422);

		expect(result.body.error_message).toBe('Unprocessable entity');
	});
});

//
// ────────────────────────────────────────────
//   SECTION: Product Details Queries
// ────────────────────────────────────────────
//

describe('QUERY-DETAILS ROUTER', () => {
	test('/details/query should reject invalid payload', async () => {
		const result = await request(app)
			.post('/details/query')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(422);

		expect(result.body.error_message).toBe('Unprocessable entity');
	});

	test('/details/compare should reject invalid payload', async () => {
		const result = await request(app)
			.post('/details/compare')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(422);

		expect(result.body.error_message).toBe('Unprocessable entity');
	});
});

//
// ────────────────────────────────────────────
//   SECTION: Reviews API Tests
// ────────────────────────────────────────────
//

describe('REVIEWS ROUTER', () => {
	test('/getReviews should reject invalid payload', async () => {
		const result = await request(app)
			.post('/reviews/all')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(422);

		expect(result.body.error_message).toBe('Unprocessable entity');
	});

	test('/resviews/summary should reject invalid payload', async () => {
		const result = await request(app)
			.post('/resviews/summary')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(422);

		expect(result.body.error_message).toBe('Unprocessable entity');
	});

	test('/reviews/compare should reject invalid payload', async () => {
		const result = await request(app)
			.post('/reviews/compare')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(422);

		expect(result.body.error_message).toBe('Unprocessable entity');
	});

	test('/reviews/ask should reject invalid payload', async () => {
		const result = await request(app)
			.post('/reviews/ask')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(422);

		expect(result.body.error_message).toBe('Unprocessable entity');
	});
});

//
// ────────────────────────────────────────────
//   SECTION: Tracker API Tests
// ────────────────────────────────────────────
//

describe('TRACKER ROUTER', () => {
	test('/tracker/addOne should reject invalid payload', async () => {
		const result = await request(app)
			.post('/tracker/addOne')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(422);

		expect(result.body.error_message).toBe('Unprocessable entity');
	});

	test('/tracker/addMany should reject invalid payload', async () => {
		const result = await request(app)
			.post('/tracker/addMany')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(422);

		expect(result.body.error_message).toBe('Unprocessable entity');
	});

	test('/tracker/checkForUpdates should return 400 when no payload is required', async () => {
		const result = await request(app)
			.post('/tracker/checkforupdates')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(400); // This endpoint requires no additional payload.
	});

	test('/tracker/displayProductsIds should return 400 when no payload is required', async () => {
		const result = await request(app)
			.get('/tracker/displayProductsIds')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(400); // This endpoint requires no additional payload.
	});

	test('/tracker/delete/:id should return 400 if no product is found', async () => {
		const result = await request(app)
			.delete('/tracker/delete/6')
			.set('Authorization', `Bearer ${token}`)
			.expect(400);

		expect(result.body.error_message).toBe(
			'No product found with that id'
		);
	});

	test('/tracker/deleteAll should return 400 when no payload is required', async () => {
		const result = await request(app)
			.delete('/tracker/deleteAll')
			.set('Authorization', `Bearer ${token}`)
			.send('asdsadasada')
			.expect(400);
	});
});
