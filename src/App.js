import React, { useState } from 'react';
import DataDisplay from './DataDisplay';
import Summary from './Summary';
import ExpenseTable from './ExpenseTable';

const initialData = {
  income: 0,
  monthlyExpense: {},
  addExpense: {}
};

function App() {
  const [data, setData] = useState(initialData);

  const incomeKey = "income";
  const monthlyExpenseKey = "monthlyExpense";
  const addExpenseKey = "addExpense";

  const addToExpenseMap = (key, value, type) => {
    setData(prevData => {
      const newData = { ...prevData };
      if(type === 'Monthly') newData[monthlyExpenseKey][key] = value;
      else if(type === 'Additional') newData[addExpenseKey][key] = value;
      return newData;
    });
  };

  const updateData = (key, value) => {
    setData(prevData => ({
      ...prevData,
      [key]: value
    }));
  };

  const removeKey = (key, type) => {
    const newData = { ...data };
    if(type === 'Monthly') delete newData[monthlyExpenseKey][key];
    else if(type === 'Additional') delete newData[addExpenseKey][key];
    setData(newData);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Budget App</h1>
        <Summary data={data} updateData={updateData} incomeKey={incomeKey} monthlyExpenseKey={monthlyExpenseKey} addExpenseKey={addExpenseKey}/>
        <DataDisplay data={data} updateData={updateData}  addToExpenseMap={addToExpenseMap} incomeKey={incomeKey}/>
        {data[monthlyExpenseKey].size !== 0 && data[addExpenseKey].size !== 0 && (
        <div>
          <ExpenseTable
            monthlyExpense={data[monthlyExpenseKey]}
            addExpense={data[addExpenseKey]}
            edit={addToExpenseMap}
            remove={removeKey}
          />
        </div>
      )}
      </header>
    </div>
  );
}

export default App;