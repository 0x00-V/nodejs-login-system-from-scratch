import { createServer } from 'http';
import crypto from 'crypto';
import { readFile } from 'fs'; 

import dotenv from 'dotenv';
dotenv.config();


import { Client } from 'pg';

const client = new Client({
	user: 'dan',
	password: process.env.DB_PASS,
	host: '127.0.0.1',
	port: 5432,
	database: 'testdb',
});



await client.connect();
const hostname = '127.0.0.1';
const port = 8080;


function parseCookies(cookieHeader)
{
	const cookies = {};
	if (!cookieHeader) return cookies;
	cookieHeader.split(';').forEach(cookie => {
		const [name, ...rest] = cookie.trim().split('=');
		cookies[name] = rest.join('=');
	});
	return cookies;
};

function generateSessionId()
{
	return crypto.randomBytes(16).toString('hex');
}

const server = createServer(async (req, res) => {
	const cookies = parseCookies(req.headers.cookie);

const url = req.url;

if(req.url === '/login' && req.method === 'GET')
{
	readFile('./login.html', (err, data) => {
		if(err)
		{
			res.writeHead(500, {'Content-Type': 'text/plain'});
			res.end('Error loading page');
		} else 
		{
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(data);
		}
	});
} else if (url === '/login' && req.method === 'POST'){
	let body = '';
	req.on('data', chunk => (body += chunk));
	req.on('end', async () => {
	const params = new URLSearchParams(body);
	const username = params.get('username');
	const password = params.get('password');
			
	const text = "SELECT username, password, id FROM users WHERE username = $1 AND password = $2";
	const q1_resp = await client.query(text, [username, password])
	if(q1_resp.rows.length > 0)
	{
		console.log('Correct.');
		const sessionId = generateSessionId();
		await client.query("INSERT INTO sessions (session_id, user_id, expires_at) VALUES ($1, $2, NOW() + interval '1 hour')", [sessionId, q1_resp.rows[0].id]);
		res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Secure; SameSite=Strict`);
		res.writeHead(302, { Location: '/dashboard'});
		res.end();
	} else 
	{
		res.writeHead(401, {'Content-Type': 'text/plain'});
		res.end('Incorrect Credentials.');
	}
	});
} else if (req.url === '/logout')
{
	await client.query("DELETE FROM sessions WHERE session_id = $1", [cookies.sessionId]);

	res.writeHead(302, { Location: '/'});
	res.end(); 
} else if (req.url === '/dashboard')
{
	const sessionResp = await client.query(
  "SELECT users.username FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.session_id = $1 AND (sessions.expires_at IS NULL OR sessions.expires_at > NOW())",
  [cookies.sessionId]
);
	
	if(sessionResp.rows.length > 0)
	{
		const session = sessionResp.rows[0];
		readFile('./dashboard.html', 'utf8', (err, html) => {
			if(err)
			{
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end('Error loading dashboard');
			} else
			{
				const page = html.replace(`{{username}}`, session.username);
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(page);
			}
		});
	} else {
		res.writeHead(302, { Location: '/'});
		res.end();
	}
} else {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Index page. Try /login, /dashboard, or /logout.');
}
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
