// Strong typing
let message: string = "Hello";
message = "Bye";
console.log(typeof message);
let age = 25;
console.log(typeof age);
let isActive = true;
console.log(typeof isActive);
let numbers = [1, 2, 3];
console.log(typeof numbers);

// Add `any` type for dynamic typing
let data: any = "Hola";
console.log(typeof data);

data = 20;
console.log(typeof data);

// Static type for function args and return type
function add(a: number, b: number): number {
    return a + b;
}
console.log(add(3, 2)); // 5

// Object with Static Object definition
let user: { name: string; age: number } = { name: "bob", age: 34 };
console.log(user);
