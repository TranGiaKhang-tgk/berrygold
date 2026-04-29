  import { db } from "../firebaseAdmin.js";
  import { uploadImageToFreeImage } from "../utils/uploadImage.js";


  // ===============================
  // THÊM SẢN PHẨM
  // ===============================
  export const addProduct = async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        color,
        material,
        size
      } = req.body;

      const imageFiles = req.files?.images;

      if (!name || !description || !price || !category) {
        return res.status(400).json({
          message: "Thiếu dữ liệu bắt buộc"
        });
      }

      let uploadedUrls = [];

      if (imageFiles) {
        const imageArray = Array.isArray(imageFiles)
          ? imageFiles
          : [imageFiles];

        const results = await Promise.all(
          imageArray.map(async (file) => {
            if (file?.data && file?.name) {
              const url = await uploadImageToFreeImage(
                file.data,
                file.name
              );
              return url;
            }
            return null;
          })
        );

        uploadedUrls = results.filter(Boolean);
      }

      const newProduct = {
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        color: color || "",
        material: material || "",
        size: size || "",
        images:
          uploadedUrls.length > 0
            ? uploadedUrls
            : ["https://via.placeholder.com/300x300"],
        deleted: false,
        createdAt: new Date().toISOString()
      };

      const docRef = await db.collection("Products").add(newProduct);

      res.status(201).json({
        id: docRef.id,
        ...newProduct
      });

    } catch (err) {
      console.error("Error adding product:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message
      });
    }
  };


  // ===============================
  // LẤY DANH SÁCH SẢN PHẨM
  // ===============================
  export const getProducts = async (req, res) => {
    try {
      const snapshot = await db.collection("Products").get();

      const products = snapshot.docs
        .map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            ...data,
            image:
              data.image ||
              (Array.isArray(data.images) ? data.images[0] : "")
          };
        })
        .filter((p) => !p.deleted);

      res.status(200).json(products);

    } catch (err) {
      console.error("Error in getProducts:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message
      });
    }
  };


  // ===============================
  // LẤY CHI TIẾT SẢN PHẨM
  // ===============================
  export const getProductById = async (req, res) => {
    try {
      const { id } = req.params;

      const docRef = db.collection("Products").doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({
          message: "Không tìm thấy sản phẩm"
        });
      }

      res.status(200).json({
        id: docSnap.id,
        ...docSnap.data()
      });

    } catch (err) {
      console.error("Error in getProductById:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message
      });
    }
  };


  // ===============================
  // CẬP NHẬT SẢN PHẨM
  // ===============================
  export const updateProduct = async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        description,
        price,
        category,
        color,
        material,
        size
      } = req.body;

      const docRef = db.collection("Products").doc(id);

      await docRef.update({
        name,
        description,
        category,
        price: Number(price),
        color: color || "",
        material: material || "",
        size: size || "",
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        message: "Cập nhật sản phẩm thành công"
      });

    } catch (err) {
      console.error("Error updating product:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message
      });
    }
  };


  // ===============================
  // XÓA SẢN PHẨM (SOFT DELETE)
  // ===============================
  export const deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;

      const productRef = db.collection("Products").doc(id);

      await productRef.update({
        deleted: true,
        deletedAt: new Date().toISOString()
      });

      res.status(200).json({
        message: "Sản phẩm đã ngừng kinh doanh"
      });

    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message
      });
    }
  };