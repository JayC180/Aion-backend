const argon2 = require("argon2");
const User = require("../models/User");
const config = require("../config.js");
const jwt = require("jsonwebtoken");
const JWT = config.JWT;

const newJWT = (uid, name) => {
    return new Promise((resolve, reject) => {
        const payload = { uid, name };
        jwt.sign(
            payload,
            JWT,
            {
                expiresIn: "24h",
            },
            (err, token) => {
                if (err) {
                    reject("Cannot generate JWT");
                }
                resolve(token);
            }
        );
    });
};

const handleError = (res, statusCode, msg) => {
    return res.status(statusCode).json({
        ok: false,
        msg: msg,
    });
};

const createUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return handleError(res, 400, "Email already taken.");
        }

        user = await User.findOne({ username });

        if (user) {
            return handleError(res, 400, "Username already taken.");
        }

        user = new User(req.body);
        user.password = await argon2.hash(password);
        await user.save();

        const token = await newJWT(user.id, user.username);

        res.status(201).json({
            ok: true,
            uid: user.id,
            username: user.username,
            token,
        });
    } catch (error) {
        return handleError(res, 500, "createUser 500");
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return handleError(res, 400, "Email not registered");
        }

        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            return handleError(res, 401, "Email and password doesn't match.");
        }

        const token = await newJWT(user.id, user.name);

        res.status(200).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token,
        });
    } catch (error) {
        return handleError(res, 500, "loginUser 500");
    }
};

const renewToken = async (req, res) => {
    const { id, name } = req.user;

    try {
        const token = await newJWT(id, name);
        res.json({
            ok: true,
            uid: id,
            name,
            token,
        });
    } catch (error) {
        return handleError(res, 500, "renewToken 500");
    }
};

module.exports = {
    createUser,
    loginUser,
    renewToken,
};
