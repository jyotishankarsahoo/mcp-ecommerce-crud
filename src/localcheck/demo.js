// Dynamic Typing
let message = "Hello";
console.log(typeof message);
message = 2;
console.log(typeof message);
let numbers = [1, 2, 3];
console.log(typeof numbers);

// No Static type for function args and return type
function add(a, b) {
    return a + b;
}
console.log(add(3, "2")); //32

// Object is dynamic
let user = { name: "bob", age: 34 };
user.location = "California";
console.log(user);
