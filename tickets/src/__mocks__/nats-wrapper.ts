export const natsWrapper = {
  client: {
    // a mock fn is a fake fn that allows us to make expectations around whether it was called, how many times etc.
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
