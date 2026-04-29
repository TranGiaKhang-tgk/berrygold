import { db } from "../firebaseAdmin.js";
import { collection, getDocs, updateDoc } from "firebase/firestore";

const fixAllProducts = async () => {
    try {
        const snapshot = await getDocs(collection(db, "Products"));

        let count = 0;

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();

            // chỉ xử lý khi là string
            if (typeof data.quantity === "string") {
                const newQuantity = Number(data.quantity);

                await updateDoc(docSnap.ref, {
                    quantity: newQuantity
                });

                console.log(`✅ ${data.name}: ${data.quantity} → ${newQuantity}`);
                count++;
            }
        }

        console.log(`🎉 DONE! Đã fix ${count} sản phẩm`);
    } catch (err) {
        console.error("❌ Lỗi:", err);
    }
};

fixAllProducts();