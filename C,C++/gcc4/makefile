SRC=$(wildcard ./*.cpp)
OBJS=$(patsub %.cpp, %.o $(SRC))

main: $(OBJS)
	@g++ $^ -o mainex
%.o:%.c
	-g++ -c $< -o $@
clean:
	rm a.o b.o c.o main.o mainex
