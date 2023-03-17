// abstract classes cannot be initialized. An abstract class is only a template definition of methods and variables of a class used by typescript.
export abstract class CustomError extends Error {
  // Similar to TS interfaces, where an object must satuistfy properties within it, we use the "abstract" keyword to specify values that must be used while initializing a subclass that extends CustomError.
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    // Need this line since we're extending a built-in class.
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  // We are making a decision to always send errors in the response as
  // {
  //   errors: {message: <text>, field}[]
  // }
  abstract serializeErrors(): { message: string; field?: string }[];
}
