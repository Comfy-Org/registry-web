import React, { useState } from 'react'

const NodeVDrawer = ({ version, isDrawerOpen, toggleDrawer }) => {
    console.log('---------', version)
    return (
        <>
            <div
                id="drawer-create-product-default"
                className={`fixed top-0 right-0 z-40 w-full max-w-xs h-screen p-4 overflow-y-auto transition-transform ${
                    isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                } bg-white dark:bg-gray-800`}
                aria-labelledby="drawer-label"
                aria-hidden={!isDrawerOpen}
            >
                <h5
                    id="drawer-label"
                    className="inline-flex items-center mb-6 text-sm font-semibold text-gray-500 uppercase"
                >
                    {version ? version.name : ''}
                </h5>
                <button
                    type="button"
                    onClick={toggleDrawer}
                    aria-controls="drawer-create-product-default"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                    <svg
                        aria-hidden="true"
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                    <span className="sr-only">Close menu</span>
                </button>
                <form action="#">
                    <div className="space-y-4">
                        {version && (
                            <div>
                                <p>Description: {version.description}</p>
                                <p>Created: {version.created}</p>
                                {/* Add more fields as needed */}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </>
    )
}

export default NodeVDrawer
