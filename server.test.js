const request = require('supertest');
const server = require('./api/server');
const Auth = require('./auth/auth-model');
const db = require('./database/dbConfig.js');

let token;

beforeEach(async () => {
	// this function executes and clears out the table before each test
	await db('users').truncate();
});

beforeAll((done) => {
	request(server)
		.post('/api/auth/register')
		.send({
			username: 'Bobj2018',
			password: 'Password',
		})
		.then((res) => {
			request(server)
				.post('/api/auth/login')
				.send({
					username: 'Bobj2018',
					password: 'Password',
				})
				.end((err, response) => {
					token = response.body.token; // save the token!
					done();
				});
		});
});

describe('GET /api/auth', () => {
	it('should require JSON', () => {
		return request(server)
			.get('/api/auth/login')
			.then((response) => {
				expect(response.statusCode).toBe(404);
			});
	});
});

describe('GET /api/jokes', () => {
	// token not being sent - should respond with a 401
	it('should require authorization', () => {
		return request(server)
			.get('/api/jokes')
			.then((response) => {
				expect(response.statusCode).toBe(401);
			});
	});
	// send the token - should respond with a 200
	it('responds with JSON', () => {
		return request(server)
			.get('/api/jokes')
			.set('authorization', `Bearer ${token}`)
			.then((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.type).toBe('application/json');
			});
	});
});
