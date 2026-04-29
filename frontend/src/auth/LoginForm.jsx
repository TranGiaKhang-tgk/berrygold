import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut} from "firebase/auth";
import {doc, updateDoc, setDoc, serverTimestamp, collection, query, where, getDocs} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function LoginForm({ switchMode, onClose, onLoginSuccess }) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // ===============================
  // 🔐 LOGIN EMAIL / PASSWORD
  // ===============================
  const handleLogin = async () => {
    if (!account || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, account, password);
      const user = userCredential.user;

      const q = query(collection(db, "users"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Không tìm thấy user");
        await signOut(auth);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.status !== "active") {
        setError("Tài khoản đã bị khóa!");
        await signOut(auth);
        return;
      }

      await updateDoc(userDoc.ref, {
        lastLogin: serverTimestamp(),
        isOnline: true,
      });

      setError("");
      setSuccess(true);

      // ✅ Truyền email + totpEnabled lên AuthModal
      const totpEnabled = userData.totpEnabled || false;

      if (onLoginSuccess) {
        onLoginSuccess(user.email, totpEnabled);
      } else {
        setTimeout(() => {
          onClose();
          navigate("/");
        }, 1200);
      }

    } catch (err) {
      if (err.code === "auth/user-not-found") setError("Tài khoản chưa được đăng ký");
      else if (err.code === "auth/wrong-password") setError("Mật khẩu không đúng");
      else if (err.code === "auth/invalid-email") setError("Email không hợp lệ");
      else setError("Đăng nhập thất bại, vui lòng thử lại");
      setSuccess(false);
    }
  };

  // ===============================
  // 🔵 LOGIN GOOGLE
  // ===============================
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const q = query(collection(db, "users"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      let userRef;
      let totpEnabled = false;

      if (querySnapshot.empty) {
        userRef = doc(collection(db, "users"));
        await setDoc(userRef, {
          name: user.displayName || "",
          email: user.email,
          photoURL: user.photoURL || "",
          role: "user",
          status: "active",
          totpEnabled: false,
          isOnline: true,
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      } else {
        userRef = querySnapshot.docs[0].ref;
        const userData = querySnapshot.docs[0].data();

        if (userData.status !== "active") {
          setError("Tài khoản đã bị khóa!");
          await signOut(auth);
          return;
        }

        //totpEnabled từ Firebase
        totpEnabled = userData.totpEnabled || false;

        await updateDoc(userRef, { isOnline: true, lastLogin: serverTimestamp(), });
      }

      setError("");
      setSuccess(true);

      //Google login cũng check 2FA
      if (onLoginSuccess) {
        onLoginSuccess(user.email, totpEnabled);
      } else {
        setTimeout(() => {
          onClose();
          navigate("/");
        }, 1000);
      }

    } catch (err) {
      console.error(err);
      setError("Đăng nhập Google thất bại");
      setSuccess(false);
    }
  };

  return (
    <form className="auth-form">
      <h2 className="auth-title">Đăng nhập</h2>

      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
      </div>

      <div className="auth-forgot" onClick={() => switchMode("forget")}>
        Quên mật khẩu?
      </div>

      {error && <div style={{ color: "#d70018" }}>{error}</div>}
      {success && (
        <div style={{ color: "#2e7d32" }}>
           Đăng nhập thành công! {success && "Đang kiểm tra bảo mật..."}
        </div>
      )}

      <button type="button" className="auth-btn primary" onClick={handleLogin}>
        Đăng nhập
      </button>

      <div className="auth-divider">
        <span>Hoặc đăng nhập bằng</span>
      </div>

      <button type="button" className="auth-btn google" onClick={handleGoogleLogin}>
        🔵 Đăng nhập với Google
      </button>

      <div className="auth-switch">
        Chưa có tài khoản?{" "}
        <span onClick={() => switchMode("register")}>Đăng ký ngay</span>
      </div>
    </form>
  );
}