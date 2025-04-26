class Animal():
    name="Animal"
    def __init__(self):
        self.base = "animalbase"
    def print(self):
        print("animal.print",self.base, self.name)

class Dog(Animal):
    # name = "dog"
    # _name='dog'
    def __init__(self):
        self.base = "dogbase"
    def print(self):
        print("Dog.print", self.base, self.name)
    @property
    def name(self):
        return self._name
    @name.setter
    def name(self, v):
        self._name = v
    def __enter__(self):
        print("__enter__")
    def __exit__(self, excep, b, c):
        print("__exit__")
        print(b)
    
from types import MethodType
from enum import Enum
Month = Enum('Month', ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'))

def t1():
    with Dog() as d:
        try:
            1/0
        finally:
            return "normal"
    print("tt1")
    return ("t1")

if __name__ == "__main__":
    a = Dog()
    def setAge(self,age):
        self.age=age
    Dog.setAge = setAge
    a.setAge(10)
    try:
        f = open('/path/to/file', 'r')
        f.read()
    except Exception as e:
        pass;
    finally:
        pass
    print(t1())
    print("ddddd")