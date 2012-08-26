var http = require("http"),
    xml2js = require("xml2js"),
    time = require("time");

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
          if(err) {
            console.log(err);
            res.send(err);
          } else {
            res.send(result);
          }
        });
      });
    });

    externalReq.end();

  } else if(req.params.datum == "tideforecast") {

    // Get the data from NOAA as XML
    // TODO (ohnoimdead): Need to accept param for location
    var today = new time.Date();
    today.setTimezone("America/Los_Angeles");
    var month = "" + (today.getMonth() + 1);
    if(month.length == 1) {
      month = "0" + month;
    }
    var date = "" + today.getDate();
    if(date.length == 1) {
      date = "0" + date;
    }
    var options = {
      host: 'tidesandcurrents.noaa.gov',
      port: 80,
      path: 'http://tidesandcurrents.noaa.gov/noaatidepredictions/viewDailyPredictions.jsp?bmon=' + month + '&bday=' + date + '&byear=' + today.getFullYear() + '&timelength=weekly&timeZone=2&dataUnits=1&datum=MLLW&timeUnits=2&interval=60&Threshold=greaterthanequal&thresholdvalue=&format=Submit&Stationid=9447130'
    };

    var externalReq = http.get(options, function(externalRes) {

      // Get and assemble the response chunks
      var body = "";
      externalRes.on('data', function (chunk) {
        body += chunk;
      });

      externalRes.on('end', function() {
        // Extract just the tide report table
        var tableStart = body.indexOf("<table   ");
        var tableEnd = body.indexOf("</table>", tableStart);
        var parser = new xml2js.Parser({ignoreAttrs: true});

        // Remove nowraps so the table will parse as XML
        var parseBody = body.slice(tableStart, tableEnd+8);
        parseBody = parseBody.replace(/nowrap/g, "");

        // Turn the table into JSON and return it
        parser.parseString(parseBody, function(err, result) {
          if(err) {
            console.log(err);
            res.send(err);
          } else {
            res.send(result);
          }
        });
      });
    });

    externalReq.end();

  } else {

    // If we didn't get a param we knew, return an empty json object
    res.send({});

  }
};
