var http = require('http');

// the url that users are asking for needs to be parsed, to turn this into an actual API
var url = require('url');

var StringDecoder = require('string_decoder').StringDecoder;

// the server should respond to all requests with a string


var server = http.createServer(function(req, res){


// Get the URL & parse it 
var parsedURL = url.parse(req.url, true);
// Get the path
var path = parsedURL.pathname;
var trimmedPath = path.replace(/^\/+|\/+$/g,'')    // hmmm question: what's the 'g'? lolz

// Get the query string as an object
var queryStringObject = parsedURL.query;



// Get the HTTP method
    var method = req.method.toLowerCase();   // careful with capitalization here for some reason 

// Get the headers as an object
    var headers = req.headers;  // missing the Postman API testing software

// Get payload if there is any

    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){              // data is an event, and function is callback 
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();

        //Choose the handler this request should go to
        var chosenHandler = typeof(router[trimmedPath]) !=='undefined' ? router[trimmedPath] : handlers.notFound;

        //Construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        //Route the req to the handler specified in the router
        chosenHandler(data,function(statusCode, payload){
            // Use the status code callback by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode: 200;
            // Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {}; //this means it will either be the payload received, or {

            var payloadString = JSON.stringify(payload); ///this is the payload that the server sends back to user!

            //Return the response
            res.writeHead(statusCode);
            res.end(payloadString);

            //Log the request path
            console.log('Request received on path: '+trimmedPath+ ' with method'+method+' and with these query params:',queryStringObject);

        });

        // Send the response
        res.end('Hello World\n');

        console.log('Here comes the payload: ',buffer);
});


    })

// start the server and have it listen on port 3000

server.listen(3000, function(){
    console.log('The server is now listening on port 3000');
});

//Define the handlers
var handlers = {};


//Sample handler
handlers.sample = function(data, callback){
    //Callback an http status code, and a payload object
    callback(406, {'name' : 'sample handler'});
};

//Not found handler
handlers.notFound = function(data, callback){
    callback(404);  //This doesn't need a payload
};

var router = {
    'sample' : handlers.sample
}




