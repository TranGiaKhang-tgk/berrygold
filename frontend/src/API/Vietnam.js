import axios from "axios";

// URL cố định của Address Kit 2025 (sau sáp nhập)
const BASE_URL = "https://production.cas.so/address-kit/2025-07-01";

/**
 * Lấy danh sách Tỉnh / Thành phố Việt Nam
 * @returns {Promise<Array>} provinces[]
 */
export async function getProvinces() {
  try {
    const res = await axios.get(`${BASE_URL}/provinces`);
    return res.data.provinces || [];
  } catch (error) {
    console.error("❌ Lỗi tải Tỉnh/Thành:", error);
    return [];
  }
}

/**
 * Lấy danh sách Phường / Xã theo mã Tỉnh
 * @param {string} provinceCode
 * @returns {Promise<Array>} communes[]
 */
export async function getCommunes(provinceCode) {
  if (!provinceCode) return [];
  try {
    const res = await axios.get(`${BASE_URL}/provinces/${provinceCode}/communes`);
    return res.data.communes || [];
  } catch (error) {
    console.error("❌ Lỗi tải Phường/Xã:", error);
    return [];
  }
}
