import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { FaClock, FaInfoCircle, FaSync } from 'react-icons/fa';
import axiosInstance from '../utils/axiosInstance';
import './UserQueueRestriction.css';

const UserQueueRestriction = ({ onRestrictionCheck, queueId }) => {
  const [restriction, setRestriction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { id: userId } = useSelector((state) => state.auth);

  // Parents usually pass an inline callback; keep the latest one in a ref so it does not
  // retrigger the fetch/interval effect on every parent render.
  const onRestrictionCheckRef = useRef(onRestrictionCheck);
  useEffect(() => {
    onRestrictionCheckRef.current = onRestrictionCheck;
  }, [onRestrictionCheck]);

  const checkRestriction = useCallback(async () => {
    if (!userId) return;
    const onRestrictionCheck = onRestrictionCheckRef.current;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/queues/user/${userId}/restriction`);
      const fetchedRestriction = response.data;
      setRestriction(fetchedRestriction);
      if (onRestrictionCheck) {
        onRestrictionCheck(fetchedRestriction);
      }
    } catch (err) {
      setError('Failed to check queue restrictions');
      console.error('Restriction check error:', err);
      // Pass a false value to the parent component on error
      if (onRestrictionCheck) {
        onRestrictionCheck({ canJoinQueue: false });
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkRestriction();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(checkRestriction, 30000);
    return () => clearInterval(interval);
    // queueId: re-check when the user navigates to another queue
  }, [checkRestriction, queueId]);

  if (!userId) return null;

  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">Checking queue restrictions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className="my-3">
        <FaInfoCircle className="me-2" />
        {error}
        <Button variant="outline-warning" size="sm" className="ms-2" onClick={checkRestriction}>
          <FaSync /> Retry
        </Button>
      </Alert>
    );
  }

  if (!restriction) return null;

  if (!restriction.canJoinQueue) {
    let timeMessage = null;
    if (restriction.canJoinAfter) {
        try {
            const canJoinAfter = new Date(restriction.canJoinAfter).toLocaleString();
            timeMessage = (
                <small className="text-muted">
                    You can join another queue after: {canJoinAfter}
                </small>
            );
        } catch {
            console.error("Invalid date format for canJoinAfter", restriction.canJoinAfter);
        }
    }

    return (   <div className="user-queue-restriction">
        <Alert variant="danger" className="my-3">
            <FaInfoCircle className="me-2" />
            <strong>Queue Join Restricted</strong>
            <p className="mb-1">{restriction.restrictionReason}</p>
            {timeMessage}
            <Button variant="outline-danger" size="sm" className="ms-2 mt-2" onClick={checkRestriction}>
                <FaSync /> Check Again
            </Button>
        </Alert>
        </div>
    );
}

};

export default UserQueueRestriction;