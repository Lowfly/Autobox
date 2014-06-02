#!/usr/bin/python

import socket
import RPi.GPIO as GPIO
import time
from xml.dom.minidom import parse
import MySQLdb

db = MySQLdb.connect(host="localhost", user="root", passwd="YOUR PASSWORD", db="Autobox")
cur = db.cursor()
sock = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
Host = 'vps65637.ovh.net'
Port = 43
data = []
	
GPIO.setmode(GPIO.BCM)

GPIO.setup(4,GPIO.OUT)
GPIO.output(4,GPIO.HIGH)
time.sleep(0.025)
GPIO.output(4,GPIO.LOW)
time.sleep(0.02)

GPIO.setup(4, GPIO.IN, pull_up_down=GPIO.PUD_UP)

for i in range(0,500):
	data.append(GPIO.input(4))

def gpioInit():
	GPIO.setmode (GPIO.BOARD)
	GPIO.setup(07, GPIO.OUT)

def networkInit():
	sock.connect((Host,Port))
	sock.send("Connect OK")

def bin2dec(string_num):
	return str(int(string_num, 2))

gpioInit()
networkInit()

state = True
i = 0
while state:
        serverReq = sock.recv(255)
	db.commit()
        if not serverReq :
                break
        print serverReq,"\a"
	if serverReq == "ON":
		GPIO.output(07, GPIO.HIGH)
		sock.send("Lampe ON")
	elif serverReq == "OFF":
		GPIO.output(07, GPIO.LOW)
		sock.send("Lampe OFF")
	elif serverReq == "HUMIDITY":
		cur.execute("SELECT sensor.value FROM sensor WHERE sensor.id=2") 
		for row in cur.fetchall() :
			valuetemp = row[0]
		print "value = ", valuetemp
		sock.send("Humiditee:"+ valuetemp +"%")
	elif serverReq == "TEMPERATURE":
		cur.execute("SELECT sensor.value FROM sensor WHERE sensor.id=1") 
		for row in cur.fetchall() :
			valuetemp = row[0]
		print "value = ", valuetemp
		sock.send("Temperature:"+ valuetemp +"C")
	elif serverReq == "quit":
		sock.send("Deconnexion")
		break
	else:
		sock.send("Bad message")
