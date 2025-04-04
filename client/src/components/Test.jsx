import React, { useState } from 'react';
import { flaskURL } from '../config/backendURL';

const Test = () => {
    const [formData, setFormData] = useState({
        cf_handle1: '',
        cf_handle2: '',
        problem: ''
    });
    // const [trackingId, setTrackingId] = useState();
    // const [trackingStatus, setTrackingStatus] = useState(null);
    const [trackingList, setTrackingList] = useState([]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleStartTracking = async () => {
        try {
            const response = await fetch(`${flaskURL}/start_tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    handle1: formData.cf_handle1,
                    handle2: formData.cf_handle2,
                    problem_id: formData.problem
                })
            });
            const data = await response.json();
            console.log(data);
            // if (data.tracking_id) {
            //     setTrackingId(data.tracking_id);
            // }
        } catch (error) {
            console.error('Error starting tracking:', error);
        }
    };

    // const handleCheckStatus = async () => {
    //     try {
    //         const response = await fetch(`${flaskURL}/check_status/${trackingId}`);
    //         const data = await response.json();
    //         console.log(data);
    //         setTrackingStatus(data);
    //     } catch (error) {
    //         console.error('Error checking status:', error);
    //     }
    // };

    const handleListTracking = async () => {
        try {
            const response = await fetch(`${flaskURL}/list_tracking`);
            const data = await response.json();
            console.log(data);
            setTrackingList(Object.entries(data));
        } catch (error) {
            console.error('Error listing tracking:', error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="flex flex-col gap-4 bg-gray-800 p-8 rounded-lg shadow-lg w-296">
                <input
                    type="text"
                    name="cf_handle1"
                    value={formData.cf_handle1}
                    onChange={handleChange}
                    placeholder="Enter CF Handle 1"
                    className="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    name="cf_handle2"
                    value={formData.cf_handle2}
                    onChange={handleChange}
                    placeholder="Enter CF Handle 2"
                    className="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    name="problem"
                    value={formData.problem}
                    onChange={handleChange}
                    placeholder="Enter Problem ID"
                    className="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    onClick={handleStartTracking} 
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors"
                >
                    Start Tracking
                </button>
                {/* {trackingId && (
                    <div className="text-white">
                        Tracking ID: {trackingId}
                        <button 
                            onClick={handleCheckStatus} 
                            className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition-colors mt-2"
                        >
                            Check Status
                        </button>
                    </div>
                )} */}
                {/* {trackingStatus && (
                    <div className="text-white mt-4">
                        <h3>Status:</h3>
                        <pre>{JSON.stringify(trackingStatus, null, 2)}</pre>
                    </div>
                )} */}
                <button 
                    onClick={handleListTracking} 
                    className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600 transition-colors mt-4"
                >
                    List All Tracking
                </button>
                {trackingList.length > 0 && (
                    <div className="text-white mt-4 w-full">
                        <h3 className='font-bold mb-3'>Active Tracking:</h3>
                        <ul className='flex flex-col gap-2'>
                            {trackingList.map(([id, info]) => (
                                <li className='bg-gray-700 text-white py-2 px-4 rounded-s' key={id}>
                                    {id}: {JSON.stringify(info)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Test;