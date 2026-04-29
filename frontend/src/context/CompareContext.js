import { createContext, useContext, useState } from "react";

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);

  const addToCompare = (product) => {
    if (compareItems.find(p => p.id === product.id)) return;

    if (compareItems.length >= 3) {
      alert("Chỉ so sánh tối đa 3 sản phẩm");
      return;
    }

    setCompareItems([...compareItems, product]);
  };

  const removeFromCompare = (id) => {
    setCompareItems(compareItems.filter(p => p.id !== id));
  };

  const clearCompare = () => setCompareItems([]);

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);