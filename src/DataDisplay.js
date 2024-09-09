import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const DataDisplay = ({ data, updateData, addToExpenseMap, incomeKey}) => {
  const [incomeValue, setIncomeValue] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [expenseType, setExpenseType] = useState('');

  // Update user data income
  const updateIncome = () => {
    if (incomeValue !== '' && incomeValue !== undefined && !isNaN(incomeValue)) {
      updateData(incomeKey, incomeValue);
      setIncomeValue('');
    }
  };

  const handleIncomeValue = (e) => {
    const value = e.target.value
    if (value !== "") {
        setIncomeValue(parseFloat(value));
    }
    else if (value === ""){
        setIncomeValue('');
    }
  };

  // Add new expense to user data
  const addToExpense = () => {
    if (expenseName !== '' && expenseValue !== '' && expenseType !== '' && expenseValue !== undefined && !isNaN(expenseValue)) {
      addToExpenseMap(expenseName, expenseValue, expenseType);
      setExpenseName('');
      setExpenseValue('');
      setExpenseType('');
    }
  };

  const handleExpenseValue = (e) => {
    const value = e.target.value
    if (value !== "") {
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
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={expenseName}
            onChange={e => setExpenseName(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            type="number"
            className="form-control"
            placeholder="Value"
            value={expenseValue}
            onChange={handleExpenseValue}
          />
        </div>
        <div className="col">
          <select
            type="text"
            className="form-select"
            placeholder="Value"
            value={expenseType}
            onChange={handleExpenseType}
          >
            <option value="" disabled>Select an expense type</option>
            <option value="Monthly">Monthly</option>
            <option value="Additional">One-time</option>
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