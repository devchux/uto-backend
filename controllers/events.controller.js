const Event = require("../models/events.model");
const logger = require("../utils/logger");
const { getPagingData, getPagination } = require("../utils/pagination");

exports.createEvent = async (req, res) => {
  const { title, description, imageUrl, date, time, venue } = req.body;
  try {
    const event = await Event.create({
      title,
      description,
      imageUrl,
      date,
      time,
      venue,
    });

    return res.status(201).json({
      status: "success",
      message: "Event has been created",
      event,
    });
  } catch (error) {
    logger.error(`(createEvent) Event could not be created: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getAllEvents = async (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  try {
    const events = await Event.findAndCountAll({
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
    });

    const data = getPagingData(events, page, limit);

    return res.status(200).json({
      status: "success",
      message: "Events have been fetched",
      events: data,
    });
  } catch (error) {
    logger.error(
      `(getAllEvents) Events could not be fetched: ${error.message}`
    );
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event)
      return res.status(404).json({
        status: "error",
        message: "Event could not be found",
      });

    return res.status(200).json({
      status: "success",
      message: "Event has been fetched",
      event,
    });
  } catch (error) {
    logger.error(
      `(getSingleEvent) Event could not be fetched: ${error.message}`
    );
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateEvent = async (req, res) => {
  const { title, description, imageUrl, date, time, venue } = req.body;
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event)
      return res.status(404).json({
        status: "error",
        message: "Event could not be found",
      });

    const newEvent = await event.update({
      title: title || event.title,
      description: description || event.description,
      imageUrl: imageUrl || event.imageUrl,
      date: date || event.date,
      time: time || event.time,
      venue: venue || event.venue,
    });

    return res.status(201).json({
      status: "success",
      message: "Event has been updated",
      event: newEvent,
    });
  } catch (error) {
    logger.error(`(updateEvent) Event could not be updated: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteEvent = (req, res) => {
  Event.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "Event has been deleted",
      })
    )
    .catch((error) => {
      logger.error(
        `(deleteEvent) Event could not be deleted: ${error.message}`
      );
      return res.status(500).json({
        message: error.message,
        status: "error",
      });
    });
};

exports.deleteBulkEvent = (req, res) => {
  Event.destroy({
    where: {
      id: req.body.ids,
    },
  })
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "Events have been deleted",
      })
    )
    .catch((error) => {
      logger.error(
        `(deleteBulkEvent) Events could not be deleted: ${error.message}`
      );
      return res.status(500).json({
        message: error.message,
        status: "error",
      });
    });
};
