import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Summary = ({data, updateData, incomeKey, monthlyExpenseKey, addExpenseKey, activeKey}) => {
  const [editingIncome, setEditingIncome] = useState(false);
  const [originalIncome, setOriginalIncome] = useState(0);
  const [incomeValue, setIncomeValue] = useState(data[incomeKey]);

  // Return sum of monthly and additional expenses
  const sumTotalExpenses = () => {
    return sumMonthlyExpenses() + sumOtherExpenses();
  }

  // Return sum of monthly expenses
  const sumMonthlyExpenses = () => {
    let sum = 0;
    if(data[monthlyExpenseKey]){
      for (const [key, value] of Object.entries(data[monthlyExpenseKey])){
        sum += parseFloat(value);
      }
    }
    return sum;
  }

  // Return sum of additional expenses
  const sumOtherExpenses = () => {
    let sum = 0;
    if(data[addExpenseKey]){
      for (const [key, value] of Object.entries(data[addExpenseKey])){
        sum += parseFloat(value);
      }
    }
    return sum;
  }

  // Return sum of monthly budget - total expenses
  const calculateNetValue = () => {
    return data[incomeKey] ? data[incomeKey] - sumTotalExpenses() : 0 - sumTotalExpenses();
  }

  // Determines styling of net value display text
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
    updateData(incomeKey, incomeValue, activeKey)
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
        <h2 class='text-success'>Monthly Budget: ${editingIncome ? (
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
            {data.income.toFixed(2)}
          </span>
        )}</h2>
        
      </div>
      <h2 class='text-danger'>Total Expenses: ${sumTotalExpenses().toFixed(2)}</h2>
      <h2 class='text-dark'>Monthly Expenses: ${sumMonthlyExpenses().toFixed(2)}</h2>
      <h2 class='text-dark'>Other Expenses: ${sumOtherExpenses().toFixed(2)}</h2>
      <div className="mb-2">
        <h2 class={`${getHeaderClass()}`} style={{ display: 'inline-block'}}>Leftover Cash: ${calculateNetValue().toFixed(2)}</h2>
      </div>
      
    </div>
  );
};

export default Summary;