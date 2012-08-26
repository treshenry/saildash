var SAILDASH = function() {
  var saildash = {};
  var steps = 6*24; // 7 days of 1 hour data

  saildash.dateChange = function(x) {
    var step = Math.round(x/(1/(steps-1)), 10);
    SAILDASH.selectedIndex = step;
    if(SAILDASH.forecastData) {
      SAILDASH.startDate = new Date(SAILDASH.forecastData['data']['time-layout']['start-valid-time'][step]);
      // Update date on the slider
      $('#dateslider .handle').text(SAILDASH.startDate.getMonth() + 1 + "/" + SAILDASH.startDate.getDate() + " " + SAILDASH.startDate.getHours() + ":00");

      SAILDASH.updateSpeedGraph(SAILDASH.forecastData['data']['parameters']['wind-speed'][0]['value'][step]);
      SAILDASH.updateDirectionGraph(SAILDASH.forecastData['data']['parameters']['direction']['value'][step]);
      // Update tide graph if data has been retrieved
      if(SAILDASH.tideData) {
        SAILDASH.updateTideGraph();
      }
    }
  };

  saildash.setupSpeedGraph = function() {
    var barContainer = $("<div />").
                       css("width", "100px").
                       css("height", SAILDASH.consts.speedGraph.graphHeight + "px").
                       css("margin", "25px auto 0").
                       css("position", "relative");
    barContainer.append($("<div />").
                        attr("id", "speedLabel").
                        css("position", "absolute").
                        css("bottom", "0").
                        css("width", "100%").
                        css("color", "#364CA3").
                        css("text-align", "center"));
    barContainer.append($("<div />").
                        attr("id", "speedBar").
                        css("height", "0").
                        css("background-color", "#364CA3").
                        css("bottom", "0").
                        css("position", "absolute").
                        css("width", "100%"));
    $("#windspeed").append(barContainer);
    $("#windspeed .graphlabel").text("Wind Speed");
  };

  saildash.setupDirectionGraph = function() {
    $("#winddir").append($("<div />").
                         attr("id", "dirArrow").
                         css("margin", "30px auto 0").
                         css("width", "230px").
                         css("height", "230px").
                         css("color", "#364CA3").
                         css("font-size", "140pt").
                         css("text-align", "center").
                         html("&darr;"));
    $("#winddir").append($("<div />").
                         attr("id", "dirLabel").
                         css("position", "absolute").
                         css("bottom", "0").
                         css("color", "#364CA3").
                         css("width", "100%").
                         css("text-align", "center"));
    $("#winddir .graphlabel").html("Wind Direction");
  };

  saildash.setupTideGraph = function() {
    function _getBar(index) {
      var hasBg = index == 4;
      var el = $("<div />").
               attr("id", "tideBar" + i).
               css("width", "30px").
               css("height", "100%").
               css("position", "relative").
               css("float", "left");
      if(index == 4) {
        el.css("background-color", "#EEE");
      }
      el.append($("<div />").
                css("position", "absolute").
                css("bottom", SAILDASH.consts.tideGraph.footInPx + "px").
                css("background-color", "#364CA3").
                css("height", "0").
                css("width", "100%"));
      return el;
    }

    var tideContainer = $("#tide");
    tideContainer.append($("<div />").
                  css("position", "absolute").
                  css("top", "27px").
                  css("color", "#364CA3").
                  css("width", "100%").
                  css("z-index", "1").
                  css("text-align", "center").
                  append($("<span />").
                         attr("id", "tideHeightLabel").
                         css("background-color", "#EEE").
                         css("padding", "3px 8px")));
    for(var i = 0; i < 9; i++) {
      tideContainer.append(_getBar(i));
    }
    $("#tide .graphlabel").text("Tide (MLLW)");
  };

  saildash.updateSpeedGraph = function(data) {
    var barHeight = Math.round((SAILDASH.consts.speedGraph.graphHeight / SAILDASH.consts.speedGraph.maxMPH) * parseInt(data), 10);
    $("#speedLabel").text(data + " kt").animate({bottom: barHeight + "px"}, 500, "ease");
    $("#speedBar").animate({height: barHeight + "px"}, 500, "ease");
  };

  saildash.updateDirectionGraph = function(data) {
    $("#dirArrow").animate({rotate: data + "deg"}, 500, "ease");
    $("#dirLabel").html(data + "&deg;");
  };

  saildash.updateTideGraph = function() {
    var height = 0;
    var realValue = 0;
    var isNegative = false;
    var index = SAILDASH.selectedIndex + SAILDASH.tideNowOffset;
    var barEl;
    if(index < SAILDASH.tideData.length) {
      for(var i = -4; i <= 4; i++) {
        if(index + i >= 0 && index + i < SAILDASH.tideData.length) {
          realValue = parseFloat(SAILDASH.tideData[index + i][0]);
          isNegative = realValue <= 0;
          height = Math.round(SAILDASH.consts.tideGraph.footInPx * Math.abs(realValue, 10));
        } else {
          height = 0;
        }
        barEl = $("#tideBar" + (4 + i) + " div");
        barEl.animate({height: height + "px"}, 200, "ease");
        if(!isNegative) {
          barEl.css("margin-bottom", "0").
                css("background-color", "#364CA3");
        } else {
          barEl.animate({"margin-bottom": "-" + height + "px", "background-color": "#F00"}, 200, "ease");
        }
      }
      $("#tideHeightLabel").text("" + SAILDASH.tideData[index][0] + " ft");
    }
  };

  saildash.setForecastData = function(forecastData) {
    this.forecastData = forecastData;
  };

  saildash.setTideData = function(tideData) {
    // Sanitize tide data
    var sanitizedData = [];
    var dataDate;
    SAILDASH.tideNowOffset = 0;
    $.each(tideData["tr"], function(index, item) {
      dataDate = new Date(item["td"][0] + "/" + SAILDASH.startDate.getFullYear() + " " + item["td"][2]);
      if(dataDate < SAILDASH.startDate) {
        SAILDASH.tideNowOffset += 1;
      }
      sanitizedData.push([item["td"][3], dataDate]);
    });

    this.tideData = sanitizedData;
  };

  saildash.consts = {
    spinnerOptions: {
      lines: 9,
      length: 5,
      width: 2,
      radius: 3,
      color: "#364CA3"
    },
    graphSpinnerOptions: {
      lines: 9,
      length: 10,
      width: 4,
      radius: 7,
      color: "#364CA3"
    },
    sliderOptions: {
      disabled: true,
      steps: steps,
      snap: true,
      loose: true,
      animationCallback: saildash.dateChange
    },
    speedGraph: {
      graphHeight: 246,
      maxMPH: 20
    },
    tideGraph: {
      footInPx: 16
    }
  };

  return saildash;
}();

