const Summoner = require("../models/summoner.model");
const RiotApiService = require("../services/riotAPI.service");

exports.createSummoner = (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({
      message: "Summoner name can not be empty",
    });
  }

  const summoner = new Summoner({
    id: req.body.id,
    accountid: req.body.accountid,
    puuid: req.body.puuid,
    name: req.body.name,
    profileiconid: req.body.profileiconid,
    revisiondate: req.body.revisiondate,
  });
  summoner
    .createSummoner()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Summoner.",
      });
    });
};

exports.getAllSummoners = (req, res) => {
  Summoner.find()
    .then((summoners) => {
      res.send(summoners);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving summoners.",
      });
    });
};

exports.getSummonerById = (req, res) => {
  Summoner.findById(req.params.id)
    .then((summoner) => {
      if (!summoner) {
        return res.status(404).send({
          message: "Summoner not found with id " + req.params.name,
        });
      }
      summoner.revisiondate = summoner.revisiondate.toString();
      res.status(200).send(summoner);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Summoner not found with id " + req.params.name,
        });
      }
      return res.status(500).send({
        message: "Error retrieving summoner with id " + req.params.name,
      });
    });
};

exports.updateSummoner = (req, res) => {
  if (!req.body.puuid) {
    return res.status(400).send({
      message: "Summoner puuid can not be empty",
    });
  }
  Summoner.findByIdAndUpdate(
    req.params.puuid,
    {
        id: req.body.id,
        accountid: req.body.accountid,
        puuid: req.body.puuid,
        name: req.body.name,
        profileiconid: req.body.profileiconid,
        revisiondate: req.body.revisiondate,
    },
    { new: true }
  )
    .then((summoner) => {
      if (!summoner) {
        return res.status(404).send({
          message: "Summoner not found with id " + req.params.name,
        });
      }
      res.send(summoner);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Summoner not found with id " + req.params.name,
        });
      }
      return res.status(500).send({
        message: "Error updating summoner with id " + req.params.name,
      });
    });
};

exports.deleteSummoner = (req, res) => {
  Summoner.findByIdAndRemove(req.params.puuid)
    .then((summoner) => {
      if (!summoner) {
        return res.status(404).send({
          message: "Summoner not found with id " + req.params.name,
        });
      }
      res.send({ message: "Summoner deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Summoner not found with id " + req.params.name,
        });
      }
      return res.status(500).send({
        message: "Could not delete summoner with id " + req.params.name,
      });
    });
};

exports.getSummonerByName = (req, res) => {
  Summoner.findByName(req.params.name)
    .then((summoner) => {
      if (!summoner) {
        return res.status(404).send({
          message: "Summoner not found with name " + req.params.name,
        });
      }
      summoner.revisiondate = summoner.revisiondate.toString();
      res.status(200).send(summoner);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Summoner not found with name " + req.params.name,
        });
      }
      return res.status(500).send({
        message: "Error retrieving summoner with name " + req.params.name,
      });
    });
};

exports.getSummonerByAccountId = (req, res) => {
  Summoner.findByAccountId(req.params.accountid)
    .then((summoner) => {
      if (!summoner) {
        return res.status(404).send({
          message: "Summoner not found with accountid " + req.params.accountid,
        });
      }
      summoner.revisiondate = summoner.revisiondate.toString();
      res.status(200).send(summoner);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Summoner not found with accountid " + req.params.accountid,
        });
      }
      return res.status(500).send({
        message: "Error retrieving summoner with accountid " + req.params.accountid,
      });
    });
};

exports.getSummonerByPuuid = (req, res) => {
  Summoner.findByPuuid(req.params.puuid)
    .then((summoner) => {
      if (!summoner) {
        return res.status(404).send({
          message: "Summoner not found with puuid " + req.params.puuid,
        });
      }
      summoner.revisiondate = summoner.revisiondate.toString();
      res.status(200).send(summoner);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Summoner not found with puuid " + req.params.puuid,
        });
      }
      return res.status(500).send({
        message: "Error retrieving summoner with puuid " + req.params.puuid,
      });
    });
};

exports.getSummoner = async (req, res) => {
  try {
    const summonerName = req.params.name;
    const summoner = await RiotApiService.getSummonerByName(summonerName);
    return summoner;
  } catch (error) {
    console.error(error);
    throw error;
  }
};