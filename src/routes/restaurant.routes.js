import { Router } from "express";
import multer from "multer";

import {
    getAllRestaurants,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant
} from "../controllers/restaurant.controller.js";

const router = Router();
const upload = multer({ dest: "uploads/" });


router.get("/", getAllRestaurants);


router.post("/add", upload.single("image"), addRestaurant);


router.put("/:restaurantId", upload.single("image"), updateRestaurant);


router.delete("/:restaurantId", deleteRestaurant);

export default router;
