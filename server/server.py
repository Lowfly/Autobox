#!/usr/bin/python

import socket
import signal
import sys

Sock = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
Host = 'vps65637.ovh.net'
Port = 43

def signal_handler(signal, frame):
        client.send("quit")
        RequeteDuClient = client.recv(255)
        print RequeteDuClient,"\a"
        client.shutdown(0)
        client.close()
        Sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

Sock.bind((Host,Port))
Sock.listen(1)
client, adresse = Sock.accept()
print "L'adresse",adresse,"vient de se connecter au serveur !"
while 1:
        RequeteDuClient = client.recv(255)
        if not RequeteDuClient:
                break
        print RequeteDuClient,"\a"
        msg = raw_input('>> ')
        client.send(msg)
