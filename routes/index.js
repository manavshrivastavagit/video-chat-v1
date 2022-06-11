var express = require("express");
var db = require("../db");
var router = express.Router();

/* GET home page. */
router.get(
  "/",
  function (req, res, next) {
    if (!req.user) {
      return res.render("login");
    }
    next();
  },
//   fetchTodos,
  function (req, res, next) {
    res.locals.filter = null;
    res.render("room", { user: req.user });
  }
);

// router.get("/", (req, res) => {
//   res.redirect(`/${uuidv4()}`);
// });

router.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room,  user: req.user });
});

module.exports = router;