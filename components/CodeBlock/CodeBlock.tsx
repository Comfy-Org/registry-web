import { useState } from 'react'
import { IoIosInformationCircle } from 'react-icons/io'

const CopyableCodeBlock = ({ code }) => {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000) // Reset copied state after 2 seconds
        } catch (err) {
            // Clipboard copy failed
        }
    }

    return (
        <div className="relative p-4 bg-gray-800 text-white rounded-lg font-mono text-sm">
            <div className="flex items-center gap-1">
                <a
                    target="_blank"
                    href="https://docs.comfy.org/comfy-cli/getting-started#install-cli"
                    rel="noopener noreferrer"
                >
                    <IoIosInformationCircle
                        className="h-5 w-5"
                        title="Install Comfy CLI with: npm install -g comfy-cli"
                    />
                </a>
                <pre className="text-xs pr-[5em]">{code}</pre>
                <button
                    onClick={handleCopy}
                    className={`absolute top-4 right-4 text-xs py-1 px-2 rounded ${
                        isCopied ? 'bg-green-500' : 'bg-blue-500'
                    } hover:bg-blue-700 transition duration-300 ease`}
                >
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    )
}

export default CopyableCodeBlock
