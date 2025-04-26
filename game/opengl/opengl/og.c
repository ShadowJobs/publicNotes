//
//  og.c
//  opengl
//
//  Created by playcrab on 24/10/14.
//  Copyright (c) 2014年 playcrab. All rights reserved.
//

#include "og.h"
#include "time.h"
#define WIDTH 400
#define HEIGHT 400
#include <math.h>

void drawRect(int i)
{
    glClear( GL_DEPTH_BUFFER_BIT|GL_STENCIL_BUFFER_BIT    );
    glEnable(GL_STENCIL_TEST);
    glEnable(GL_ALPHA_TEST);
    glEnable(GL_DEPTH_TEST);
    glAlphaFunc(GL_GREATER, 0);
    
        glClearStencil(1);
//    glStencilFunc(GL_NEVER, 1, 1);
    glStencilFunc(GL_NEVER, 3, 1);
//    glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);
    glStencilOp(GL_REPLACE, GL_REPLACE, GL_REPLACE);
    glBegin(GL_POLYGON);
    glPushMatrix();
    glColor4f(255, 0, 255, 0);
    glVertex3d(0+i*0.1,0.5,0.1);
    glColor4f(1, 0, 0,0.1);
    glVertex3d(0+i*0.1, 0,0.1);
    glColor4f(0,1, 0,0.5);
    glVertex3d(0.5+i*0.1,0.5,0.1);
    glEnd();
    glPopMatrix();
    
    glDisable(GL_ALPHA_TEST);
    
    glClear( GL_DEPTH_BUFFER_BIT    );
//    glStencilMask(3);
    glStencilFunc(GL_EQUAL, 3, 1);
    glStencilOp(GL_KEEP, GL_KEEP, GL_KEEP);
    
    glBegin(GL_POLYGON);
    glPushMatrix();
    glColor4f(255, 0, 255, 0);
    glVertex3d(0+(i+1)*0.1,0.5,0.1);
    glColor4f(1, 0, 0,0.1);
    glVertex3d(0+(i+1)*0.1, 0,0.1);
    glColor4f(0,1, 0,0.5);
    glVertex3d(0.5+(i+1)*0.1,0.5,0.1);
    glEnd();
    glPopMatrix();
    
    
    glDisable(GL_ALPHA_TEST);
//    
//    glClear( GL_DEPTH_BUFFER_BIT    );
//    glStencilFunc(GL_EQUAL, 1, 1);
//    glStencilOp(GL_KEEP, GL_KEEP, GL_KEEP);
    
//    glBegin(GL_QUADS);
//    glRotated(10, 0, 0, 1);
//    glPushMatrix();
//    glColor4f(255, 0, 255, 0);
//    glVertex3d(0+(i+1)*0.1,0.5+0.2,0.1);
//    glColor4f(1, 0, 0,0.1);
//    glVertex3d(0+(i+1)*0.1, 0+0.2,0.1);
//    glColor4f(0,1, 0,0.5);
//    glVertex3d(0.5+(i+1)*0.1,0+0.2,0.1);
//    glColor4f(0,1, 0,0.5);
//    glVertex3d(0.5+(i+1)*0.1,0.5+0.2,0.1);
//    glEnd();
    glPopMatrix();
}


void drawRectIdle(void) {
//    for(int i=1;i<3 ;i++)
    //    {
    drawRect(1);
//    drawRect(2);
//    }
    glutSwapBuffers()   ;
}




