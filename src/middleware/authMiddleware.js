const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error){
        console.log(error);
        return res.status(401).json({ error: 'Invalid token' });
    
    }
}

// const authHeader = req.headers.authorizationWhen the frontend makes a request to a protected route it 
// sends the token in the request headers like this:Authorization: 
// Bearer eyJhbGciOiJIUzI1NiJ9...req.headers.authorization grabs that whole string.


// authHeader && authHeader.split(' ')[1]
// The header value looks like "Bearer tokenvalue". You only need the actual token part, not the word 
// "Bearer". So:

// split(' ') splits it into ["Bearer", "tokenvalue"]
// [1] grabs the second item — just the token itself
// authHeader && means "only do this if authHeader actually exists"


// jwt.verify(token, process.env.JWT_SECRET)
// This checks if the token is valid and hasn't been tampered with. JWT_SECRET is a secret string in your 
// .env that was used to create the token originally. If someone fakes a token without knowing the secret, 
// this fails.


// req.admin = decoded
// Once verified, the decoded token contains the admin's info. Attaching it to req.admin means 
// any route that runs after this middleware can access it.


// next()
// This is key to understanding middleware. Middleware sits between the request 
// and the route. When everything checks out, next() says "okay, continue to the actual route now." Without
//  it the request just hangs.
// So the flow is:

// Request comes in
// → middleware checks for token
// → no token? block it, return 401
// → token exists? verify it
// → invalid token? block it, return 401
// → valid token? call next() → continue to the route