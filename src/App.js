import React, { useState, useEffect } from 'react';
import DataDisplay from './DataDisplay';
import Summary from './Summary';
import ExpenseTable from './ExpenseTable';
import Cookies from 'react-cookies';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function App() {
  const initialData = {
    income: 0,
    monthlyExpense: {},
    addExpense: {}
  };

  const [user, setUser] = useState(Cookies.load('userEmail') || null);
  const [userData, setUserData] = useState(Cookies.load(`userData_${user}`) || initialData);

  useEffect(() => {
    fetchUserByEmail(user);
    Cookies.save(`userData_${user}`, userData, { path: '/' });
  });
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

  const updateUserByEmail = (data) => {
    axios.put(`http://localhost:5000/api/users/${user}`, data)
      .then(response => {
        setUserData(response.data); // Update state with new user data
        alert('User updated successfully');
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
  

  const handleGoogleLoginSuccess = async (credentialResponse) => {
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
      const newData = { 
        email: email,
        income: 0,
        monthlyExpense: {},
        addExpense: {} 
      };
      createNewUser(newData);
      setUserData(newData);
    }
    Cookies.save(`userData_${email}`, userData, { path: '/' });
    setUser(email);
  };

  const handleGoogleLoginError = () => {
    console.log('Login Failed');
  };

  const handleLogout = () => {
    Cookies.remove('userEmail', { path: '/' });
    setUser(null);
    setUserData(initialData);
  };    

  const saveUserData = (key, value) => {
    const updatedData = { ...userData, [key]: value };
    setUserData(updatedData);
    // Save the user-specific data in cookies
    Cookies.save(`userData_${user}`, updatedData, { path: '/' });
    updateUserByEmail(updatedData);
  };

  const addToExpenseMap = (key, value, type) => {
    setUserData(prevData => {
      const newData = { ...prevData };
      if(type === 'Monthly') newData[monthlyExpenseKey][key] = value;
      else if(type === 'Additional') newData[addExpenseKey][key] = value;
      Cookies.save(`userData_${user}`, newData, { path: '/' });
      updateUserByEmail(newData);
      return newData;
    });
  };

  const removeKey = (key, type) => {
    const newData = { ...userData };
    if(type === 'Monthly') delete newData[monthlyExpenseKey][key];
    else if(type === 'One-time') delete newData[addExpenseKey][key];
    setUserData(newData);
    updateUserByEmail(newData);
  };

  return (
    <GoogleOAuthProvider clientId="229103202214-9up02q226v3kvboovpb5ibv6ebaieflt.apps.googleusercontent.com">
      <div className="App">
        {user ? (
          <>
            <h2>Welcome, {user}!</h2>
            <button className="btn btn-secondary mb-3" onClick={handleLogout}>Logout</button>
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
          </>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;