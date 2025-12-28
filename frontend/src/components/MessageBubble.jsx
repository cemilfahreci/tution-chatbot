import React from 'react';

export default function MessageBubble({ message, onPayClick }) {
    const { role, content, messageType, metadata, timestamp } = message;

    return (
        <div className={`message ${role}`}>
            <div className="message-avatar">
                {role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-wrapper">
                <div className="message-content">
                    {content}
                </div>

                {/* Tuition Card */}
                {messageType === 'tuition_card' && metadata && (
                    <TuitionCard data={metadata} onPayClick={onPayClick} />
                )}

                {/* Payment Success */}
                {messageType === 'payment_success' && (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        Payment successful.
                    </div>
                )}

                {/* Address List */}
                {messageType === 'address_list' && metadata && (
                    <AddressList addresses={metadata} />
                )}
                {/* Unpaid List */}
                {messageType === 'unpaid_list' && metadata && (
                    <UnpaidList students={metadata} onPayClick={onPayClick} />
                )}
            </div>
        </div>
    );
}

function TuitionCard({ data, onPayClick }) {
    // Handle the TuitionPaymentSystemApi response format
    // Response: { student_no, name, tuitions: [{ term, tuition_total, paid_amount, balance, status }] }

    if (!data) return null;

    // Extract student info
    const studentNo = data.student_no || data.studentNo || data.studentNumber;
    const studentName = data.name || data.studentName;

    // Get tuition details from nested tuitions array or from flat structure
    const tuitionDetails = data.tuitions?.[0] || data;
    const term = tuitionDetails.term || 'N/A';
    const totalAmount = tuitionDetails.tuition_total || tuitionDetails.amount || tuitionDetails.amountDue || 0;
    const paidAmount = tuitionDetails.paid_amount || 0;
    const balance = tuitionDetails.balance ?? totalAmount;
    const status = tuitionDetails.status || (balance === 0 ? 'Paid' : 'Unpaid');
    const isUnpaid = status !== 'Paid' && balance > 0;

    return (
        <div className="tuition-card">
            <h3>Tuition</h3>
            <div className="tuition-info">
                {studentName && (
                    <div className="tuition-row">
                        <span className="label">Name:</span>
                        <span className="value">{studentName}</span>
                    </div>
                )}
                <div className="tuition-row">
                    <span className="label">Student Number:</span>
                    <span className="value">{studentNo}</span>
                </div>
                <div className="tuition-row">
                    <span className="label">Term:</span>
                    <span className="value">{term}</span>
                </div>
                <div className="tuition-row amount">
                    <span className="label">Total Amount:</span>
                    <span className="value">${totalAmount.toLocaleString()}</span>
                </div>
                <div className="tuition-row">
                    <span className="label">Paid:</span>
                    <span className="value">${paidAmount.toLocaleString()}</span>
                </div>
                <div className="tuition-row">
                    <span className="label">Balance:</span>
                    <span className="value" style={{ color: balance > 0 ? '#ef4444' : '#22c55e' }}>
                        ${balance.toLocaleString()}
                    </span>
                </div>
                <div className="tuition-row">
                    <span className="label">Status:</span>
                    <span className="value" style={{
                        color: status === 'Paid' ? '#22c55e' : '#ef4444',
                        fontWeight: 600
                    }}>
                        {status === 'Paid' ? '✓ Paid' : '⚠ Unpaid'}
                    </span>
                </div>
            </div>

            {/* Pay Now Button */}
            {isUnpaid && (
                <button
                    className="pay-button"
                    onClick={() => onPayClick && onPayClick({ studentNo, balance, term })}
                >
                    💳 Pay Now (${balance.toLocaleString()})
                </button>
            )}
        </div>
    );
}

function AddressList({ addresses }) {
    if (!addresses || addresses.length === 0) {
        return <div className="address-card">No addresses found.</div>;
    }

    return (
        <div>
            {addresses.slice(0, 3).map((addr, index) => (
                <div key={index} className="address-card">
                    <div className="name">{addr.name}</div>
                    <div className="details">
                        {addr.city && <span>{addr.city}</span>}
                        {addr.email && <span> • {addr.email}</span>}
                        {addr.phone && <span> • {addr.phone}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}

function UnpaidList({ students, onPayClick }) {
    if (!students || students.length === 0) {
        return <div className="message-content">No unpaid tuitions found.</div>;
    }

    return (
        <div className="unpaid-list-container">
            <table className="unpaid-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Term</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => {
                        const studentNo = student.student_no || student.studentNo;
                        const balance = student.balance || student.amount;
                        const term = student.term;

                        return (
                            <tr key={index}>
                                <td>{studentNo}</td>
                                <td>{term}</td>
                                <td className="amount">${balance?.toLocaleString()}</td>
                                <td>
                                    <button
                                        className="mini-pay-button"
                                        onClick={() => onPayClick && onPayClick({ studentNo, balance, term })}
                                    >
                                        Pay
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
