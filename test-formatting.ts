// This is intentionally messy code to test our formatting!
const messyObject = {
  name: 'John',
  age: 25,
  city: 'New York',
  hobbies: ['reading', 'coding', 'gaming'],
};

function messyFunction(
  param1: string,
  param2: number,
  param3: boolean
): string {
  if (param3 === true) {
    return `Hello ${param1}, you are ${param2} years old!`;
  } else {
    return 'Goodbye!';
  }
}

const messyArray = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

export { messyFunction, messyObject, messyArray };
