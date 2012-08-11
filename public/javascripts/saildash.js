var SAILDASH = function() {
  var saildash = {};
  var steps = 7*24; // 7 days of 1 hour data

  saildash.dateChange = function(x) {
    var step = Math.round(x/(1/(steps-1)), 10);
    if(SAILDASH.forecastData) {
      var date = new Date(SAILDASH.forecastData['data']['time-layout']['start-valid-time'][step]);
      $('#dateslider .handle').text(date.getMonth() + 1 + "/" + date.getDate() + " " + date.getHours() + ":00");
      $("#windspeed .graphlabel").text("Wind Speed: " + SAILDASH.forecastData['data']['parameters']['wind-speed'][0]['value'][step] + " MPH");
      $("#winddir .graphlabel").html("Wind Direction: " + SAILDASH.forecastData['data']['parameters']['direction']['value'][step] + "&deg;");
      $("#tide .graphlabel").text("Tide: ");
    }
  };

  saildash.consts = {
    spinnerOptions: {
      lines: 9,
      length: 5,
      width: 2,
      radius: 3,
      color: "#FFF"
    },
    sliderOptions: {
      disabled: true,
      steps: steps,
      snap: true,
      loose: true,
      animationCallback: saildash.dateChange
    }
  };

  saildash.setForecastData = function(forecastData) {
    this.forecastData = forecastData;
  };

  return saildash;
}();

$("document").ready(function() {
  SAILDASH.dateSlider = new Dragdealer("dateslider", SAILDASH.consts.sliderOptions);
  SAILDASH.sliderSpinner = new Spinner(SAILDASH.consts.spinnerOptions).spin($("#dateslider .handle .spincontainer")[0]);

  $.getJSON("/data/weatherforecast", function(forecast) {
    SAILDASH.sliderSpinner.stop();
    SAILDASH.dateSlider.enable();
    SAILDASH.setForecastData(forecast);
    SAILDASH.dateChange(0);
  });
});
