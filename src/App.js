import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Tab, Tabs, Modal, Form } from 'react-bootstrap';
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
    budgets: 
    [
      {
        eventKey: 0,
        title: 'Home',
        income: 0,
        monthlyExpense: {},
        addExpense: {}
      }
    ],
    lastAccessedYear: 0,
    lastAccessedMonth: 1
  };

  const [user, setUser] = useState(Cookies.load('userEmail') || null);
  const [userData, setUserData] = useState(guestData);
  const [extraTabs, setTabs] = useState(guestData['budgets']);
  const [activeKey, setActiveKey] = useState(0);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [newBudgetName, setNewBudgetName] = useState(''); // New budget name state
  const [updates, setUpdates] = useState(0); // Modal visibility state

  const incomeKey = "income";
  const monthlyExpenseKey = "monthlyExpense";
  const addExpenseKey = "addExpense";

  // Function to fetch user data by email
  const fetchUserByEmail = async (email) => {
    try {
      const response = await axios.get(`https://budgetapp-server.vercel.app/api/users/${email}`);
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

  // Function to fetch history data by email
  const fetchHistoryByEmail = async () => {
    try {
      const response = await axios.get(`https://budgetapp-server.vercel.app/api/history/${user}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // History not found
      } else {
        console.error('Error fetching history:', error);
        throw error;
      }
    }
  };

  // Function to update user data by email
  const updateUserByEmail = async (data) => {
    try {
      const response = await axios.put(`https://budgetapp-server.vercel.app/api/users/${user}`, data);
      setUserData(response.data); // Update state with new user data
      setTabs(response.data['budgets']);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Function to update history data by email
  const updateHistoryByEmail = async (data) => {
    try {
      const response = await axios.put(`https://budgetapp-server.vercel.app/api/history/${user}`, data);
    } catch (error) {
      console.error('Error updating history:', error);
    }
  };

  // Function to create a new user
  const createNewUser = async (data) => {
    try {
      await axios.post(`https://budgetapp-server.vercel.app/api/users`, data);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  // Function to create a new history
  const createNewHistory = async (data) => {
    try {
      await axios.post(`https://budgetapp-server.vercel.app/api/history`, data);
    } catch (error) {
      console.error('Error adding history:', error);
    }
  };

  const addNewTab = () => {
    setShowModal(true); // Open the modal when "Add Budget" is clicked
  };

  const handleAddBudget = () => {
    if (!newBudgetName) return; // Prevent adding if no name is entered

    const newTabKey = extraTabs.length; // Generate a unique key for the new tab
    const newTab = {
      eventKey: newTabKey,
      title: newBudgetName || `New Budget ${newTabKey}`, // Use the new budget name entered by the user
      income: 0,
      monthlyExpense: {},
      addExpense: {}
    };

    const newData = { ...userData };
    newData['budgets'].push(newTab);
    setUserData(newData);
    setTabs([...extraTabs, newTab]); // Add the new tab to the list of tabs
    setActiveKey(newTabKey); // Automatically switch to the newly added tab
    setNewBudgetName(''); // Reset the budget name field
    setShowModal(false); // Close the modal
    if (userData['email'] !== 'Guest') updateUserByEmail(newData);
  };

  // Function to remove a budget
  const handleRemoveBudget = (eventKey) => {
    const newData = { ...userData };
    newData['budgets'] = newData['budgets'].filter(tab => tab.eventKey !== eventKey);

    setUserData(newData);
    setTabs(newData['budgets']);

    // Set active tab to the first remaining tab or default to 0
    if (newData['budgets'].length > 0) {
      setActiveKey(newData['budgets'][0].eventKey);
    } else {
      setActiveKey(0);
    }

    if (userData['email'] !== 'Guest') updateUserByEmail(newData);
  };

  // Function to update the last accessed date
  const updateLastAccessedDate = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    // Fetch user data first
    const data = await fetchUserByEmail(user);
  
    // Only move to history if the last accessed year/month is different
    if (data.lastAccessedYear < year || data.lastAccessedMonth < month) {
      // Await the completion of moveToHistory
      await moveToHistory(); 
    }
  
    // Update the last accessed date after history movement is done
    setUserData((prevData) => {
      const newData = { ...prevData, lastAccessedYear: year, lastAccessedMonth: month };
      
      // Update user data in the database after history movement
      if (newData.email !== 'Guest') updateUserByEmail(newData);
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
          setTabs(data['budgets']);
          await updateLastAccessedDate(); // Update last accessed date on initial load
        } else {
          setUserData(guestData);
          setTabs(guestData['budgets']);
        }
      } else {
        setUserData(guestData);
        setTabs(guestData['budgets']);
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
      setTabs(result['budgets']);
    } else {
      const date = new Date();
      const newData = {
        email: email,
        budgets: 
        [
          {
            eventKey: 0,
            title: 'Home',
            income: 0,
            monthlyExpense: {},
            addExpense: {}
          }
        ],
        lastAccessedYear: date.getFullYear(),
        lastAccessedMonth: date.getMonth() + 1,
      };
      const newHistory = {
        email: email,
        history: {}
      };
      await createNewUser(newData);
      await createNewHistory(newHistory);
      setUserData(newData);
      setTabs(newData['budgets']);
    }
  };

  const handleGuestSignIn = () => {
    Cookies.save('userEmail', "Guest", { path: '/' });
    setUser("Guest");
    setUserData(guestData);
    setTabs(guestData['budgets']);
  };

  const handleGoogleLoginError = () => {
    console.log('Login Failed');
  };

  const handleLogout = () => {
    Cookies.remove('userEmail', { path: '/' });
    setUser(null);
    setUserData(guestData);
    setTabs(guestData['budgets']);
  };

  // Function to save user data
  const saveUserData = (key, value, budget) => {
    const newData = { ...userData };
    newData['budgets'][budget][key] = value;
    setUserData(newData);
    setTabs(newData['budgets']);
    if (userData['email'] !== 'Guest') updateUserByEmail(newData);
  };

  const addToExpenseMap = async (key, value, type, comment, budget) => {
    setUserData((prevData) => {
      const newData = { ...prevData };
      if (type === 'Monthly') {
        if(newData['budgets'][budget][monthlyExpenseKey] === undefined) {
          newData['budgets'][budget][monthlyExpenseKey] = {};
        }
        if(newData['budgets'][budget][addExpenseKey][key] === undefined) {
          newData['budgets'][budget][monthlyExpenseKey][key] = {value: 0, comment: ''};
        }
        newData['budgets'][budget][monthlyExpenseKey][key]['value'] = value;
        newData['budgets'][budget][monthlyExpenseKey][key]['comment'] = comment;
      }
      else if (type === 'One-time') {
        if(newData['budgets'][budget][addExpenseKey] === undefined) {
          newData['budgets'][budget][addExpenseKey] = {};
        }
        if(newData['budgets'][budget][addExpenseKey][key] === undefined) {
          newData['budgets'][budget][addExpenseKey][key] = {value: 0, comment: ''};
        }
        newData['budgets'][budget][addExpenseKey][key]['value'] = value;
        newData['budgets'][budget][addExpenseKey][key]['comment'] = comment;
      } 
      setTabs(newData['budgets']);
      if (userData['email'] !== 'Guest') updateUserByEmail(newData);
      return newData;
    });
  };

  // Function to move data to history
  const moveToHistory = async () => {
    // Fetch current history data
    let historyData = await fetchHistoryByEmail(user);
  
    // Update the userData and prepare the data to be moved to history
    const updatedData = await new Promise((resolve) => {
      setUserData((prevData) => {
        const newData = { ...prevData };
        const year = newData.lastAccessedYear;
        const month = newData.lastAccessedMonth;
  
        // Prepare history object if not present for the given year and month
        if (!historyData.history[year]) {
          historyData.history[year] = {};
        }
        if (!historyData.history[year][month]) {
          historyData.history[year][month] = {
            [monthlyExpenseKey]: {},
            [addExpenseKey]: {}
          };
        }
  
        // Move monthly and one-time expenses into history
        newData.budgets.forEach((budget) => {
          if (newData.budgets[budget.eventKey][monthlyExpenseKey]) {
            Object.keys(newData.budgets[budget.eventKey][monthlyExpenseKey]).forEach((key) => {
              historyData.history[year][month][monthlyExpenseKey][key] =
                newData.budgets[budget.eventKey][monthlyExpenseKey][key].value;
            });
          }
          if (newData.budgets[budget.eventKey][addExpenseKey]) {
            Object.keys(newData.budgets[budget.eventKey][addExpenseKey]).forEach((key) => {
              historyData.history[year][month][addExpenseKey][key] =
                newData.budgets[budget.eventKey][addExpenseKey][key].value;
            });
          }
        });
  
        // Clear the one-time expenses for the current budget
        newData.budgets.forEach((budget) => {
          newData.budgets[budget.eventKey][addExpenseKey] = {};
        });
  
        resolve(newData);
        return newData;
      });
    });
  
    // Update the history in the database after updating userData
    if (updatedData.email !== 'Guest') {
      await updateHistoryByEmail(historyData);
    }
  };

  // Remove expense from user data
  const removeKey = (key, type, budget) => {
    const newData = { ...userData };
    if (type === 'Monthly') delete newData['budgets'][budget][monthlyExpenseKey][key];
    else if (type === 'One-time') delete newData['budgets'][budget][addExpenseKey][key];
    setUserData(newData);
    setTabs(newData['budgets']);
    if (userData['email'] !== 'Guest') updateUserByEmail(newData);
  };

  return (
    <GoogleOAuthProvider clientId="229103202214-9up02q226v3kvboovpb5ibv6ebaieflt.apps.googleusercontent.com">
      <Container className="mt-4">
        {user ? (
          <>
            <Row className="mb-4 justify-content-between">
              <Col>
                <h2>Welcome, {user}!</h2>
              </Col>
              <Col md={1} className="text-right">
                <Button variant="secondary" onClick={handleLogout} className="ml-2">Logout</Button>
              </Col>
            </Row>
            <Tabs
              activeKey={activeKey}
              onSelect={(k) => {
                if (k === 'add-new-tab') {
                  addNewTab(); // Call function to add a new tab
                } else {
                  setActiveKey(k); // Switch to the selected tab if it's not the add-new-tab
                }
              }}
              className="mb-3"
            >

              {extraTabs.map((tab) => (
                <Tab eventKey={tab.eventKey} title={tab.title} key={tab.eventKey}>

                  <Row>
                    <Col md={11}>
                      <Summary 
                        data={tab} 
                        updateData={saveUserData} 
                        incomeKey={incomeKey} 
                        monthlyExpenseKey={monthlyExpenseKey} 
                        addExpenseKey={addExpenseKey}
                        activeKey={activeKey}
                      />
                    </Col>
                    <Col>
                      {tab.eventKey !== 0 ? (
                        <>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBudget(tab.eventKey);
                            }}
                          >
                            Remove Budget
                          </Button>
                      </>) : (<></>)}
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <DataDisplay 
                        data={tab} 
                        updateData={saveUserData} 
                        addToExpenseMap={addToExpenseMap} 
                        incomeKey={incomeKey}
                        activeKey={activeKey}
                      />
                    </Col>
                  </Row>

                  <Row className="mt-4">
                    <Col>
                      <ExpenseTable
                        monthlyExpense={tab[monthlyExpenseKey]}
                        addExpense={tab[addExpenseKey]}
                        activeKey={activeKey}
                        edit={addToExpenseMap}
                        remove={removeKey}
                      />
                    </Col>
                  </Row>
                </Tab>
              ))}

              {/* Add New Tab as a tab that acts like a button */}
              <Tab
                eventKey="add-new-tab"
                title={<span style={{ color: 'white' }}>+ Add Budget</span>}
                tabClassName="bg-primary text-white"
              />
            </Tabs>

            <Row className="mt-4">
              <Col md={12}>
                <HistoryDropdown getHistory={fetchHistoryByEmail} />
              </Col>
            </Row>

            {/* Modal for adding new budget */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Add New Budget</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group controlId="formBudgetName">
                    <Form.Label>Budget Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter budget name"
                      value={newBudgetName}
                      onChange={(e) => setNewBudgetName(e.target.value)}
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddBudget}>
                  Add Budget
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        ) : (
          <>
            <Row className="justify-content-center">
              <Col md={6} className="text-center">
                <h2>Login</h2>
                <div className="d-flex justify-content-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                  />
                </div>
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
