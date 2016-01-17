var express 		= require('express');
var app 			= express();
var morgan       	= require('morgan');
var util 			= require('util');

app.disable('x-powered-by');
app.use(morgan('dev'));

app.use('/', express.static(__dirname));
app.listen(5002, function() { 
	// console.log('listening on 5002')
});