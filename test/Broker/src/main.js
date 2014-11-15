//
//  Broker based on simple mqtt mosquitto with HTTP interface for publishing only
//
//  usage: node Broker/mqtt/src/main.js --mqtt_port <port> --http_port <port>
//
//  clients:
//
//  mqtt
//
//      publish
//      $ mosquitto_pub -t 'UUID/values' -m 'channel/value' -p 1335
//
//      subscribe
//      $ mosquitto_sub -t '+' -h <ip> -p <port> -v
//
//  http
//      $ curl -X PUT http://<ip>:<port>/publish/:uuid/values/:channel -d value=1000
//
//      $ curl -X PUT http://localhost:1336/publish/2222/values/channel -d value=1000
//
// TODO : this broker interface should replace mosquitto at the end
// see https://https://github.com/adamvr/MQTT.js/tree/master/examples as examples (TLS version)
//

var ModuleName = 'Broker::mqtt';
var RootDir = process.cwd();

var log4js = require('log4js');
var logger = log4js.getLogger();

var argv = require('optimist').argv;

var mqtt = require('mqtt');

//
//  1st = cli arg / 2nd = environment variable / 3rd = default value
//
var MQTTport = argv.BROKER_MQTT_PORT   || process.env.BROKER_MQTT_PORT    ||  1883;
var HTTPport = argv.BROKER_HTTP_PORT   || process.env.BROKER_HTTP_PORT    ||  1336;

var QUIET = process.env.QUIET || 'false';

logger.info( ModuleName, 'starting mqtt broker...');
logger.info( ModuleName, 'listening mqtt on port '+MQTTport);

// eleve les logs (pour DEBUG d'autres modules)
if( QUIET == 'true' ){
  //logger.showlog = false;
}

//
//
//
mqtt.createServer( function(client) {

  var self = this;

  if (!self.clients) self.clients = {};

  client.on('connect', function(packet) {
    self.clients[packet.clientId] = client;
    client.id = packet.clientId;
    logger.info( ModuleName, "CONNECT: client id: " + client.id);
    client.subscriptions = [];
    client.connack({returnCode: 0});
  });

  client.on('subscribe', function(packet) {
    var granted = [];

    logger.info( ModuleName, 'SUBSCRIBE('+client.id+'): '+JSON.stringify(packet));

    for (var i = 0; i < packet.subscriptions.length; i++) {
      var qos = packet.subscriptions[i].qos
        , topic = packet.subscriptions[i].topic
        , reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$');

      granted.push(qos);
      client.subscriptions.push(reg);
    }

    client.suback({messageId: packet.messageId, granted: granted});
  });

  client.on('publish', function(packet) {
    logger.info( ModuleName, 'PUBLISH('+client.id+'): '+JSON.stringify(packet));

    for (var k in self.clients) {
      var c = self.clients[k];

      for (var i = 0; i < c.subscriptions.length; i++) {
        var s = c.subscriptions[i];

        if (s.test(packet.topic)) {
          c.publish({topic: packet.topic, payload: packet.payload});
          break;
        }
      }
    }
  });

  client.on('pingreq', function(packet) {
    logger.info( ModuleName, 'PINGREQ('+ client.id+')');
    client.pingresp();
  });

  client.on('disconnect', function(packet) {
    client.stream.end();
  });

  client.on('close', function(packet) {
    delete self.clients[client.id];
  });

  client.on('error', function(e) {
    client.stream.end();
    logger.error( ModuleName, 'event error handled:'+JSON.stringify(e) );
  });

}).listen( MQTTport );



// create mqtt client for internal re-publication...
var MQTT_client = mqtt.createClient( MQTTport, 'localhost' );

function republish ( uuid, type, channel, value )
{
    if ( type == 'values' || type == 'commands' ) {
        MQTT_client.publish( uuid+'/'+type, channel+'/'+value );
    }
    else {
        logger.error( ModuleName, 'Kind of publishing not handled:'+type );
    }
}



//
// HTTP server
// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:port/broker)
router.get('/', function(req, res) {
    res.json({ message: 'welcome to broker http api!' });
});

// more routes for our API will happen here
router.route('/:uuid/:type/:channel')

	// get all the bears (accessed at PUT http://localhost:port/broker/:uuid/:type/:channel )
	.put(function(req, res) {

        //logger.info( ModuleName, '/publish '+req.params.uuid+' '+req.params.type+' '+req.params.channel+' '+req.body.value ) ;
		republish( req.params.uuid, req.params.type, req.params.channel, req.body.value ) ;
        res.send("200 OK");

	});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /broker
app.use('/publish', router);

// START THE SERVER
// =============================================================================
app.listen(HTTPport);
logger.info( ModuleName, 'listening http on port '+HTTPport);


//
// void MainLoop()
//
function MainLoop()
{
    //logger.info( ModuleName, 'src/main.js    Mainloop');

    setTimeout(
            function()
            {
                MainLoop();
            },
            5 * 1000          // Every 5 Seconds, do the MainLoop !
    ) ;
}

MainLoop();
