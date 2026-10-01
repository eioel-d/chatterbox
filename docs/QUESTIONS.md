# Chatterbox: Likely Questions and Answers

Questions an examiner may ask about the project, with short answers based on the actual code.

## Middleware

**1. What is middleware?**

A function that runs between receiving a request and sending the response. It can read or change `req` and `res`, stop the request (for example with a 401), or call `next()` to pass it along.

**2. What middleware does your app use?**

`cors` and `express.json()` in `app.js`, your own `requireAuth` in `middleware/auth.js`, and the Socket.io handshake check in `sockets/index.js`. `asyncHandler` is a helper that behaves similarly.

**3. Why are `cors`, `express.json()`, and the socket auth not in the `middleware/` folder?**

That folder is a convention for middleware you write yourself. `cors` and `express.json()` come from packages, so there is nothing to put in a file, only one line of configuration in `app.js`. The socket check has a different shape, `(socket, next)` instead of `(req, res, next)`, so I kept it with the other socket code. Moving it to `middleware/socketAuth.js` would be equally valid.

**4. Why does the order of middleware matter?**

Express runs them in the order they are registered. `express.json()` must come before the routes, or `req.body` is empty. `cors` must also come first so the headers are set on every response.

**5. How does `requireAuth` protect routes?**

`roomRoutes.js` calls `router.use(requireAuth)`, so every `/api/rooms` route needs a valid token. `/api/register` and `/api/login` are public. If the token is bad, it returns 401 and never calls `next()`, so the controller never runs.

**6. How does Socket.io middleware differ from Express middleware?**

It is registered with `io.use()` and runs once per connection (the handshake), not on every event. So a token that expires while the user stays connected is not rechecked.

**7. What middleware is missing?**

A global error handler, rate limiting (`express-rate-limit`), security headers (`helmet`), and request logging (`morgan`).

## Architecture

**8. Why use both REST and Socket.io?**

REST suits request/response actions like login and loading history, and it is easy to test with Postman. Socket.io suits pushing live events to many users.

**9. Why split the server into routes, controllers, and models?**

Each layer has one job, so the code is easier to read, change, and test.

**10. Why a `useChat` hook instead of Redux or Context?**

Only the chat screen needs the socket state, so one hook keeps it in one place. Redux would add a lot of setup for an app this small.

**11. Why Vite instead of Create React App?**

Vite starts and builds much faster, and Create React App is no longer recommended for new projects.

## Security

**12. Why JWT instead of server sessions?**

It is stateless, and the same token works for REST and Socket.io. The trade-offs are that you cannot easily cancel a token early, and it sits in `localStorage`, which is exposed to XSS. An httpOnly cookie would be safer.

**13. Why bcrypt?**

It is deliberately slow and adds a random salt, which makes brute-force and rainbow-table attacks hard. Fast hashes like MD5 or SHA-256 are too easy to crack for passwords.

**14. How do you stop someone sending messages as another user?**

The sender's name comes from the verified token in the handshake, never from anything the client sends.

**15. What is CORS, and why do you need it?**

Browsers block pages from calling a different origin. Your frontend (Vercel) and backend (Render) are on different origins, so the server explicitly allows `CLIENT_URL`.

## Real-time behavior

**16. Why does the sender see their own message only after the server replies?**

It guarantees that only saved messages appear on screen. The cost is a tiny delay, which an "optimistic" UI could hide.

**17. What is the difference between `socket.to(room).emit` and `io.to(room).emit`?**

`socket.to` skips the sender, and `io.to` includes everyone. Typing events use the first, and `newMessage` uses the second.

**18. What if a user opens two tabs?**

Each tab gets its own socket and receives messages. The online list uses unique usernames, so the user appears once.

## Data

**19. Why store `sender` as a username string instead of a reference?**

It makes history loading simple, with no joins. The cost is duplicated data, which is fine because usernames cannot change in this app.

**20. Why MongoDB instead of SQL?**

Messages are simple documents that are mostly added, and MongoDB works naturally with JavaScript. SQL would also fit, so it is a reasonable choice rather than the only one.

## Deployment

**21. Do you redeploy every time you push?**

No. Render and Vercel both redeploy automatically on a push to `main`. The exception is changing `VITE_API_URL`, which is baked in at build time, so it needs a manual redeploy.

**22. Why Render for the server instead of Vercel?**

Socket.io needs a server that stays running to hold WebSocket connections, and Vercel's serverless functions do not do that.

## Honest weaknesses (better to name them yourself)

**23. Can it scale to several servers?**

Not yet. Presence lives in one server's memory, and Socket.io rooms do not span servers. The fix is a Redis adapter.

**24. What happens if the server restarts or the network drops?**

Messages are safe in MongoDB. Sockets reconnect automatically, but the user is not re-added to their room until they switch rooms or refresh.

**25. Why is there a `dns.setServers` line in `db.js`?**

It is a workaround for networks that block the DNS lookup Atlas needs. It can itself cause timeouts on networks that block outside DNS, so making it optional through an environment variable would be better.

**26. How did you test it?**

With the manual checklist in the documentation. There are no automated tests yet; Jest and Supertest would be the next step.
