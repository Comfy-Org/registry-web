import React from 'react'

const GeneratedPublisherKey = () => {
    return (
        <div className="px-0 py-4 text-white w-80 ">
            <div className="flex items-center mb-4">
                <h1 className="text-xl font-semibold">API keys</h1>
                <svg
                    className="w-6 h-6 ml-2 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                </svg>
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
                <table className="w-full">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-sm font-semibold text-left text-gray-400 uppercase">
                                Name
                            </th>
                            <th className="px-4 py-3 text-sm font-semibold text-left text-gray-400 uppercase">
                                Secret Key
                            </th>
                            <th className="px-4 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-600">
                        <tr>
                            <td className="px-4 py-3 text-left">Test key</td>
                            <td className="px-4 py-3 text-left">sk...iHYg</td>
                            <td className="px-4 py-3 text-right">
                                <button className="text-red-500 hover:text-red-700">
                                    <svg
                                        className="w-6 h-6 text-red-500"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                                        />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default GeneratedPublisherKey