$("document").ready(function() {
  SAILDASH.dateSlider = new Dragdealer("dateslider", SAILDASH.consts.sliderOptions);
  SAILDASH.sliderSpinner = new Spinner(SAILDASH.consts.spinnerOptions).spin($("#dateslider .handle .spincontainer")[0]);
  SAILDASH.speedSpinner = new Spinner(SAILDASH.consts.graphSpinnerOptions).spin($("#speedspinner")[0]);
  SAILDASH.directionSpinner = new Spinner(SAILDASH.consts.graphSpinnerOptions).spin($("#directionspinner")[0]);
  SAILDASH.tideSpinner = new Spinner(SAILDASH.consts.graphSpinnerOptions).spin($("#tidespinner")[0]);
  $("#dateslider").append($("<div />").
                          attr("id", "helptext").
                          css("position", "absolute").
                          css("left", "105px").
                          css("color", "#364CA3").
                          css("margin-top", "6px").
                          css("font-size", "12pt").
                          css("font-style", "italic").
                          html("&larr; Drag Right").
                          hide());

  // Get rid of the help text on interaction
  $("#dateslider").bind("mousedown.saildash", function(evt) {
    $("#helptext").hide();
    $(this).unbind("mousedown.saildash");
  });
  $(".handle").bind("mousedown.saildash", function(evt) {
    $("#helptext").hide();
    $(this).unbind("mousedown.saildash");
  });

  $.getJSON("/data/weatherforecast", function(forecast) {
    SAILDASH.sliderSpinner.stop();
    SAILDASH.speedSpinner.stop();
    SAILDASH.directionSpinner.stop();
    $("#speedspinner").hide();
    $("#directionspinner").hide();
    SAILDASH.setForecastData(forecast);
    SAILDASH.setupSpeedGraph();
    SAILDASH.setupDirectionGraph();
    SAILDASH.dateChange(0);
    $.getJSON("/data/tideforecast", function(tideForecast) {
      SAILDASH.tideSpinner.stop();
      $("#tidespinner").hide();
      SAILDASH.setupTideGraph();
      SAILDASH.setTideData(tideForecast);
      SAILDASH.updateTideGraph();
      SAILDASH.dateSlider.enable();
      $("#helptext").show();
      $(".handle").animate({color: "#FFF"}, 200, "ease");
    });
  });
});
