import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert, Accordion } from 'react-bootstrap';

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
        sum += parseFloat(value['value']);
      }
    }
    return sum;
  }

  // Return sum of additional expenses
  const sumOtherExpenses = () => {
    let sum = 0;
    if(data[addExpenseKey]){
      for (const [key, value] of Object.entries(data[addExpenseKey])){
        sum += parseFloat(value['value']);
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
      return 'success';
    } else if (netValue < 0) {
      return 'danger';
    } else {
      return 'secondary';
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
    updateData(incomeKey, parseFloat(incomeValue), activeKey)
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
      <Alert key='dark' variant='dark'>
        <h1>Summary</h1>
        <div className="mb-2" style={{paddingTop: '15px'}}>
          <Alert key='success' variant='success' className="mb-0 d-flex align-items-center p-3">
            <h4 className="mb-0" style={{width: '100%'}}>Monthly Budget: ${editingIncome ? (
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
            )}</h4>
          </Alert>
          

        </div>
        <Accordion className="mb-2">
          <Accordion.Item eventKey="0">
            <Accordion.Header className="alert-danger mb-0 d-flex align-items-center">
              <div style={{ width: '100%' }}>
                <h4 className="mb-0">Total Expenses: ${sumTotalExpenses().toFixed(2)}</h4>
              </div>
            </Accordion.Header>
            <Accordion.Body className="p-2">
              <div className="d-flex flex-column flex-sm-row gap-2">
                <div className="flex-fill">
                  <Alert variant="danger" className="mb-0 p-2">
                    <strong>Total Monthly Expenses:</strong> ${sumMonthlyExpenses().toFixed(2)}
                  </Alert>
                </div>
                <div className="flex-fill">
                  <Alert variant="danger" className="mb-0 p-2">
                    <strong>Total One-Time Expenses:</strong> ${sumOtherExpenses().toFixed(2)}
                  </Alert>
                </div>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <div className="mb-2">
          <Alert key='leftover' variant={`${getHeaderClass()}`} className="mb-0 d-flex align-items-center p-3">
            <h4 className="mb-0" style={{ width: '100%' }}>Leftover Money: ${calculateNetValue().toFixed(2)}</h4>
          </Alert>
        </div>
      </Alert>
      
      
    </div>
  );
};

export default Summary;