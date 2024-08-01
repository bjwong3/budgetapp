import React, { useState } from 'react';

const DataDisplay = ({ data, updateData, addToArray}) => {
  const [editKey, setEditKey] = useState('');
  const [incomeValue, setIncomeValue] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const incomeKey = "income";
  const expenseKey = "expense";

  const updateIncome = () => {
    
    if (incomeValue !== undefined && !isNaN(incomeValue)) {
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
    if (expenseValue !== undefined && !isNaN(expenseValue)) {
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

  return (
    <div>
      <h1>Data Display</h1>
      <textarea
        readOnly
        value={JSON.stringify(data, null, 2)}
        rows={10}
        cols={50}
      />

      <div>
        Monthly Income:  &nbsp;
        <input
          type="text"
          placeholder="Value"
          value={incomeValue}
          onChange={handleIncomeValue}
        />
        <button onClick={updateIncome}>Confirm</button>
      </div>

      <div>
        Monthly Expense:  &nbsp;
        <input
          type="text"
          placeholder="Value"
          value={expenseValue}
          onChange={handleExpenseValue}
        />
        <button onClick={addToExpense}>Add to Expenses</button>
      </div>
    </div>
  );
};

export default DataDisplay;