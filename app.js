var express = require('express');
var request = require('request');
const path = require("path");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
  });

app.get('/maapLogin', function(req, res){

    // input value from client
    var params = req.query;

   serviceValidateUrl = 'https://auth.nasa.maap.xyz' +  
    '/cas/p3/serviceValidate?ticket=' + params.ticket + 
    '&service=' + params.service + 
    '&pgtUrl=' + params.pgtUrl + '&state=';
   
   console.log(serviceValidateUrl);
   
   request(serviceValidateUrl, function(err, resp, body) {
    console.log(body);

    var parseString = require('xml2js').parseString;
    parseString(body, function (err, result) {
        console.dir(result);

        // pass back the results to client side
        res.send(result);
    });
   });
   
});

app.get('/maapApi', function(req, res){
   
    request({
        headers: {
            'proxy-ticket': req.query.proxyTicket
        },
        uri: 'https://api.maap.xyz/api/members/self',
        method: 'GET'
        }, function (err, resp, body) {
            res.send(body);
    });
   
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});