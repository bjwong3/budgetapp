import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ExpenseTable = ({ monthlyExpense, addExpense, edit, remove }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editRow, setEditRow] = useState(null);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');

  if(!monthlyExpense) monthlyExpense = {};
  if(!addExpense) addExpense = {};
  const mergedData = [
    ...Object.keys(monthlyExpense).map(key => ({ key, value: monthlyExpense[key], type: 'Monthly' })),
    ...Object.keys(addExpense).map(key => ({ key, value: addExpense[key], type: 'One-time' })),
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (sortConfig.key) {
      return [...mergedData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return mergedData;
  }, [mergedData, sortConfig]);

  const handleEditClick = (index, key, value) => {
    setEditRow(index);
    setEditKey(key);
    setEditValue(value);
  };

  const handleSaveClick = (index, type) => {
    edit(sortedData[index].key, editValue, type);
    setEditRow(null);
  };

  const handleRemoveClick = (index, type) => {
    remove(sortedData[index].key, type)
  };

  return (
    <div className="container mt-4" style={{ maxHeight: "400px", overflow: "hidden", position: "relative" }}>
      <h2>List of Expenses</h2>
      <table className="table table-striped" style={{ width: "100%", tableLayout: "fixed", borderCollapse: "separate" }}>
        <thead style={{ display: "table", width: "100%", tableLayout: "fixed" }}>
          <tr>
            <th onClick={() => handleSort('key')} style={{ cursor: 'pointer' }}>
              Name {sortConfig.key === 'key' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('value')} style={{ cursor: 'pointer', }}>
              Amount {sortConfig.key === 'value' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
              Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
      </table>
      <div style={{ maxHeight: "300px", overflowY: "scroll" }}>
        <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "separate" }}>
          <tbody style={{ display: "block" }}>
              {sortedData.map((item, index) => (
                <tr key={index} style={{ display: "table", width: "100%", tableLayout: "fixed" }}>
                  <td style={{borderBottom: "1px solid #ddd", padding: "5px"}}>
                    {item.key}
                  </td>
                  <td style={{borderBottom: "1px solid #ddd", padding: "5px"}}>
                    {editRow === index ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
                    ) : (
                      typeof item.value === 'object' && item.value !== null ? JSON.stringify(item.value) : item.value
                    )}
                  </td>
                  <td style={{borderBottom: "1px solid #ddd", padding: "5px"}}>{item.type}</td>
                  <td style={{borderBottom: "1px solid #ddd", padding: "5px"}}>
                    {editRow === index ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleSaveClick(index, item.type)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm ms-2"
                          onClick={() => setEditRow(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditClick(index, item.key, item.value)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() => handleRemoveClick(index, item.type)}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;