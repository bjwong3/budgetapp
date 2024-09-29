import React, { useState } from 'react';
import { Accordion, Card, Form, Row, Col, Table } from 'react-bootstrap';
import { FaCalendarAlt, FaListAlt } from 'react-icons/fa'; // Icons for better UI

function HistoryDropdown({ getHistory }) {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [history, setHistory] = useState({});

  const fetchHistory = async() => {
    if(Object.keys(history).length === 0){
      console.log('Retrieving history data...');
      const newData = await getHistory();
      await setHistory(newData['history']);
    }
  };


  // Helper function to convert month number to month name
  const getMonthName = (monthNumber) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNumber - 1];
  };

  // Extract years from history object
  const years = Object.keys(history).sort((a, b) => b - a);

  // Extract months for the selected year
  const months = selectedYear ? Object.keys(history[selectedYear]).sort((a, b) => b - a) : [];

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    setSelectedMonth(null); // Reset month selection when year changes
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Helper function to render expense table and calculate totals
  const renderExpenseTable = (expenses) => {
    const totalExpenses = Object.values(expenses).reduce((acc, curr) => acc + curr, 0); // Calculate total expenses
    return (
      <>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(expenses).map((key) => (
              <tr key={key}>
                <td>{key}</td>
                <td>${expenses[key].toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-weight-bold">
              <td style={{color: "blue"}}>Total</td>
              <td style={{color: "blue"}}>${totalExpenses.toFixed(2)}</td> {/* Display total amount */}
            </tr>
          </tbody>
        </Table>
      </>
    );
  };

  return (
    <Accordion className="mb-4">
      <Accordion.Item eventKey="0">
        <Accordion.Header onClick={fetchHistory}>
          <h4>View Historical Data</h4>
        </Accordion.Header>
        <Accordion.Body>
          <Form>
            <Row>
              <Col>
                <Form.Group controlId="yearDropdown">
                  <Form.Label>Select Year</Form.Label>
                  <Form.Control as="select" onChange={handleYearChange} value={selectedYear || ''}>
                    <option value="" disabled>Select a year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              {selectedYear && (
                <Col>
                  <Form.Group controlId="monthDropdown">
                    <Form.Label>Select Month</Form.Label>
                    <Form.Control as="select" onChange={handleMonthChange} value={selectedMonth || ''}>
                      <option value="" disabled>Select a month</option>
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)} {/* Convert month number to name */}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Form>

          {selectedYear && selectedMonth && (
            <div className="mt-4">
              <h5>
                <FaCalendarAlt className="mr-2" /> History for {selectedYear} - {getMonthName(selectedMonth)}
              </h5>

              <Card className="p-3 mt-3">
                <h6>
                  <FaListAlt className="mr-2" /> Monthly Expenses:
                </h6>
                {renderExpenseTable(history[selectedYear][selectedMonth].monthlyExpense)}
              </Card>

              <Card className="p-3 mt-3">
                <h6>
                  <FaListAlt className="mr-2" /> Additional Expenses:
                </h6>
                {renderExpenseTable(history[selectedYear][selectedMonth].addExpense)}
              </Card>
            </div>
          )}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default HistoryDropdown;
