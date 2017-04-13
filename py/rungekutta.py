from __future__ import division
import numpy as np
#import matplotlib.pyplot as plt

from ecuaciones import *

def rungekutta(evtBlk,tFinal=15000,hStep=0.2):
    exec evtBlk in globals(), locals()
    #array de tiempo
    t = [0.0]

    #array con los valores de la futura solucion
    ValsArr=[]
    #metemos los valores iniciales
    ValsArr.append(initVals)
    #este es el algoritmo determinista
    #para entender como funciona:
    # https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
    def rungeKutta(FuncArr,ValsArr,const,t,h=hStep,tf=tFinal):
        steps = int(tf/h)+1
        for step in range(1,steps):
            h=0.2
            k1=[]
            for i in range(len(FuncArr)):
                k1.append(FuncArr[i](ValsArr[step-1],const,t[step-1]))
            th2=(t[step-1]+h/2.0)
            k1 = np.array(k1)

            k2=[]

            for i in range(len(FuncArr)):
                coso = ValsArr[step-1]+h*k1/2.0
                k2.append(FuncArr[i](coso,const,th2))
            k2 = np.array(k2)
            k3=[]
            for i in range(len(FuncArr)):
                coso = ValsArr[step-1]+h*k2/2.0
                k3.append(FuncArr[i](coso,const,th2))
            k3 = np.array(k3)
            k4=[]
            th = (t[step-1]+h)
            for i in range(len(FuncArr)):
                coso = ValsArr[step-1]+h*k3
                k4.append(FuncArr[i](coso,const,th))
            k4= np.array(k4)
            t.append(t[step-1]+h)
            temp = []
            for i in range(len(FuncArr)):
                temp.append(ValsArr[step-1][i]+(h/6.0)*(k1[i]+2.0*k2[i]+2.0*k3[i]+k4[i]))
            ValsArr.append(temp)


    #corremos el algoritmo
    rungeKutta(funcArray,ValsArr,const,t)

    #ploteamos los resultados
    ValsArr = np.array(ValsArr)
    returnArr = []
    for i in range(len(funcArray)):
        yString = revparams.get("xs["+str(i)+"]")
        '''
        fig = plt.figure(figsize = (10,10))



        yString = revparams.get("xs["+str(i)+"]")
        plt.plot(t,ValsArr[:,i],label =yString )
        plt.xlabel(r"Tiempo (s)",fontsize= 20)
        plt.ylabel(r"" + yString,fontsize= 20)
        plt.title(yString+" vs Tiempo",fontsize = 30)
        plt.legend()
        plt.savefig(yString+".png")
        # plt.show()'''
        returnArr.append([t,ValsArr[:,i],['Time (s)'],[yString]])
    first = ValsArr[:,0]

    return returnArr
