libmain.a:main.o c.o a.o b.o
	ar rc bin/libmain.a bin/main.o bin/c.o bin/a.o bin/b.o
	g++ bin/main.o bin/c.o bin/a.o bin/b.o -o mainex
main.o:
	g++ -c main.cpp -o bin/main.o
c.o:
	g++ -c src/c.cpp -o bin/c.o
a.o:
	g++ -c src/a.cpp -o bin/a.o
b.o:
	g++ -c src/b.cpp -o bin/b.o
clean:
	rm bin/a.o bin/b.o bin/c.o bin/main.o

