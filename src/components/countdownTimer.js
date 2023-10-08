import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { cilReload } from '@coreui/icons';
function CountdownTimer({ RefreshQRCode }) {
    const [remainingTime, setRemainingTime] = useState(30);  // 5 minutes in seconds

    useEffect(() => {
        if (remainingTime <= 0) {
            RefreshQRCode();
            setRemainingTime(30);
        }
        const intervalId = setInterval(() => {
            setRemainingTime(time => time - 1);
        }, 1000);

        return () => clearInterval(intervalId);  // Cleanup on component unmount
    }, [remainingTime, RefreshQRCode]);

    const minutes = String(Math.floor(remainingTime / 60)).padStart(2, '0');
    const seconds = String(remainingTime % 60).padStart(2, '0');
    const handleRefresh = () => {
        RefreshQRCode();
        // Logic to refresh or restart the countdown or any other desired action
        setRemainingTime(30);  // Resetting to 30 seconds for demonstration
    };
    return (
        <div>
            剩餘時間 : {minutes}:{seconds}
            <>{' '}</>
            <button onClick={handleRefresh}>
                <CIcon icon={cilReload} />
            </button>
        </div>
    );
}

export default CountdownTimer;
