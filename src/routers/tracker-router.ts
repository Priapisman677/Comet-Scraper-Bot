import { Router } from 'express';
//*types:
//prettier-ignore
import validateAndCatchErrors from "../middleware.ts/validateAndCatchErrors.js";
//prettier-ignore
import { addManyToTracker, addOneToTracker } from "../controllers/tracker/add-to-tracker-controller.js";
//prettier-ignore
import { addManyToTrackerSchema, addOneToTrackerSchema, checkForUpdatesSchema } from "../zod-schemas/tracker-schemas.js";
//prettier-ignore
import { checkForUpdates, displayTrackedProductsIds } from "../controllers/tracker/check-for-udates-controller.js";
//prettier-ignore
import { deleteAllFromTracker, deleteManyFromTracker } from "../controllers/tracker/delete-tracked-controller.js";
//prettier-ignore
import authMiddleware from "../middleware.ts/auth-middleware.js";

const router = Router();

router.post(
	'/tracker/addOne',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(addOneToTracker, addOneToTrackerSchema)
);

router.post(
	'/tracker/addMany',
    validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(addManyToTracker, addManyToTrackerSchema)
);

router.post(
	'/tracker/checkforupdates',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(checkForUpdates, checkForUpdatesSchema)
);

router.get(
	'/tracker/displayProductsIds',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(displayTrackedProductsIds)
);


router.delete(
	'/tracker/delete/:id',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(deleteManyFromTracker)
);

router.delete(
	'/tracker/deleteAll',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(deleteAllFromTracker)
);

export default router;
