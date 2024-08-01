import React, { useState } from 'react';
import DataDisplay from './DataDisplay';

const initialData = {
  income: 0,
  expense: []
};

function App() {
  const [data, setData] = useState(initialData);

  const addToArray = (key, value) => {
    setData(prevData => {
      const newData = { ...prevData };
      if (Array.isArray(newData[key])) {
        newData[key] = [...newData[key], value];
      } else {
        alert(`The value of "${key}" is not an array.`);
      }
      return newData;
    });
  };

  const updateData = (key, value) => {
    setData(prevData => ({
      ...prevData,
      [key]: value
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My App</h1>
        <DataDisplay data={data} updateData={updateData}  addToArray={addToArray}/>
      </header>
    </div>
  );
}

export default App;