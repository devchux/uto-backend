const Contact = require("../models/contacts.model");
const logger = require("../utils/logger");

exports.createContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const contact = await Contact.create({ name, email, subject, message });
    return res.status(201).json({
      status: "success",
      message: "Message sent",
      contact,
    });
  } catch (error) {
    logger.error(
      `(createContact) contact could not be cerated: ${error.message}`
    );
    return res.status(500).json({
      status: "error",
      message: "An error occurred",
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll();

    return res.status(200).json({
      status: "success",
      message: "Contacts have been fetched",
      contacts,
    });
  } catch (error) {
    logger.error(
      `(getAllContacts) contacts could not be fetched: ${error.message}`
    );
    return res.status(500).json({
      status: "error",
      message: "An error occurred",
    });
  }
};

exports.getSingleContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Contact has been fetched",
      contact,
    });
  } catch (error) {
    logger.error(
      `(getSingleContact) contact could not be fetched: ${error.message}`
    );
    return res.status(500).json({
      status: "error",
      message: "An error occurred",
    });
  }
};

exports.deleteContact = async (req, res) => {
  Contact.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "Contact has been deleted",
      })
    )
    .catch((error) => {
      logger.error(
        `(deleteContact) Contact could not be deleted: ${error.message}`
      );
      return res.status(500).json({
        message: "Contact was not deleted",
        status: "error",
      });
    });
};
