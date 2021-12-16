const fs = require("fs");
const AudioSubject = require("../models/audio-subject.model");
const Audio = require("../models/audios.model");
const { cloudinaryV2, fileUpload } = require("../utils/fileUpload");
const logger = require("../utils/logger");

exports.uploadAudio = (req, res) => {
  const upload = fileUpload(["audio/mp3", "audio/mpeg"], "audio");

  upload(req, res, (err) => {
    if (err) {
      logger.error(`(uploadAudio) Multer Audio upload error: ${err.message}`);
      return res.status(400).json({
        status: "error",
        message: "Audio could not be uploaded",
      });
    }

    const { path } = req.file;

    const fName = req.file.originalname.split(".")[0];
    cloudinaryV2.uploader.upload(
      path,
      {
        resource_type: "raw",
        public_id: `AudioUploads/${fName}`,
      },
      (err, audio) => {
        if (err) {
          logger.error(
            `(uploadAudio) Cloudinary Audio upload error: ${err.message}`
          );
          return res.status(400).json({
            status: "error",
            message: "Audio could not be uploaded",
          });
        }

        fs.unlinkSync(path);
        const { title, audioDescription, audioTitle, slug } = req.body;
        AudioSubject.create({ title })
          .then(async ({ id }) => {
            try {
              const audioDb = await Audio.create({
                slug,
                audioUrl: audio.secure_url,
                SubjectId: id,
                UserId: req.user.userId,
                title: audioTitle,
                description: audioDescription,
              });
              return res.status(201).json({
                status: "success",
                message: "Audio has been created",
                audio: audioDb,
              });
            } catch (error) {
              logger.error(
                `(uploadAudio) Audio could not be registered in database: ${error.message}`
              );
              return res.status(400).json({
                status: "error",
                message: "Audio could not be uploaded",
              });
            }
          })
          .catch((error) => {
            logger.error(
              `(uploadAudio) Subject could not be created: ${error.message}`
            );
            return res.status(400).json({
              status: "error",
              message: "Audio could not be uploaded",
            });
          });
      }
    );
  });
};

exports.uploadMoreAudio = async (req, res) => {
  const subject = await AudioSubject.findByPk(req.params.id);
  if (!subject) {
    return res.status(400).json({
      status: "error",
      message: "Audio Subject does not exist",
    });
  }
  const upload = fileUpload(["audio/mp3", "audio/mpeg"], "audio");

  upload(req, res, (err) => {
    if (err) {
      logger.error(
        `(uploadMoreAudio) Multer Audio upload error: ${err.message}`
      );
      return res.status(400).json({
        status: "error",
        message: "Audio could not be uploaded",
      });
    }

    const { path } = req.file;

    const fName = req.file.originalname.split(".")[0];
    cloudinaryV2.uploader.upload(
      path,
      {
        resource_type: "raw",
        public_id: `AudioUploads/${fName}`,
      },
      async (err, audio) => {
        if (err) {
          logger.error(
            `(uploadMoreAudio) Cloudinary Audio upload error: ${err.message}`
          );
          return res.status(400).json({
            status: "error",
            message: "Audio could not be uploaded",
          });
        }

        fs.unlinkSync(path);
        try {
          const audioDb = await Audio.create({
            audioUrl: audio.secure_url,
            SubjectId: subject.id,
            slug: req.body.slug,
            UserId: req.user.userId,
            title: req.body.audioTitle,
            description: req.body.audioDescription,
          });
          return res.status(201).json({
            status: "success",
            message: "Audio has been created",
            audio: audioDb,
          });
        } catch (error) {
          logger.error(
            `(uploadMoreAudio) Audio could not be registered in database: ${error.message}`
          );
          return res.status(400).json({
            status: "error",
            message: "Audio could not be uploaded",
          });
        }
      }
    );
  });
};

exports.deleteAudioFromDb = (req, res) => {
  Audio.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "Audio has been deleted",
      })
    )
    .catch((error) => {
      logger.error(
        `(deleteAudioFromDb) Audio could not be deleted: ${error.message}`
      );
      return res.status(500).json({
        message: "Audio was not deleted",
        status: "error",
      });
    });
};

exports.getAudios = async (req, res) => {
  try {
    const audios = await Audio.findAll({
      where: {
        slug: req.params.slug,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Audios has been fetched",
      audios,
    });
  } catch (error) {
    logger.error(`(getAudios) Audios could not be fetched: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: "Audios could not be fetched",
    });
  }
};

exports.getAudioSubjects = async (req, res) => {
  try {
    const subjects = await AudioSubject.findAll();

    return res.status(200).json({
      status: "success",
      message: "Audio subjects have been fetched",
      subjects,
    });
  } catch (error) {
    logger.error(
      `(getAudioSubjects) Audio subjects could not be fetched: ${error.message}`
    );
    return res.status(500).json({
      status: "error",
      message: "An error occurred",
    });
  }
};

exports.getSingleAudioSubject = async (req, res) => {
  try {
    const subject = await AudioSubject.findByPk(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Audio subject have been fetched",
      subject,
    });
  } catch (error) {
    logger.error(
      `(getSingleAudioSubject) Audio subject could not be fetched: ${error.message}`
    );
    return res.status(500).json({
      status: "error",
      message: "An error occurred",
    });
  }
};

exports.updateAudioSubject = async (req, res) => {
  try {
    const subject = await AudioSubject.findByPk(req.params.id);

    if (!subject)
      return res.status(404).json({
        status: "error",
        message: "Subject does not exist",
      });

    const newSubject = await AudioSubject.update({
      title: req.body.title || subject.title,
    });

    return res.status(200).json({
      status: "success",
      message: "Audio subject have been fetched",
      subject: newSubject,
    });
  } catch (error) {
    logger.error(
      `(updateAudioSubject) Audio subject could not be updated: ${error.message}`
    );
    return res.status(500).json({
      status: "error",
      message: "An error occurred",
    });
  }
};

exports.deleteAudioSubject = (req, res) => {
  AudioSubject.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "Audio collection has been deleted",
      })
    )
    .catch((error) => {
      logger.error(
        `(deleteAudioSubject) Audio collection could not be deleted: ${error.message}`
      );
      return res.status(500).json({
        message: "Audio collection was not deleted",
        status: "error",
      });
    });
};
