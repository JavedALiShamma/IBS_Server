const jwt = require('jsonwebtoken');
const IBSSuperAdmin = require("../models/superAdmin.model");
const dotenv = require('dotenv');
dotenv.config(); // Load .env variables

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded token:", decoded);

        const superAdmin = await IBSSuperAdmin.findById(decoded._id);
        if (!superAdmin) {
            return res.status(401).json({ message: 'Token is not valid, authorization denied' });
        }

        req.superAdmin = superAdmin; // Attach to request
        next();
    } catch (err) {
        console.log("Error in token verification:", err.message);
        return res.status(500).json({ message: 'Server error, please try again later' });
    }
}

const createToken = async (superAdmin) => {
    try {
        const token = jwt.sign({ _id: superAdmin._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        return token;
    } catch (err) {
        console.error("Error generating token:", err);
        throw new Error("Token generation failed");
    }
}

module.exports = { auth, createToken };
