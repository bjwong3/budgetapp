import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ExpenseTable = ({ monthlyExpense, addExpense, activeKey, edit, remove }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editRow, setEditRow] = useState(null);
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState(0);
  const [editComment, setEditComment] = useState('');

  if(!monthlyExpense) monthlyExpense = {};
  if(!addExpense) addExpense = {};
  const mergedData = [
    ...Object.keys(monthlyExpense).map(key => ({ key, value: monthlyExpense[key]['value'], type: 'Monthly', comment: monthlyExpense[key]['comment']})),
    ...Object.keys(addExpense).map(key => ({ key, value: addExpense[key]['value'], type: 'One-time', comment: addExpense[key]['comment']})),
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

  const handleEditClick = (index, key, value, comment) => {
    setEditRow(index);
    setEditKey(key);
    setEditValue(value);
    setEditComment(comment);
  };

  const handleSaveClick = (index, type) => {
    edit(sortedData[index].key, parseFloat(editValue), type, editComment, activeKey);
    setEditRow(null);
  };

  const handleRemoveClick = (index, type) => {
    remove(sortedData[index].key, type, activeKey)
  };

  return (
    <div className="container mt-4">
      <h2>List of Expenses</h2>

      {/* Responsive table container */}
      <div className="table-responsive">
        <table className="table table-striped" style={{ tableLayout: 'auto', wordWrap: 'break-word' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('key')} style={{ cursor: 'pointer' }}>
                Name {sortConfig.key === 'key' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('value')} style={{ cursor: 'pointer' }}>
                Amount {sortConfig.key === 'value' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th>Comment</th>
              <th className="d-flex justify-content-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={index}>
                <td>{item.key}</td>
                <td>
                  {editRow === index ? (
                    <input
                      type="number"
                      className="form-control"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    typeof item.value === 'object' && item.value !== null ? parseFloat(item.value) : item.value
                  )}
                </td>
                <td>{item.type}</td>
                <td>
                  {editRow === index ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                    />
                  ) : (
                    typeof item.comment === 'object' && item.comment !== null ? JSON.stringify(item.comment) : item.comment
                  )}
                </td>
                <td>
                  <div className="d-flex justify-content-center">
                    {editRow === index ? (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleSaveClick(index, item.type)}>
                          Save
                        </button>
                        <button className="btn btn-secondary btn-sm ms-2" onClick={() => setEditRow(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => handleEditClick(index, item.key, item.value, item.comment)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm ms-2" onClick={() => handleRemoveClick(index, item.type)}>
                          Remove
                        </button>
                      </>
                    )}
                  </div>
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