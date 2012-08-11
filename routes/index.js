// Home page
exports.index = function(req, res){
  res.render('index', { title: 'Sailing Dash' });
};

exports.data = require('./data.js').data;
