// scrypt is the hasing function we will be using.
import { scrypt, randomBytes } from "crypto";

// scrypt is classback based. So we will be using primisify to convert it to async/await syntax.
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  // Static methods cannot be access through the initialized class but can be accessed through the class name. Class inheritence applies to static methods too.
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    // scrypt returns a buffer
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString("hex")}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString("hex") === hashedPassword;
  }
}
