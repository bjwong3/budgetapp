import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const DataDisplay = ({ data, updateData, activeKey, addToExpenseMap, incomeKey}) => {
  const [incomeValue, setIncomeValue] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [expenseType, setExpenseType] = useState('');

  // Update user data income
  const updateIncome = () => {
    if (incomeValue !== '' && incomeValue !== undefined && !isNaN(incomeValue)) {
      updateData(incomeKey, incomeValue, activeKey);
      setIncomeValue('');
    }
  };

  const handleIncomeValue = (e) => {
    const value = e.target.value
    const regex = /^\d+(\.\d{0,2})?$/;
    if (value !== "" && regex.test(value)) {
        setIncomeValue(parseFloat(value));
    }
    else if (value === ""){
        setIncomeValue('');
    }
  };

  // Add new expense to user data
  const addToExpense = () => {
    if (expenseName !== '' && expenseValue !== '' && expenseType !== '' && expenseValue !== undefined && !isNaN(expenseValue)) {
      addToExpenseMap(expenseName, expenseValue, expenseType, '', activeKey);
      setExpenseName('');
      setExpenseValue('');
      setExpenseType('');
    }
  };

  const handleExpenseValue = (e) => {
    const value = e.target.value
    const regex = /^\d+(\.\d{0,2})?$/;
    if (value !== "" && regex.test(value)) {
        setExpenseValue(parseFloat(value));
    }
    else if (value === ""){
        setExpenseValue('');
    }
  };

  const handleExpenseType = (event) => {
    setExpenseType(event.target.value);
  };

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        Monthly Budget:  &nbsp;
        <div className="col">
          <input
            type="number"
            className="form-control"
            placeholder="Value"
            value={incomeValue}
            onChange={handleIncomeValue}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={updateIncome}>Confirm</button>
        </div>
      </div>

      <div className="row mb-4">
        Monthly Expense:  &nbsp;
        <div className="col-12 col-md">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Name"
            value={expenseName}
            onChange={e => setExpenseName(e.target.value)}
          />
        </div>
        <div className="col-12 col-md">
          <input
            type="number"
            className="form-control mb-2"
            placeholder="Value"
            value={expenseValue}
            onChange={handleExpenseValue}
          />
        </div>
        <div className="col-12 col-md">
          <select
            className="form-select mb-2"
            placeholder="Type"
            value={expenseType}
            onChange={handleExpenseType}
          >
            <option value="" disabled>Select an expense type</option>
            <option value="Monthly">Monthly</option>
            <option value="One-time">One-time</option>
          </select>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={addToExpense}>Add to Expenses</button>
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;