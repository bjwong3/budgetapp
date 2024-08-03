import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const DataDisplay = ({ data, updateData, addToArray}) => {
  const [incomeValue, setIncomeValue] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [totalExpense, setTotalExpense] = useState(0);
  const incomeKey = "income";
  const expenseKey = "expense";

  const updateIncome = () => {
    
    if (incomeValue !== '' && incomeValue !== undefined && !isNaN(incomeValue)) {
      updateData(incomeKey, incomeValue);
      setIncomeValue('');
    }
  };

  const handleIncomeValue = (e) => {
    const value = e.target.value
    if (value != "" && !isNaN(value)) {
        setIncomeValue(parseInt(value));
    }
    else if (value == ""){
        setIncomeValue('');
    }
  };

  const addToExpense = () => {
    if (expenseValue !== '' && expenseValue !== undefined && !isNaN(expenseValue)) {
      addToArray(expenseKey, expenseValue);
      setExpenseValue('');
    }
  };

  const handleExpenseValue = (e) => {
    const value = e.target.value
    if (value != "" && !isNaN(value)) {
        setExpenseValue(parseInt(value));
    }
    else if (value == ""){
        setExpenseValue('');
    }
  };

  const renderTable = (array) => {
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {array.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const sumExpenses = () => {
    let sum = 0;
    data[expenseKey].forEach(element => {
      sum += parseInt(element);
    });
    return sum;
  }

  return (
    <div className="container mt-4">
      <h1>Data Display</h1>
      <textarea
        readOnly
        value={JSON.stringify(data, null, 2)}
        rows={10}
        cols={50}
      />
      <h2 class='text-success'>Monthly Income: {data[incomeKey]}</h2>
      <h2 class='text-danger'>Monthly Expenses: {sumExpenses()}</h2>
      

      <div>
        Monthly Income:  &nbsp;
        <input
          type="text"
          className="form-control"
          placeholder="Value"
          value={incomeValue}
          onChange={handleIncomeValue}
        />
        <button className="btn btn-primary" onClick={updateIncome}>Confirm</button>
      </div>

      <div>
        Monthly Expense:  &nbsp;
        <input
          type="text"
          className="form-control"
          placeholder="Value"
          value={expenseValue}
          onChange={handleExpenseValue}
        />
        <button className="btn btn-primary" onClick={addToExpense}>Add to Expenses</button>
      </div>

      {Array.isArray(data[expenseKey]) && (
        <div>
          <h2>List of Expenses</h2>
          {renderTable(data[expenseKey])}
        </div>
      )}
    </div>
  );
};

export default DataDisplay;