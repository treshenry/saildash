var http = require("http"),
    xml2js = require("xml2js");

// Everything in here responds with JSON
exports.data = function(req, res) {

  // Get weather forecast as json
  if(req.params.datum == "weatherforecast") {

    // Get the data from NOAA as XML
    // TODO (ohnoimdead): Need to accept param for location
    var options = {
      host: 'forecast.weather.gov',
      port: 80,
      path: '/MapClick.php?lat=47.6825976&lon=-122.4070743&FcstType=digitalDWML'
    };

    var externalReq = http.get(options, function(externalRes) {

      // Get and assemble the response chunks
      var body = "";
      externalRes.on('data', function (chunk) {
        body += chunk;
      });

      // Whe complete return to the client as json
      externalRes.on('end', function() {
        var parser = new xml2js.Parser();
        parser.parseString(body, function(err, result) {
          res.send(result);
        });
      });
    });

    externalReq.end();

  } else {

    // If we didn't get a param we knew, return an empty json object
    res.send({});

  }
};
