import React, { useState, createContext } from 'react';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({
    emplId: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    access_token: '',
    roles: [],
  }); // user 登入資訊

  return (
    <AppContext.Provider
      value={{
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
