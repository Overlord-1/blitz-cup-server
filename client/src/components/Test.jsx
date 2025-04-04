import React, { useState } from 'react';
import { flaskURL } from '../config/backendURL';

const Test = () => {
    const [formData, setFormData] = useState({
        cf_handle1: '',
        cf_handle2: '',
        problem: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleClick = async () => {
        try {
            const response = await fetch(`${flaskURL}/check_problem_solution`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="flex flex-col gap-4 bg-gray-800 p-8 rounded-lg shadow-lg w-96">
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
                    onClick={handleClick} 
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors"
                >
                    Check Submissions
                </button>
            </div>
        </div>
    );
}

export default Test