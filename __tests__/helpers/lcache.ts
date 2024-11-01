import fastify from "fastify";
import lcache from "../../lib";
import type { ICacheOptions } from "../../lib/types/lcache";

/** Injected spy functions in the tested endpoints */
export const spies = {
  getPing: jest.fn(),
  postPing: jest.fn(),
  deletePing: jest.fn(),
  getJSON: jest.fn(),
  postPost: jest.fn(),
  getDate: jest.fn(),
  putPut: jest.fn(),
  postApiAdmin: jest.fn(),
};

export const getApp = (options: Partial<ICacheOptions> = {}) => {
  const app = fastify();
  app.register(lcache, options);

  app.after(() => {
    app.get("/ping", async (_req, reply) => {
      spies.getPing();
      reply.send("pong");
    });

    app.post("/ping", async (_req, reply) => {
      spies.postPing();
      reply.send("pong");
    });

    app.delete("/ping", async (_req, reply) => {
      spies.deletePing();
      reply.send("pong");
    });

    app.get("/json", async (_req, reply) => {
      spies.getJSON();
      reply.send({ hello: "world" });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.post("/post", async (req: any, reply) => {
      spies.postPost();
      reply.status(201);
      reply.send(req.body.data);
    });

    app.get("/date", async (_req, reply) => {
      spies.getDate();
      await new Promise((resolve) => {
        setTimeout(() => resolve(reply.send(Date.now())), Math.random() * 100);
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.put("/put", async (req: any, reply) => {
      spies.putPut();
      reply.status(201).send(req.body.data);
    });

    app.post("/api/admin", async (req, reply) => {
      spies.postApiAdmin();
      reply.send("secret");
    });
  });

  return app;
};
