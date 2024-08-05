import React, { useState } from 'react';
import DataDisplay from './DataDisplay';
import Summary from './Summary';

const initialData = {
  income: 0,
  expense: {}
};

function App() {
  const [data, setData] = useState(initialData);

  const incomeKey = "income";
  const expenseKey = "expense";

  const addToExpenseMap = (key, value) => {
    setData(prevData => {
      const newData = { ...prevData };
      newData[expenseKey][key] = value;
      return newData;
    });
  };

  const updateData = (key, value) => {
    setData(prevData => ({
      ...prevData,
      [key]: value
    }));
  };

  const removeKey = (key) => {
    const newData = { ...data };
    delete newData[expenseKey][key];
    setData(newData);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Budget App</h1>
        <Summary data={data} updateData={updateData} incomeKey={incomeKey} expenseKey={expenseKey}/>
        <DataDisplay data={data} updateData={updateData}  addToExpenseMap={addToExpenseMap} removeKey={removeKey} incomeKey={incomeKey} expenseKey={expenseKey}/>
      </header>
    </div>
  );
}

export default App;