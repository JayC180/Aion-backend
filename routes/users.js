const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const config = require("../config.js");
const JWT = config.JWT;

const {
    createUser,
    loginUser,
    renewToken,
} = require("../controllers/usersController");

const registerSchema = Joi.object({
    username: Joi.string().max(32).required(),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    password: Joi.string()
        .min(8)
        .max(32)
        .required()
        .pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, "Password"),
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    password: Joi.string().min(8).max(32).required(),
});

const handleValidation = (schema) => {
    return async (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
            });

            if (error) {
                return res.status(400).json({
                    ok: false,
                    errors: error.details.map((err) => err.message),
                });
            }

            req.validatedData = value;
            next();
        } catch (error) {
            return res.status(500).json({
                ok: false,
                errors: error.message,
            });
        }
    };
};

const JWTValidation = (req, res, next) => {
    const token = req.header("x-token");
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: "Missing token",
        });
    }
    try {
        const { id, username } = jwt.verify(token, JWT);
        req.user = { id, username };
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: "Invalid token",
        });
    }
};

router.post("/register", handleValidation(registerSchema), createUser);
router.post("/login", handleValidation(loginSchema), loginUser);
router.get("/renew", JWTValidation, renewToken);

module.exports = router;
