import express from "express"
import { createAddress, deleteAddress, getAddressById,getAddresses, setDefaultAddress, updateAddress } from "../controllers/adress.controller.js"
const router = express.Router()
import protect from "../app/Middleware/auth.middleware.js";


router.use("/addresses", protect);

router.get("/addresses",getAddresses)
router.get("/addresses/:id",getAddressById)
router.post("/addresses",createAddress)
router.put("/addresses/:id",updateAddress)
router.delete("/addresses/:id",deleteAddress)
router.patch("/addresses/:id/default",setDefaultAddress)
export default router