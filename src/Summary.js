import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Summary = ({data, updateData, incomeKey, monthlyExpenseKey, addExpenseKey}) => {
  const [editingIncome, setEditingIncome] = useState(false);
  const [originalIncome, setOriginalIncome] = useState(0);
  const [incomeValue, setIncomeValue] = useState(data[incomeKey]);

  const sumTotalExpenses = () => {
    let sum = 0;
    if(data[monthlyExpenseKey]){
      for (const [key, value] of Object.entries(data[monthlyExpenseKey])){
        sum += parseInt(value);
      }
    }
    if(data[addExpenseKey]){
      for (const [key, value] of Object.entries(data[addExpenseKey])){
        sum += parseInt(value);
      }
    }
    return sum;
  }

  const sumMonthlyExpenses = () => {
    let sum = 0;
    if(data[monthlyExpenseKey]){
      for (const [key, value] of Object.entries(data[monthlyExpenseKey])){
        sum += parseInt(value);
      }
    }
    return sum;
  }

  const sumOtherExpenses = () => {
    let sum = 0;
    if(data[addExpenseKey]){
      for (const [key, value] of Object.entries(data[addExpenseKey])){
        sum += parseInt(value);
      }
    }
    return sum;
  }

  const calculateNetValue = () => {
    return data[incomeKey] ? data[incomeKey] - sumTotalExpenses() : 0 - sumTotalExpenses();
  }

  const getHeaderClass = () => {
    const netValue = calculateNetValue();
    if (netValue > 0) {
      return 'p-2 bg-success text-white rounded';
    } else if (netValue < 0) {
      return 'p-2 bg-danger text-white rounded';
    } else {
      return 'text-dark';
    }
  };

  const handleIncomeClick = () => {
    setEditingIncome(true);
    setOriginalIncome(data[incomeKey]);
  };

  const handleIncomeChange = (e) => {
    setIncomeValue(e.target.value);
  };

  const handleIncomeSave = () => {
    let parsedValue;
    try {
      parsedValue = parseFloat(incomeValue);
    } catch (e) {
      parsedValue = incomeValue;
    }
    updateData(incomeKey, incomeValue)
    setOriginalIncome(0);
    setEditingIncome(false);
  };

  const handleIncomeCancel = () => {
    setIncomeValue(originalIncome);
    setOriginalIncome(0);
    setEditingIncome(false);
  };

  

  return (
    <div className="container mt-4">
      <h1>Summary</h1>
      <div className="mb-2">
        <h2 class='text-success'>Monthly Income: ${editingIncome ? (
          <>
            <input
              type="number"
              className="form-control d-inline-block"
              value={incomeValue}
              onChange={handleIncomeChange}
              onBlur={handleIncomeSave}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleIncomeSave();
                }
              }}
            />
            <button className="btn btn-primary btn-sm ms-2" onClick={handleIncomeSave}>Save</button>
            <button className="btn btn-secondary btn-sm ms-2" onClick={handleIncomeCancel}>Cancel</button>
          </>
        ) : (
          <span
            onClick={handleIncomeClick}
          >
            {data.income}
          </span>
        )}</h2>
        
      </div>
      <h2 class='text-danger'>Total Expenses: ${sumTotalExpenses()}</h2>
      <h2 class='text-dark'>Monthly Expenses: ${sumMonthlyExpenses()}</h2>
      <h2 class='text-dark'>Other Expenses: ${sumOtherExpenses()}</h2>
      <div className="mb-2">
        <h2 class={`${getHeaderClass()}`} style={{ display: 'inline-block'}}>Leftover Cash: ${calculateNetValue()}</h2>
      </div>
      
    </div>
  );
};

export default Summary;