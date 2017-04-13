"""
Handles connection with client, calls main method to build targeted vector with
arguments from the client. Websockets implementation from
https://github.com/BruceEckel/hello-flask-websockets
"""

# Imports from Websockets tutorial:
import os
import sys
from gevent import monkey
monkey.patch_all()

import time
from flask import Flask, render_template, session, request
from flask.ext.socketio import SocketIO, emit, disconnect

from py.interpreter import *

app = Flask(__name__)
app.debug = True # change in dev/prod
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

sep = ":::"; # separates files
clientConnected = False;
global waitToSendMsg
waitToSendMsg = [];

@app.route('/')
def index():
    return render_template("index.html");


@socketio.on('sendSimFile', namespace='/link')
def sim_message(message):
    # process input message into geneName, geneFileStr, HRann and other params
    msgList = message["data"].split(sep);
    fileContent = msgList[0]; # number identifier
    simTime = float(msgList[1]);
    timeStep = float(msgList[2]);
    # lengthLHR = [int(i) for i in msgList[4].split(",")];
    # endsLHR = int(msgList[9]);
    # codonSampling = (msgList[19] == "Codon Sampling");
    print 'Received Sim info'
    file = open('data.dat','w')
    file.write(fileContent)
    file.close()
    simResults = [];
    try:
        evtBlk = interpreter()

        import py.rungekutta as rungekutta
        import py.gillespie as gillespie

        simRKResults = rungekutta.rungekutta(evtBlk,simTime,timeStep)
        simResults = (sep+sep+sep+sep).join((sep+sep+sep).join((sep+sep).join(sep.join(str(d) for d in s) for s in trace) for trace in result) for result in [simRKResults,[]])
        sendMsg(simResults,'simOutput')
        simGilResults = gillespie.gillespie(evtBlk,simTime)
    except:
        sendMsg('Error!',"error");
        raise
    else:
        simResults = [simRKResults,simGilResults]
        simResults = (sep+sep+sep+sep).join((sep+sep+sep).join((sep+sep).join(sep.join(str(d) for d in s) for s in trace) for trace in result) for result in simResults)
        print simResults
        sendMsg(simResults,'simOutput')

        sendMsg('Process complete',"misc");



    #output = pSN054TargetGene(geneName, geneFileStr, codonOptimize=optimOrg, useFileStrs=True, HRannotated=HRann,lengthLHR=lengthLHR, lengthRHR=lengthRHR, gibsonHomRange=lengthGib, optimRangeLHR=optimLHR, optimRangeRHR=optimRHR, endSizeLHR=endsLHR, endSizeRHR=endsRHR, endTempLHR=endTempLHR, endTempRHR=endTempRHR, gibTemp=gibTemp, gibTDif=gibTDif, maxDistLHR=maxDistLHR, maxDistRHR=maxDistRHR, minGBlockSize=minFragSize, codonSampling=codonSampling, minGRNAGCContent=minGRNAGCContent, onTargetMethod=onTargetMethod, minOnTargetScore=minOnTargetScore, offTargetMethod=offTargetMethod, offTargetThreshold=offTargetThreshold, maxOffTargetHitScore=maxOffTargetHitScore, enzyme=enzyme, PAM=PAM); # call result
    #outMsg = queryNumber + sep + output["geneName"] + sep + output["geneFileStr"] + sep + output["plasmidFileStr"] + sep + output["editedLocusFileStr"] + sep + output["oligoFileStr"] + sep + output["logFileStr"];
    sendMsg('Process complete',"misc");
    #sendMsg(outMsg, "simOutput");


@socketio.on('misc', namespace='/link')
def misc_message(message):
    print message['data'] + " :: received"

def checkResend():
    clientConnected = True;
    if len(waitToSendMsg) > 0:
        sendMsg(waitToSendMsg[0],waitToSendMsg[1]);
        #waitToSendMsg = []

def sendMsg(msg,pType):
    waitToSendMsg = [msg,pType];

    socketio.emit(pType, {'data': msg}, namespace='/link');
    print pType + " :: sent"


@socketio.on('disconnect request', namespace='/link')
def disconnect_request():
    emit('my response', {'data': 'Disconnected!', 'count': session['receive_count']} )
    disconnect()


@socketio.on('connect', namespace='/link')
def test_connect():
    checkResend()

    emit('my response', {'data': 'Connected', 'count': 0})


@socketio.on('disconnect', namespace='/link')
def test_disconnect():
    print('Client disconnected')
    clientConnected = False;

@socketio.on('cred', namespace='/link')
def validate_credentials(message):
    print('Received credentials: ');
    if message["data"] == passcode:
        emit('validCred',{'data':'You know it!'});
    else:
        emit('invalidCred',{'data':"You either have it or you don't"});


if __name__ == "__main__":
    # Fetch the environment variable (so it works on Heroku):
    socketio.run(app, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
