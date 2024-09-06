import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import DataDisplay from './DataDisplay';
import Summary from './Summary';
import ExpenseTable from './ExpenseTable';
import HistoryDropdown from './HistoryDropdown';
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

  const [user, setUser] = useState(Cookies.load('userEmail') || null);
  const [userData, setUserData] = useState(guestData);

  // Function to fetch user data by email
  const fetchUserByEmail = async (email) => {
    try {
      const response = await axios.get(`https://budgetapp-mocha.vercel.app/api/users/${email}`);
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
      const response = await axios.put(`https://budgetapp-mocha.vercel.app/api/users/${user}`, data);
      setUserData(response.data); // Update state with new user data
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Function to create a new user
  const createNewUser = async (data) => {
    try {
      await axios.post('https://budgetapp-mocha.vercel.app/api/users', data);
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
    } else {
      const date = new Date();
      const newData = {
        email: email,
        income: 0,
        monthlyExpense: {},
        addExpense: {},
        lastAccessedYear: date.getFullYear(),
        lastAccessedMonth: date.getMonth() + 1,
        history: {}
      };
      await createNewUser(newData);
      setUserData(newData);
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
    if (userData['email'] !== 'Guest') updateUserByEmail(updatedData);
  };

  const addToExpenseMap = (key, value, type) => {
    setUserData((prevData) => {
      const newData = { ...prevData };
      if (type === 'Monthly') newData[monthlyExpenseKey][key] = value;
      else if (type === 'Additional') newData[addExpenseKey][key] = value;
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
      <Container className="mt-4">
        {user ? (
          <>
            <Row className="mb-4">
              <Col>
                <h2>Welcome, {user}!</h2>
              </Col>
              <Col md={1} className="text-right">
                <Button variant="secondary" onClick={handleLogout} className="ml-2">Logout</Button>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Summary 
                  data={userData} 
                  updateData={saveUserData} 
                  incomeKey={incomeKey} 
                  monthlyExpenseKey={monthlyExpenseKey} 
                  addExpenseKey={addExpenseKey}
                />
              </Col>
            </Row>

            <Row>
              <Col>
                <DataDisplay 
                  data={userData} 
                  updateData={saveUserData} 
                  addToExpenseMap={addToExpenseMap} 
                  incomeKey={incomeKey}
                />
              </Col>
            </Row>

            {userData[monthlyExpenseKey] && userData[addExpenseKey] && (
              <Row className="mt-4">
                <Col>
                  <ExpenseTable
                    monthlyExpense={userData[monthlyExpenseKey]}
                    addExpense={userData[addExpenseKey]}
                    edit={addToExpenseMap}
                    remove={removeKey}
                  />
                </Col>
              </Row>
            )}

            <Row className="mt-4">
              <Col md={12}>
                <HistoryDropdown history={userData.history} />
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Row className="justify-content-center">
              <Col md={6} className="text-center">
                <h2>Login</h2>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                />
                <Button onClick={handleGuestSignIn} variant="secondary" className="mt-3">
                  Sign In Without Account
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </GoogleOAuthProvider>
  );
}

export default App;
