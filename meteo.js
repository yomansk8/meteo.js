(function() {
  var URL, Meteo, http, isModule;

  isModule = typeof module !== "undefined" && module.exports;

  if (isModule) {
    require('sugar');
    http = require("http");
    URL = require('url');
  }

  Meteo = (function() {

    function Meteo() {}

    Meteo.kelvinToFahrenheit = function(value) {
      return (this.kelvinToCelsius(value) * 1.8) + 32;
    };

    Meteo.kelvinToCelsius = function(value) {
      return value - 273.15;
    };

    Meteo.metersSecondToKilometersHour = function(value){
      return  value * 3.6;
    };

    Meteo.getCourante = function(city, apiKey, callback) {
      var _this = this;
      return this._getJSON("http://api.openweathermap.org/data/2.5/weather?q=" + (encodeURIComponent(city)) + "&lang=fr&APPID=" + (encodeURIComponent(apiKey)), function(data) {
        return callback(new Meteo.Courante(data));
      });
    };

    Meteo.getPrevisions = function(city, nbDays, apiKey, callback) {
      var _this = this;
      return this._getJSON("http://api.openweathermap.org/data/2.5/daily?q=" + (encodeURIComponent(city)) + "&cnt=" + nbDays + "&lang=fr&APPID=" + (encodeURIComponent(apiKey)), function(data) {
        return callback(new Meteo.Previsions(data));
      });
    };

    Meteo._getJSON = function(url, callback) {
      if (isModule) {
        return http.get(URL.parse(url), function(response) {
          return callback(response.body);
        });
      } else {
        return $.ajax({
          url: url,
          dataType: "jsonp",
          success: callback
        });
      }
    };

    return Meteo;

  })();

  Meteo.Previsions = (function() {

    function Previsions(data) {
      this.data = data;
    }

    Previsions.prototype.startAt = function() {
      return new Date(this.data.list.min('dt').dt * 1000);
    };

    Previsions.prototype.endAt = function() {
      return new Date(this.data.list.max('dt').dt * 1000);
    };

    Previsions.prototype.day = function(date) {
      return new Meteo.Previsions(this._filter(date));
    };

    Previsions.prototype.low = function() {
      var output;
      if (!(this.data.list.length > 0)) {
        return void 0;
      }
      output = this.data.list.min(function(item) {
        return item.main.temp_min;
      });
      return output.main.temp_min;
    };

    Previsions.prototype.high = function() {
      var output;
      if (!(this.data.list.length > 0)) {
        return void 0;
      }
      output = this.data.list.max(function(item) {
        return item.main.temp_max;
      });
      return output.main.temp_max;
    };

    Previsions.prototype._filter = function(date) {
      var beginningOfDay, clone, endOfDay;
      if (date instanceof Date) {
        date = date.getTime();
      }
      clone = Object.clone(this.data);
      beginningOfDay = Date.create(date).beginningOfDay();
      endOfDay = Date.create(date).endOfDay();
      clone.list = clone.list.findAll(function(range) {
        var dateTimestamp;
        dateTimestamp = range.dt * 1000;
        if (dateTimestamp >= beginningOfDay.getTime() && dateTimestamp <= endOfDay.getTime()) {
          return range;
        }
      });
      return clone;
    };

    return Previsions;

  })();

  Meteo.Courante = (function() {

    function Courante(data) {
      this.data = data;
    }

    Courante.prototype.temperature = function() {
      var temperature;
      return temperature = this.data.main.temp;
    };

    Courante.prototype.conditions = function() {
      return this.data.weather[0].description;
    };

    Courante.prototype.minTemp = function(){
      return this.data.main.temp_min;
    };

    Courante.prototype.maxTemp = function(){
      return this.data.main.temp_max;
    };

    Courante.prototype.humidity = function(){
      return this.data.main.humidity;
    };

    Courante.prototype.windSpeed = function(){
      return this.data.wind.speed;
    };

    Courante.prototype.icon = function(){
      return this.data.weather[0].icon;
    };

    return Courante;

  })();

  if (isModule) {
    module.exports = Meteo;
  } else {
    window.Meteo = Meteo;
  }

}).call(this);