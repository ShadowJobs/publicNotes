#coding=utf-8
import numpy as np
import decimal 
pi=1.0
vec0=np.array([decimal.Decimal(1.0)])
vlen=0;
# for i in range(2,100,2):
#     vec0=np.append(vec0,vec0[vlen]-2.0/(4*i*i-1))
#     vlen+=1
    
for i in range(2,50):
    v=i%2==0 and decimal.Decimal(-1.0) or decimal.Decimal(1.0)
    vec0=np.append(vec0,vec0[i-2]+decimal.Decimal((v/(2*i-1))))
vec0=np.multiply(vec0,decimal.Decimal(4))
def shanks(vec):
    vec2=[]
    for i in range(1,len(vec)-1):
        vec2.append(vec[i+1]-(vec[i+1]-vec[i])**2/(vec[i+1]-2*vec[i]+vec[i-1]))
    return vec2

def getPi(pivs):
    vec2=pivs
    count=0
    while count<8:##大于八次后，计算机已经无法处理精度了（等于0）
        vec2=shanks(vec2);
        count+=1;
        if len(vec2)<3:
            print(vec2[0]*4)
            break;
    print(vec2[len(vec2)-1])
getPi(vec0)
