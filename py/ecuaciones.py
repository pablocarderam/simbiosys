import numpy as np
#constantes
a = 0

b=3

c=5

const = {'b': 3.0, 'a': 0.0, 'c': 5.0}
#valores iniciales
initVals = [3.0, 2.0]
#parametros en el diccionario
params = {'x': 'xs[0]', 'y': 'xs[1]'}
#parametros en el diccionario reversados
revparams = {'xs[0]': 'x', 'xs[1]': 'y'}
#ecuaciones diferenciales
def x(xs,const,t):
	return -3*xs[0]*4  -2  +a 
def y(xs,const,t):
	return -3*xs[1]*4  -2 
funcArray = [x, y]
