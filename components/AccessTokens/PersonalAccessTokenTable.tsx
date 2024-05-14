import React from 'react'
import { Button, Spinner } from 'flowbite-react'
import { PersonalAccessToken } from 'src/api/generated'

type PersonAccessTokenTableProps = {
    accessTokens: PersonalAccessToken[]
    handleCreateButtonClick: () => void
    deleteToken: (id: string) => void
    isLoading: boolean
}

const PersonalAccessTokenTable: React.FC<PersonAccessTokenTableProps> = ({ handleCreateButtonClick, accessTokens, isLoading, deleteToken }) => {
    return (
        <div className="mt-8">
            <h2 className="flex mb-2 text-xl font-semibold text-white">
                <svg
                    className="w-6 h-6 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
                    />
                </svg>
                API Keys
            </h2>
            {isLoading &&
                <Spinner color="blue" size="lg" />
            }

            {!isLoading && accessTokens.length > 0 && <div className="px-0 py-4 text-white w-80 ">
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
                            {accessTokens.map((
                                token, i
                            ) => {
                                return (
                                    <tr key={token.id}>
                                        <td className="px-4 py-3 text-left">{token.name}</td>
                                        <td className="px-4 py-3 text-left">{token.token}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="text-red-500 hover:text-red-700 " onClick={() => deleteToken(token.id as string)}>
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
                                    </tr>)
                            })}
                        </tbody>
                    </table>
                </div>
            </div>}
            <Button
                color="light"
                className="w-40 mt-6 bg-gray-900 text-gray-400 bg-transparent hover:!bg-transparent focus:!bg-blue focus:!border-none focus:!outline-none"
                onClick={handleCreateButtonClick}
            >
                <span className="text-white"> + Create new key</span>
            </Button>
        </div>
    )
}

export default PersonalAccessTokenTable
