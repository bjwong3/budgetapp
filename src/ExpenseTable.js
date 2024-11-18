import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
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

const ExpenseTable = ({ type, userData, activeKey, edit, remove, updateUser }) => {
  const [expenses, setExpenses] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [showModal, setShowModal] = useState(false);  // Modal state

  useEffect(() => {
    const activeBudget = userData.budgets[activeKey] || {};
    if (type === "Monthly") {
      const monthly = Object.keys(activeBudget.monthlyExpense || {}).map((key) => ({
        key,
        value: activeBudget.monthlyExpense[key]?.value || 0,
        comment: activeBudget.monthlyExpense[key]?.comment || '',
      }));
      setExpenses(monthly);
    }
    
    if (type === "One-time") {
      const oneTime = Object.keys(activeBudget.addExpense || {}).map((key) => ({
        key,
        value: activeBudget.addExpense[key]?.value || 0,
        comment: activeBudget.addExpense[key]?.comment || '',
      }));
      setExpenses(oneTime);
    }
  }, [userData, activeKey]);

  const moveRow = (fromIndex, toIndex) => {
    const updatedExpenses = [...expenses];
    const [movedItem] = updatedExpenses.splice(fromIndex, 1);
    updatedExpenses.splice(toIndex, 0, movedItem);
    setExpenses(updatedExpenses);
    saveUpdatedOrder(updatedExpenses, type);
  };

  const handleEditClick = (index, key, value, comment) => {
    setEditRow(index);
    setEditKey(key);
    setEditValue(value);
    setEditComment(comment);
    setShowModal(true);  // Show modal
  };

  const handleSaveClick = () => {
    edit(editKey, parseFloat(editValue), type, editComment, activeKey);
    setShowModal(false);  // Hide modal
    setEditRow(null);
  };

  const handleRemoveClick = (index, type) => {
    remove(expenses[index].key, type, activeKey);
  };

  const saveUpdatedOrder = (updatedExpenses) => {
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
        <h3>{type} Expenses</h3>
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
            {expenses.map((item, index) => (
              <DraggableRow
                key={item.key}
                item={item}
                index={index}
                moveRow={(from, to) => moveRow(from, to)}
              >
                <td>{item.key}</td>
                <td>{item.value}</td>
                <td>{item.comment}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div className="d-flex justify-content-center">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditClick(index, item.key, item.value, item.comment)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() => handleRemoveClick(index, type)}
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

      {/* Modal for editing */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>Expense Name</label>
            <input
              type="text"
              className="form-control"
              value={editKey}
              disabled
            />
          </div>
          <div className="mt-3">
            <label>Amount</label>
            <input
              type="number"
              className="form-control"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          </div>
          <div className="mt-3">
            <label>Comment</label>
            <input
              type="text"
              className="form-control"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleSaveClick}>
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </DndProvider>
  );
};

export default ExpenseTable;
