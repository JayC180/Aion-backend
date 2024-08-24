const Event = require("../models/Event");

const getEvents = async (req, res) => {
    console.log("getting events");
    try {
        const events = await Event.find().populate("user", "username");
        res.status(200).json({ ok: true, events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: "Error fetching events" });
    }
};

const createEvent = async (req, res) => {
    const { title, description, begin, end } = req.body;
    console.log("Creating event with data:", {
        title,
        description,
        begin,
        end,
    });
    console.log("User from request:", req.user);

    try {
        const event = new Event({
            title,
            description,
            begin,
            end,
            user: req.user.id,
        });
        console.log("Event object before save:", event);
        await event.save();
        console.log("Event saved successfully");
        res.status(201).json({ ok: true, event });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ ok: false, msg: "Error creating event" });
    }
};

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, begin, end } = req.body;
    try {
        const event = await Event.findByIdAndUpdate(
            id,
            { title, description, begin, end },
            { new: true }
        );
        res.json({ ok: true, event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: "Error updating event" });
    }
};

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const event = await Event.findByIdAndDelete(id);
        res.json({ ok: true, event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: "Error deleting event" });
    }
};

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
};
