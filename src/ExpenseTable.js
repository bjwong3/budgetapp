import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = {
  ROW: 'row',
};

const DraggableRow = ({ item, index, moveRow, children }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: ItemType.ROW,
    hover(draggedItem) {
      if (draggedItem.index !== index) {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType.ROW,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      style={{
        opacity: isDragging ? 0.7 : 1,
        backgroundColor: isDragging ? '#f8f9fa' : 'transparent',
        cursor: 'move',
      }}
    >
      {/* Drag handle cell */}
      <td
        style={{
          width: '30px',
          textAlign: 'center',
          verticalAlign: 'middle',
        }}
      >
        <div ref={drag} style={{ cursor: 'grab' }}>
          <span style={{ fontSize: '1.5em', lineHeight: '1' }}>☰</span>
        </div>
      </td>
      {children}
    </tr>
  );
};

const ExpenseTable = ({ userData, activeKey, edit, remove, updateUser }) => {
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [oneTimeExpenses, setOneTimeExpenses] = useState([]);

  useEffect(() => {
    const activeBudget = userData.budgets[activeKey] || {};
    const monthly = Object.keys(activeBudget.monthlyExpense || {}).map((key) => ({
      key,
      value: activeBudget.monthlyExpense[key]?.value || 0,
      comment: activeBudget.monthlyExpense[key]?.comment || '',
    }));
    const oneTime = Object.keys(activeBudget.addExpense || {}).map((key) => ({
      key,
      value: activeBudget.addExpense[key]?.value || 0,
      comment: activeBudget.addExpense[key]?.comment || '',
    }));
    setMonthlyExpenses(monthly);
    setOneTimeExpenses(oneTime);
  }, [userData, activeKey]);

  const moveRow = (fromIndex, toIndex, setExpenses, expenses, type) => {
    const updatedExpenses = [...expenses];
    const [movedItem] = updatedExpenses.splice(fromIndex, 1);
    updatedExpenses.splice(toIndex, 0, movedItem);
    setExpenses(updatedExpenses);
    saveUpdatedOrder(updatedExpenses, type);
  };

  const saveUpdatedOrder = (updatedExpenses, type) => {
    const activeBudget = userData.budgets[activeKey];
    const updatedUserData = { ...userData };

    if (type === 'Monthly') {
      const monthlyExpense = updatedExpenses.reduce((acc, item) => {
        acc[item.key] = { value: item.value, comment: item.comment };
        return acc;
      }, {});
      updatedUserData.budgets[activeKey] = {
        ...activeBudget,
        monthlyExpense,
      };
    } else if (type === 'One-time') {
      const addExpense = updatedExpenses.reduce((acc, item) => {
        acc[item.key] = { value: item.value, comment: item.comment };
        return acc;
      }, {});
      updatedUserData.budgets[activeKey] = {
        ...activeBudget,
        addExpense,
      };
    }

    updateUser(updatedUserData);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="table-responsive">
        {/* Monthly Expenses Table */}
        <h3>Monthly Expenses</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th></th> {/* Placeholder for drag handle */}
              <th>Name</th>
              <th>Amount</th>
              <th>Comment</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {monthlyExpenses.map((item, index) => (
              <DraggableRow
                key={item.key}
                item={item}
                index={index}
                moveRow={(from, to) =>
                  moveRow(from, to, setMonthlyExpenses, monthlyExpenses, 'Monthly')
                }
              >
                <td>{item.key}</td>
                <td>{item.value}</td>
                <td>{item.comment}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div className="d-flex justify-content-center">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => edit(item.key, item.value, 'Monthly', item.comment, activeKey)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() => remove(item.key, 'Monthly', activeKey)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </DraggableRow>
            ))}
          </tbody>
        </table>

        {/* One-Time Expenses Table */}
        <h3>One-Time Expenses</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th></th> {/* Placeholder for drag handle */}
              <th>Name</th>
              <th>Amount</th>
              <th>Comment</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {oneTimeExpenses.map((item, index) => (
              <DraggableRow
                key={item.key}
                item={item}
                index={index}
                moveRow={(from, to) =>
                  moveRow(from, to, setOneTimeExpenses, oneTimeExpenses, 'One-time')
                }
              >
                <td>{item.key}</td>
                <td>{item.value}</td>
                <td>{item.comment}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div className="d-flex justify-content-center">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => edit(item.key, item.value, 'One-time', item.comment, activeKey)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() => remove(item.key, 'One-time', activeKey)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </DraggableRow>
            ))}
          </tbody>
        </table>
      </div>
    </DndProvider>
  );
};

export default ExpenseTable;
