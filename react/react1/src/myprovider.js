import { createContext, useState } from "react";

export const FormDataContext = createContext(null);

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState(1);
  const prdv="iiiii"

  return (
    <FormDataContext.Provider value={{ formData, setFormData, prdv }}>
      {children}
    </FormDataContext.Provider>
  );
};
