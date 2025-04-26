#coding=utf-8
import numpy as np
import decimal as d
import math
vec0=[d.Decimal(2)]
    
# for i in range(1,60):  #本公式是用e的极限定义求，用了这种方式后，就不能用香克斯变换，
#     vec0=np.append(vec0,(1+decimal.Decimal(1)/i)**i)

for i in range(2,20):
    vec0=np.append(vec0,vec0[i-2]+d.Decimal(1)/math.factorial(i))

def shanks(vec):
    vec2=[]
    for i in range(1,len(vec)-1):
        x=(vec[i+1]-2*vec[i]+vec[i-1])
        if x!=0:
            vec2.append(vec[i+1]-(vec[i+1]-vec[i])**2/x)
        else: break;
    return vec2

def gete1(evs):###Shanks Transform
    vec2=evs
    count=0
    while count<6:
        vec2=shanks(vec2);
        count+=1;
    print(vec2[len(vec2)-1])

def gete2():
    print (1+d.Decimal(1)/1000000)**1000000

def gete3():
    v=d.Decimal(1)/ math.factorial(1)
    result=d.Decimal(2)
    i=2
    while v>10E-30:
        v=d.Decimal(1)/ math.factorial(i)
        result+=v
        i+=1
    print result

gete1(vec0)

gete2()

gete3()


