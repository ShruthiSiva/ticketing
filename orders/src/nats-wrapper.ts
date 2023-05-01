import nats, { Stan } from "node-nats-streaming";
class NatsWrapper {
  // _client doesn't immediately have to assigned in the constructor. We want to build it out only in the connect() method. So we add a ? to tell TS that this property may be undefined for some period of time.
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting.");
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this._client!.on("connect", () => {
        console.log("Connected to NATS");
        resolve();
      });
      // To handle failed connection request
      this._client!.on("error", (err) => {
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
