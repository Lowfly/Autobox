#!/usr/bin/python

from xml.dom.minidom import Document
from serial import Serial
import time
import os, sys
import MySQLdb

ser = Serial('/dev/ttyACM0', 9600)
temp = 0.0
humi = 0.0
db = MySQLdb.connect(host="localhost", user="root", passwd="YOUR PASSWORD", db="Autobox")
cur = db.cursor()

while 1:
    isSet = 0
    temp = 0.0
    humi = 0.0
    data = ser.readline()
    while isSet is not 1:
        data = ser.readline()
        datalist = data.split('=')
        humi = datalist[1]
        temp = datalist[3]
        if temp != 0.0 and humi != 0.0:
            isSet = 1
    cur.execute ("UPDATE sensor SET sensor.value=%s WHERE sensor.id = 1" % (temp))
    db.commit()
    cur.execute ("UPDATE sensor SET sensor.value=%s WHERE sensor.id = 2" % (humi))
    db.commit()
    cur.execute("SELECT sensor.value FROM sensor WHERE sensor.id=1")
    for row in cur.fetchall() :
        valuetemp = row[0]
    cur.execute("SELECT sensor.value FROM sensor WHERE sensor.id=2")
    for row in cur.fetchall() :
        valuetemp = row[0]
    time.sleep(1)
    
