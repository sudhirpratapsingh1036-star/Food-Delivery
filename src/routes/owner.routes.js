import { Router } from "express";
import { loginOwner, registerOwner, logoutOwner, getOwnerProfile } from "../controllers/owner.controller.js";
import { verifyOwnerJWT  } from "../middlewares/authOwner.middleware.js";



const router = Router();

router.route("/register").post(registerOwner);
router.route('/login').post(loginOwner)


router.route('/profile').get(verifyOwnerJWT, getOwnerProfile);

export default router;