import { Router } from "express";
import type { RequestHandler } from "express";
import { analysisIdSchema, analysisInputSchema, analysisQuerySchema } from "../schemas/analysis.js";
import { validate } from "../middleware/validate.js";
import type { AnalysisWorkflow } from "../services/analysisWorkflow.js";

const asyncHandler = (handler: RequestHandler): RequestHandler => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

export function createAnalysisRouter(workflow: AnalysisWorkflow): Router {
  const router = Router();

  router.post(
    "/",
    validate("body", analysisInputSchema),
    asyncHandler(async (_request, response) => {
      const body = response.locals.body as ReturnType<typeof analysisInputSchema.parse>;
      const created = await workflow.create(body);
      response.status(201).json(created);
    }),
  );

  router.get(
    "/",
    validate("query", analysisQuerySchema),
    asyncHandler(async (_request, response) => {
      const query = response.locals.query as ReturnType<typeof analysisQuerySchema.parse>;
      response.json(await workflow.list(query));
    }),
  );

  router.get(
    "/:id",
    validate("params", analysisIdSchema),
    asyncHandler(async (_request, response) => {
      const params = response.locals.params as ReturnType<typeof analysisIdSchema.parse>;
      response.json({ analysis: await workflow.get(params.id) });
    }),
  );

  return router;
}
