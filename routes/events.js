const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const config = require("../config.js");
const Event = require("../models/Event");

const JWT = config.JWT;

const {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
} = require("../controllers/eventsController");

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

const schema = Joi.object({
    title: Joi.string().max(32).required(),
    description: Joi.string().max(256).allow("").optional(),
    begin: Joi.date().required(),
    end: Joi.date().greater(Joi.ref("begin")).required(),
    bgColor: Joi.string().optional(),
    user: Joi.string().optional(),
    id: Joi.string()
        .custom((value, helpers) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        }, "ObjectId Validation")
        .optional(),
});

const handleValidation = (schema) => {
    return async (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                return res.status(400).json({
                    ok: false,
                    errors: error.details.map((err) => err.message),
                });
            }
            req.validatedData = value;
            next();
        } catch (err) {
            return res
                .status(500)
                .json({ ok: false, msg: "Internal server error" });
        }
    };
};

const validateEvent = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ ok: false, msg: "Event not found" });
        }
        if (event.user.toString() !== userId) {
            return res
                .status(401)
                .json({ ok: false, msg: "Unauthorized access" });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ ok: false, msg: "Internal server error" });
    }
};

router.use(JWTValidation);
router.get("/", getEvents);
router.post("/", handleValidation(schema), createEvent);
router.put("/:id", handleValidation(schema), validateEvent, updateEvent);
router.delete("/:id", handleValidation(schema), validateEvent, deleteEvent);

module.exports = router;
