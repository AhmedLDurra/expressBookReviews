const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    const token = req.session.token; // Retrieve token from session

    if (!token) {
        return res.status(401).json({ error: "Access Denied: No Token Provided" });
    }

    try {
        // Verify the token using the secret key
        req.user = jwt.verify(token, "fingerprint_customer"); // Attach user information from the token to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(400).json({ error: "Invalid Token" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
