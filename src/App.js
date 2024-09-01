import React, { useState, useEffect } from 'react';
import DataDisplay from './DataDisplay';
import Summary from './Summary';
import ExpenseTable from './ExpenseTable';
import Cookies from 'react-cookies';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
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

  const [user, setUser] = useState(Cookies.load('userEmail') || null);
  const [userData, setUserData] = useState(Cookies.load(`userData_${user}`) || guestData);

  useEffect(() => {
    if(user && user !== 'Guest') {
      updateUserByEmail(userData);
      updateLastAccessedDate(user);
    }
    Cookies.save(`userData_${user}`, userData, { path: '/' });
  }, [user]);

  const incomeKey = "income";
  const monthlyExpenseKey = "monthlyExpense";
  const addExpenseKey = "addExpense";

  async function fetchUserByEmail(email) {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${email}`); // Wait for the GET request to complete
      return response.data; // Return the fetched data
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If the user is not found (404 error), return null
        return null;
      } else {
        // Handle other errors
        console.error('Error fetching user:', error);
        throw error; // Re-throw error to be handled elsewhere
      }
    }
  }

  async function updateUserByEmail(data) {
    axios.put(`http://localhost:5000/api/users/${user}`, data)
      .then(response => {
        setUserData(response.data); // Update state with new user data
      })
      .catch(error => {
        console.error('Error updating user:', error);
      });
  };

  const createNewUser = (data) => {
    axios.post('http://localhost:5000/api/users', data)
      .catch(error => {
        console.error('Error adding user:', error);
      });
  }

  async function updateLastAccessedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    // If there is a need to move to history, move first
    if (userData["lastAccessedYear"] < year || userData["lastAccessedMonth"] < month) {
      await moveToHistory();
    }

    await setUserData(prevData => {
      const newData = { ...prevData };
      newData["lastAccessedYear"] = year;
      newData["lastAccessedMonth"] = month;

      Cookies.save(`userData_${user}`, newData, { path: '/' });
      if (newData['email'] !== 'Guest') updateUserByEmail(newData);

      return newData;
    });
  }

  async function handleGoogleLoginSuccess(credentialResponse) {
    const decoded = jwtDecode(credentialResponse.credential);
    const email = decoded.email;
    // Save the email in cookies
    Cookies.save('userEmail', email, { path: '/' });
    const result = await fetchUserByEmail(email);
    if(result) {
      await setUserData(result);
      Cookies.save(`userData_${email}`, userData, { path: '/' });
    }
    else {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const newData = { 
        email: email,
        income: 0,
        monthlyExpense: {},
        addExpense: {},
        lastAccessedYear: year,
        lastAccessedMonth: month,
        history: {}
      };
      createNewUser(newData);
      setUserData(newData);
    }
    Cookies.save(`userData_${email}`, userData, { path: '/' });
    setUser(email);
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

  const saveUserData = (key, value) => {
    const updatedData = { ...userData, [key]: value };
    setUserData(updatedData);
    // Save the user-specific data in cookies
    Cookies.save(`userData_${user}`, updatedData, { path: '/' });
    if (userData['email'] !== 'Guest') updateUserByEmail(updatedData);
  };

  const addToExpenseMap = (key, value, type) => {
    setUserData(prevData => {
      const newData = { ...prevData };
      if(type === 'Monthly') newData[monthlyExpenseKey][key] = value;
      else if(type === 'Additional') newData[addExpenseKey][key] = value;
      Cookies.save(`userData_${user}`, newData, { path: '/' });
      if (userData['email'] !== 'Guest') updateUserByEmail(newData);
      return newData;
    });
  };

  async function moveToHistory() {
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

      // Clear the current expense maps for the new month
      newData[addExpenseKey] = {};

      // Save to cookies
      Cookies.save(`userData_${user}`, newData, { path: '/' });

      updatedData = newData; // Store updated data for further use

      return newData;
    });

    // Ensure database update after setting state
    if (updatedData && updatedData['email'] !== 'Guest') {
      await updateUserByEmail(updatedData);
    }
  }

  const removeKey = (key, type) => {
    const newData = { ...userData };
    if(type === 'Monthly') delete newData[monthlyExpenseKey][key];
    else if(type === 'One-time') delete newData[addExpenseKey][key];
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
              <DataDisplay data={userData} updateData={saveUserData}  addToExpenseMap={addToExpenseMap} incomeKey={incomeKey}/>
              {userData[monthlyExpenseKey] !== null && userData[addExpenseKey] !== null && userData[monthlyExpenseKey] !== undefined && userData[addExpenseKey] !== undefined && userData[monthlyExpenseKey].size !== 0 && userData[addExpenseKey].size !== 0 && (
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