import React, { useState } from 'react';
import ExpenseTable from './ExpenseTable';
import 'bootstrap/dist/css/bootstrap.min.css';

const DataDisplay = ({ data, updateData, addToExpenseMap, removeKey, incomeKey, monthlyExpenseKey, addExpenseKey}) => {
  const [incomeValue, setIncomeValue] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');

  const updateIncome = () => {
    
    if (incomeValue !== '' && incomeValue !== undefined && !isNaN(incomeValue)) {
      updateData(incomeKey, incomeValue);
      setIncomeValue('');
    }
  };

  const handleIncomeValue = (e) => {
    const value = e.target.value
    if (value !== "" && !isNaN(value)) {
        setIncomeValue(parseInt(value));
    }
    else if (value === ""){
        setIncomeValue('');
    }
  };

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
    if (value !== "" && !isNaN(value)) {
        setExpenseValue(parseInt(value));
    }
    else if (value === ""){
        setExpenseValue('');
    }
  };

  const handleExpenseType = (event) => {
    setExpenseType(event.target.value);
  };

  const handleEditClick = (key, value) => {
    setEditingKey(key);
    setEditKey(key);
    setOriginalValue(JSON.stringify(value));
    setEditValue(JSON.stringify(value));
  };

  const handleSaveEdit = (key, value, type) => {
    if (key && value !== '') {
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        parsedValue = value;
      }
      addToExpenseMap(key, parsedValue, type);
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditKey('');
    setEditValue(originalValue);
  };

  const handleRemoveKey = (key, type) => {
    removeKey(key, type);
  };

  const renderTable = (map) => {
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(map).map((key) => (
            <tr key={key}>
              <td>
                  {key}
              </td>
              <td>
                {editingKey === key ? (
                  <input
                    type="text"
                    className="form-control"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                ) : (
                  typeof map[key] === 'object' && map[key] !== null ? renderTable(map[key]) : map[key]
                )}
              </td>
              <td>
                {editingKey === key ? (
                  <>
                    <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>Save</button>
                    <button className="btn btn-secondary btn-sm ms-2" onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => handleEditClick(key, map[key])}>Edit</button>
                    <button className="btn btn-danger btn-sm ms-2" onClick={() => handleRemoveKey(key)}>Remove</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  

  return (
    <div className="container mt-4">
      <h1>Data Display</h1>
      <textarea
        className='form-control mb-4'
        readOnly
        value={JSON.stringify(data, null, 2)}
        rows={10}
        cols={50}
      />

      <div className="row mb-3">
        Monthly Income:  &nbsp;
        <div className="col">
          <input
            type="text"
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
            type="text"
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