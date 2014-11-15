#!/usr/bin/env python
# 
# test-messages.py - This script publish a random MQTT messages every 2 s.
#
# Copyright (c) 2013, Fabian Affolter <fabian@affolter-engineering.ch>
# Released under the MIT license. See LICENSE file for details.
#
import random
import time
import paho.mqtt.client as paho

timestamp = int(time.time())

broker = 'vps115203.ovh.net'
port = 22
element = 'home'
areas = ['front', 'back', 'kitchen', 'basement', 'living']
entrances = ['door', 'window']
states = ['true', 'false']

print 'Messages are published on topic %s/#... -> CTRL + C to shutdown' \
    % element

while True:
    area = random.choice(areas)
    if (area in ['basement', 'living']):
        topic = element + '/' + area + '/temp'
        message = random.randrange(0, 30, 1)
    else:
        topic = element + '/' + area + '/' + random.choice(entrances)
        message = random.choice(states)

    client = paho.Client("mqtt-panel-test")
    client.connect(broker)
    client.publish(topic, message)
    time.sleep(2)
