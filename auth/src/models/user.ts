import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties that are required to create a new User. While trying to use this model to, say, create a user, there is no way for TS to know if the properties we're passing in are defined in the schema or not. There's no way to validate what the user provides to the model, which is why we need this interface.
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that the User model has. While attempting to use a static function on the model such as User.build({...}),TypeScript throwas an error since it has no idea that the `build` method is a property on the User model (since it was declared as a static). So, we will need this interface to fix this error.
interface UserModel extends mongoose.Model<UserDoc> {
  build: (attrs: UserAttrs) => UserDoc;
}

// An interface that describes the properties that a User Document has (a single user in a collection)
// Once we build a user with `user = User.build({...})`, and try accessing user.email, TS will compain unless UserDoc is used correctly in the UserModel interface and mongoose.model call.
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      // String (javascript object, we're using the actual String constructor), not string (used by typescript)
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  // Tells mongoose how to turn a user document to JSON. By default, it just uses all the properties defined in the schema along with _id, __v etc. Cmd+click on toJSON to look at type definition.
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// mongoose does not have great support for async/await syntax, which is why we are provided with a "done" parameter in the callback. Once we're done executing the necessary async/await code, we need to manually call done() to tell mongoose we're done.
// We're also using a regular function instead of an arrow function. When we run this middleware, it makes the User document available in the callback function as `this` (for regular functions, `this` equals the object that owns the function). If we used an arrow function, it looks at the outer context (values in the file) as its `this` value.
// Reference: https://medium.com/geekculture/regular-vs-arrow-function-1f8140fbcece#:~:text=var%20name%20%3D%20%22Suprabha,newObject.regularFunc()%3B%20//%20supi
userSchema.pre("save", async function (done) {
  // `this` referes to the document.
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// To create a new User document, we would typically use `new User({email: 'email', password: "password"})`. But this wouldn't come built in with any sort of type checking and it might just allow us to create a user with invalid/additonal properties. Instead, we will use this static function on the userSchema in order to enforce type checking while creating a user.
userSchema.statics.build = (attrs: UserAttrs) => new User(attrs);

// Feed the schema into the model
// The angular brackets are like passing arguments into
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
