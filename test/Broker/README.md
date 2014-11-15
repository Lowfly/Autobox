#<span style="color :#FF0000;">mqtt

mqtt broker

with **http interface** for publishing using http protocol ( PUT only ).

All traffic received on http is re-published to mqtt server to be consistent with primary mqtt strategy.

    $ curl -X PUT http://host:port/publish/:uuid/values/:channel -d value=100



