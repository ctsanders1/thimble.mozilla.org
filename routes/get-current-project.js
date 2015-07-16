var request = require("request");
var Path = require("path");
var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var project = req.session.project.meta;
    var projectId = project.id;

    request.get({
      url: config.publishURL + "/projects/" + projectId + "/files",
      headers: {
        "Authorization": "token " + req.user.token
      }
    }, function(err, response, body) {
      if(err) {
        res.status(500).send({error: "Failed to execute request for project files"});
        return;
      }

      if(response.statusCode !== 200) {
        res.status(404).send({error: response.body});
        return;
      }

      var files = JSON.parse(body);
      req.session.project.files = {};
      files.forEach(function(file) {
        var fileMeta = JSON.parse(JSON.stringify(file));
        delete fileMeta.buffer;
        req.session.project.files[fileMeta.path] = fileMeta;
        file.path = Path.join(utils.getProjectRoot(project), file.path);
      });

      res.type("application/json");
      res.send({
        project: project,
        files: files
      });
    });
  };
};
