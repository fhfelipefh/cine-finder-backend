import express from "express";
import cors from "cors";
import { config } from "dotenv";
import pino from "pino";
import { apiRoutes } from "./routes/index.js";
import { connectMongo } from "./config/database.js";

config();

const logger =
  process.env.NODE_ENV === "development"
    ? pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
      })
    : pino();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.info(
      {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
      "Request received"
    );
    next();
  }
);

app.use(apiRoutes);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error(
      {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
      },
      "Unhandled error"
    );

    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
);

app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: "Rota nao encontrada",
  });
});

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      logger.info({ port: PORT }, "Servidor iniciado");
      logger.info(`API disponivel em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error({ err }, "Falha ao conectar no MongoDB");
    process.exit(1);
  });

export default app;
