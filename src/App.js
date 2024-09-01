import React, { useState, useEffect } from 'react';
import DataDisplay from './DataDisplay';
import Summary from './Summary';
import ExpenseTable from './ExpenseTable';
import Cookies from 'react-cookies';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

function App() {
  const guestData = {
    email: "Guest",
    income: 0,
    monthlyExpense: {},
    addExpense: {},
    lastAccessedYear: 0,
    lastAccessedMonth: 1,
    history: {}
  };

  const currentDate = new Date();

  const [user, setUser] = useState(Cookies.load('userEmail') || null);
  const [userData, setUserData] = useState(guestData);
  const [currentAccessedYear, setCurrentAccessedYear] = useState(currentDate.getFullYear());
  const [currentAccessedMonth, setCurrentAccessedMonth] = useState(currentDate.getMonth() + 1);

  // Function to fetch user data by email
  const fetchUserByEmail = async (email) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${email}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // User not found
      } else {
        console.error('Error fetching user:', error);
        throw error;
      }
    }
  };

  const incomeKey = "income";
  const monthlyExpenseKey = "monthlyExpense";
  const addExpenseKey = "addExpense";

  // Function to update user data by email
  const updateUserByEmail = async (data) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${user}`, data);
      setUserData(response.data); // Update state with new user data
      Cookies.save(`userData_${user}`, data, { path: '/' });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Function to create a new user
  const createNewUser = async (data) => {
    try {
      await axios.post('http://localhost:5000/api/users', data);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  // Function to update the last accessed date
  const updateLastAccessedDate = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const data = await fetchUserByEmail(user);

    if (data["lastAccessedYear"] < year || data["lastAccessedMonth"] < month) {
      await moveToHistory(); // Move to history if needed
    }

    setUserData((prevData) => {
      const newData = { ...prevData, lastAccessedYear: year, lastAccessedMonth: month };
      Cookies.save(`userData_${user}`, newData, { path: '/' });
      if (newData['email'] !== 'Guest') updateUserByEmail(newData);
      return newData;
    });
  };

  // Fetch user data when component mounts or user changes
  useEffect(() => {
    const initializeUserData = async () => {
      if (user && user !== 'Guest') {
        const data = await fetchUserByEmail(user);
        if (data) {
          setUserData(data);
          await updateLastAccessedDate(); // Update last accessed date on initial load
        } else {
          setUserData(guestData);
        }
      } else {
        setUserData(guestData);
      }
    };

    initializeUserData();
  }, [user]);

  // Handle Google login success
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const email = decoded.email;
    Cookies.save('userEmail', email, { path: '/' });
    setUser(email);

    const result = await fetchUserByEmail(email);
    if (result) {
      setUserData(result);
      Cookies.save(`userData_${email}`, result, { path: '/' });
    } else {
      const newData = {
        email: email,
        income: 0,
        monthlyExpense: {},
        addExpense: {},
        lastAccessedYear: currentAccessedYear,
        lastAccessedMonth: currentAccessedMonth,
        history: {}
      };
      await createNewUser(newData);
      setUserData(newData);
      Cookies.save(`userData_${email}`, newData, { path: '/' });
    }
  };

  const handleGuestSignIn = () => {
    Cookies.save('userEmail', "Guest", { path: '/' });
    setUser("Guest");
    setUserData(guestData);
  };

  const handleGoogleLoginError = () => {
    console.log('Login Failed');
  };

  const handleLogout = () => {
    Cookies.remove('userEmail', { path: '/' });
    setUser(null);
    setUserData(guestData);
  };

  // Function to save user data
  const saveUserData = (key, value) => {
    const updatedData = { ...userData, [key]: value };
    setUserData(updatedData);
    Cookies.save(`userData_${user}`, updatedData, { path: '/' });
    if (userData['email'] !== 'Guest') updateUserByEmail(updatedData);
  };

  const addToExpenseMap = (key, value, type) => {
    setUserData((prevData) => {
      const newData = { ...prevData };
      if (type === 'Monthly') newData[monthlyExpenseKey][key] = value;
      else if (type === 'Additional') newData[addExpenseKey][key] = value;
      Cookies.save(`userData_${user}`, newData, { path: '/' });
      if (userData['email'] !== 'Guest') updateUserByEmail(newData);
      return newData;
    });
  };

  // Function to move data to history
  const moveToHistory = async () => {
    let updatedData;

    setUserData((prevData) => {
      const newData = { ...prevData };
      const year = newData['lastAccessedYear'];
      const month = newData['lastAccessedMonth'];

      if (!newData['history'][year]) {
        newData['history'][year] = {};
      }

      if (!newData['history'][year][month]) {
        newData['history'][year][month] = {
          [monthlyExpenseKey]: { ...newData[monthlyExpenseKey] },
          [addExpenseKey]: { ...newData[addExpenseKey] }
        };
      }

      newData[addExpenseKey] = {};

      Cookies.save(`userData_${user}`, newData, { path: '/' });

      updatedData = newData;
      return newData;
    });

    if (updatedData && updatedData['email'] !== 'Guest') {
      await updateUserByEmail(updatedData);
    }
  };

  const removeKey = (key, type) => {
    const newData = { ...userData };
    if (type === 'Monthly') delete newData[monthlyExpenseKey][key];
    else if (type === 'One-time') delete newData[addExpenseKey][key];
    setUserData(newData);
    if (userData['email'] !== 'Guest') updateUserByEmail(newData);
  };

  return (
    <GoogleOAuthProvider clientId="229103202214-9up02q226v3kvboovpb5ibv6ebaieflt.apps.googleusercontent.com">
      <div className="App">
        {user ? (
          <>
            <h2>Welcome, {user}!</h2>
            <button className="btn btn-secondary mb-3" onClick={handleLogout}>Logout</button>
            <button className="btn btn-secondary mb-3" onClick={moveToHistory}>Move to History</button>
            <header className="App-header">
              <h1>Budget App</h1>
              <Summary data={userData} updateData={saveUserData} incomeKey={incomeKey} monthlyExpenseKey={monthlyExpenseKey} addExpenseKey={addExpenseKey}/>
              <DataDisplay data={userData} updateData={saveUserData} addToExpenseMap={addToExpenseMap} incomeKey={incomeKey}/>
              {userData[monthlyExpenseKey] && userData[addExpenseKey] && Object.keys(userData[monthlyExpenseKey]).length !== 0 && Object.keys(userData[addExpenseKey]).length !== 0 && (
                <div>
                  <ExpenseTable
                    monthlyExpense={userData[monthlyExpenseKey]}
                    addExpense={userData[addExpenseKey]}
                    edit={addToExpenseMap}
                    remove={removeKey}
                  />
                </div>
              )}
            </header>
          </>
        ) : (
          <>
            <h2>Login</h2>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
            <button onClick={handleGuestSignIn} className="btn btn-secondary">
              Sign In Without Account
            </button>
          </>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
