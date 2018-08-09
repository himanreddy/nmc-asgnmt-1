//Import node modules
const http = require('http');
const url = require('url');
const config = require('./config');

const httpServer = http.createServer((req, res) => serverFunc(req, res));

httpServer.listen(config.port, () => {
    console.log('The server is listening on port ', config.port);
});

const handlers = {
    'notFound': (data, callback) => {
        callback(404, {
            'message': '404 not found'
        });
    },

    'hello': (data, callback) => {
        callback(200, {
            'message': 'Welcome to the world, hello!'
        });
    }
}

const router = {
    'hello': handlers.hello
}

const serverFunc = (req, res) => {

    //Parse the URL
    let parsedUrl = url.parse(req.url, true);

    //Get the path 
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //For some reason req.on('end')'s function wont be called without listening on 'data'
    req.on('data', (data) => {
        console.log(data);
    });

    req.on('end', () => {

        //check if the handler is present
        let handler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        handler({
            'method': req.method,
            'headers': req.headers
        }, (status, payload) => {
            //Use the status code called back by the handler or default to 404
            status = typeof(status) == 'number'? status : 404;

            //Use the payload called back by the handler or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(status);
            res.end(JSON.stringify(payload));
        });
    });

}