#define ColoredVertex(c, v) do{ glColor3fv(c); glVertex3fv(v); }while(0)
GLfloat angle = 0.0f;
GLfloat scale=0.0f;
int usecount=1;
void myDisplay(void) {
    static int list = 0;
    if( list == 0 )
    {
        // 如果显示列表不存在,则创建
        GLfloat
        PointA[] = { 0.5f, -sqrt(6.0f)/12, -sqrt(3.0f)/6},
        PointB[] = {-0.5f, -sqrt(6.0f)/12, -sqrt(3.0f)/6},
        PointC[] = { 0.0f, -sqrt(6.0f)/12, sqrt(3.0f)/3},
        PointD[]={0.0f, sqrt(6.0f)/4, 0};
        GLfloat
        ColorR[] = {1, 0, 0},
        ColorG[] = {0, 1, 0},
        ColorB[] = {0, 0, 1},
        ColorY[] = {1, 1, 0};
        list = glGenLists(1);
        glNewList(list, GL_COMPILE);//
        glBegin(GL_TRIANGLES);
        int draw=1;
//        draw的取值范围1：正四面体，2 三角形
        switch (draw) {
            case 1:
                
                //         平面 ABC
                ColoredVertex(ColorR, PointA); ColoredVertex(ColorG, PointB); ColoredVertex(ColorB, PointC);
                // 平面 ACD
                ColoredVertex(ColorR, PointA); ColoredVertex(ColorB, PointC); ColoredVertex(ColorY, PointD);
                // 平面 CBD
                ColoredVertex(ColorB, PointC); ColoredVertex(ColorG, PointB); ColoredVertex(ColorY, PointD);
                // 平面 BAD
                ColoredVertex(ColorG, PointB); ColoredVertex(ColorR, PointA); ColoredVertex(ColorY, PointD);
                glEnd();
                glEndList();
                glEnable(GL_DEPTH_TEST);

                break;
            case 2:
                glColor4f(1, 0, 0,0.1);
                glVertex3d(0.0, 0.5,0);
                glColor4f(0,1, 0,0.5);
                glVertex3d(0.0,0.0,0);
                glColor4f(0, 0, 1,1);
                glVertex3d(0.5, 0.0,0);
                glEnd();
                glEndList();
                glEnable(GL_DEPTH_TEST);
    
                drawRect(1);
                break;
            default:
                break;
        }    }
    // 已经创建了显示列表,在每次绘制正四面体时将调用它
    
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

//    glClearStencil(7);
//    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT|GL_STENCIL_BUFFER_BIT);
//    glEnable(GL_DEPTH_TEST);
    
//    for(int i=1;i<2;i++)
//    {
//        drawRect(i);
//    }
//    glEnable(GL_STENCIL_TEST);
//    glEnable(GL_SCISSOR_TEST); //启用剪裁测试
//    glEnable(GL_ALPHA_TEST);
//    glAlphaFunc(GL_GREATER, 0.0f);
//    glScissor(200, 200, 100, 100);
//    glStencilOp(GL_KEEP, GL_KEEP, GL_KEEP);
    //    glStencilFunc(GL_LEQUAL   , 2, 3);    glBegin(GL_TRIANGLES);
//    glClearStencil(0);
//glClear(GL_DEPTH_BUFFER_BIT|GL_STENCIL_BUFFER_BIT);
//    glStencilOp(GL_KEEP, GL_KEEP, GL_KEEP);
//    glStencilFunc(GL_LESS, 4,011);
//    glEnable(GL_STENCIL_TEST);
//    glBegin(GL_TRIANGLE_STRIP);
    glPushMatrix();
    glRotatef(angle, 1, 1, 1);
//    glRotatef(180, 1,1,0);
//    glScalef(0,0, 50);
//    glTranslated(0.5,0.5,-1);
    glCallList(list);
    glPopMatrix();
//    glEnd();
    glutSwapBuffers();
}
void myIdle(void) {
    ++angle;
    if( angle >= 360.0f )
        angle = 0.0f;
    scale=scale+0.1;
    if (scale>=1)
        scale=0.1;
    myDisplay();
}
int main(int argc,char * argv[])
{
    printf("%d",123);
    
    glutInit(&argc, argv);
//    glutInitDisplayMode(GLUT_RGBA |GLUT_DOUBLE);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA | GLUT_STENCIL);
    glutInitWindowPosition(200, 200);
    glutInitWindowSize(WIDTH, HEIGHT);
    glutCreateWindow("OpenGL 窗口");
    int draw=1;
    switch (draw) {
        case 1:
            glutDisplayFunc(&myDisplay);
            glutIdleFunc( &myIdle);
            break;
        case 2 :
            glutDisplayFunc(&drawRect);
            glutIdleFunc(&drawRectIdle);
            break;
        case 3 :
            glutDisplayFunc(&drawRect);
            glutIdleFunc(&drawRectIdle);
            
        default:
            break;
    }
    glutMainLoop();
    return 0;
    
    
}

