import { authenticator } from "otplib";
import QRCode from "qrcode";
import { db } from "../firebaseAdmin.js";
import { encrypt, decrypt } from "../utils/crypto.js";

// =====================
// SETUP 2FA — Tạo secret + QR code
// =====================
export const setupTOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // Tạo secret key ngẫu nhiên
    const secret = authenticator.generateSecret();

    // Tạo URL cho Google Authenticator
    const otpAuthUrl = authenticator.keyuri(email, "BerryGold", secret);

    // Tạo QR code dạng base64
    const qrCodeImage = await QRCode.toDataURL(otpAuthUrl);

    // Lưu secret vào Firebase (chưa verified)
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User không tồn tại" });
    }

    const encryptedSecret = encrypt(secret);

      await snapshot.docs[0].ref.update({
       totpSecret: encryptedSecret,
       totpEnabled: false,
    });
    return res.json({
      secret,
      qrCode: qrCodeImage, // Base64 image hiển thị trên frontend
    });

  } catch (err) {
    console.error("SETUP TOTP ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// =====================
// VERIFY — Xác minh mã 6 số
// =====================
export const verifyTOTP = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) return res.status(400).json({ error: "Email và token required" });

    // Lấy secret từ Firebase
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User không tồn tại" });
    }

    const userData = snapshot.docs[0].data();
    const encryptedSecret = userData.totpSecret;
    const secret = decrypt(encryptedSecret);

    if (!secret) {
      return res.status(400).json({ error: "2FA chưa được setup" });
    }

    // Verify mã 6 số
    const isValid = authenticator.verify({token,secret,window: 1});

    if (!isValid) {
      return res.status(401).json({ error: "Mã xác thực không đúng hoặc đã hết hạn" });
    }

    // Lần đầu verify thành công → bật 2FA
    if (!userData.totpEnabled) {
      await snapshot.docs[0].ref.update({ totpEnabled: true });
    }

    return res.json({ success: true, message: "Xác thực thành công!" });

  } catch (err) {
    console.error("VERIFY TOTP ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// =====================
// KIỂM TRA — User có bật 2FA không
// =====================
export const checkTOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User không tồn tại" });
    }

    const userData = snapshot.docs[0].data();

    return res.json({
      totpEnabled: userData.totpEnabled || false,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};