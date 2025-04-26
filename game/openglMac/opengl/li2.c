//
//  li2.c
//  opengl
//
//  Created by playcrab on 28/10/14.
//  Copyright (c) 2014年 playcrab. All rights reserved.
//

#include "li2.h"

#include "time.h"
#define WIDTH 400
#define HEIGHT 400
#include <math.h>
#define ColoredVertex(c, v) do{ glColor3fv(c); glVertex3fv(v); }while(0)
GLfloat angle = 0.0f;
GLfloat scale=0.0f;
int usecount=1;
void drawRect()
{
    glEnable(GL_DEPTH_TEST);
    glBegin(GL_POLYGON);
    
    glPushMatrix();
    //    glRotatef(angle, 1, 1, 1);
    //    glRotatef(180, 1,1,0);
    //    glScalef(0,0, 50);
    //    glTranslated(0.5,0.5,-1);
    glVertex3d(0,0.5,0);
    glColor4f(1, 0, 0,0.1);
    glVertex3d(0, 0,0);
    glColor4f(0,1, 0,0.5);
    glVertex3d(0.5,0.5,0);
    //    glColor4f(0, 0, 1,1);
    //    glVertex2d(0.5, 0.0);
    glEnable(GL_DEPTH_TEST);
    glEnd();
    //    glEndList();
    glPopMatrix();
    
}
void myDisplay(void) {
    
    glBegin(GL_POLYGON);
    
    glColor4f(1, 0, 0,0.1);
    glVertex3d(0.0, 0.5,0);
    glColor4f(0,1, 0,0.5);
    glVertex3d(0.0,0.0,0);
    glColor4f(0, 0, 1,1);
    glVertex3d(0.5, 0.0,0);
    glEnd();
    glEndList();
    glEnable(GL_DEPTH_TEST);
    
    glClearStencil(7);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT|GL_STENCIL_BUFFER_BIT);
    //    glEnable(GL_STENCIL_TEST);
    //    glEnable(GL_SCISSOR_TEST); //启用剪裁测试
    //    glEnable(GL_ALPHA_TEST);
    //    glAlphaFunc(GL_GREATER, 0.0f);
    //    glScissor(200, 200, 100, 100);
    glStencilOp(GL_KEEP, GL_KEEP, GL_KEEP);
    glStencilFunc(GL_LEQUAL   , 2, 3);
    
    drawRect();
    glutSwapBuffers();
    //    if( (usecount++)%5000==1)
    //        printf("use display:%d\n",usecount);
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
    glutDisplayFunc(&myDisplay);
    glutIdleFunc( &myIdle);
    glutMainLoop();
    return 0;
    
    
}
