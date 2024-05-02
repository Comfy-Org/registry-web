import React from 'react'

const Card = ({
    name,
    version,
    license,
    description,
    image,
    rating,
    downloads,
}) => {
    return (
        <div className="flex items-center rounded-lg shadow bg-gray-50 sm:flex dark:bg-gray-800 dark:border-gray-700 lg:p-4">
            <a href="#">
                <img
                    className="w-full rounded-3lg sm:rounded-lg"
                    src={image}
                    alt={`${name}'s Avatar`}
                />
            </a>

            <div className="flex flex-col p-4">
                <h6 className="mb-2 text-base font-bold tracking-tight text-gray-900 dark:text-white">
                    {name}
                </h6>

                <p className="mb-1 text-xs tracking-tight text-gray-500">
                    <span>Version: {version}</span>
                </p>

                <p className="mb-1 text-xs font-light text-gray-500 dark:text-gray-400 text-nowrap">
                    {description}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    License:{license}
                </span>
                <div className="flex items-center justify-center mt-2">
                    <div>
                        <svg
                            className="w-5 h-5 text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                        </svg>

                        <p className="text-xs font-bold text-gray-900 ms-2 dark:text-white">
                            {rating}
                        </p>
                    </div>
                    <div>
                        <svg
                            className="w-5 h-5 text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M13 11.15V4a1 1 0 1 0-2 0v7.15L8.78 8.374a1 1 0 1 0-1.56 1.25l4 5a1 1 0 0 0 1.56 0l4-5a1 1 0 1 0-1.56-1.25L13 11.15Z"
                                clip-rule="evenodd"
                            />
                            <path
                                fill-rule="evenodd"
                                d="M9.657 15.874 7.358 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.358l-2.3 2.874a3 3 0 0 1-4.685 0ZM17 16a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z"
                                clip-rule="evenodd"
                            />
                        </svg>

                        <p className="text-xs text-sm font-bold text-gray-900 dark:text-white">
                            {downloads}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const NodesCard = () => {
    const Nodes = [
        {
            name: 'TalkingFace',
            version: '4.0',
            license: 'AB12345',
            description: 'Node Publishing, Inc.',
            image: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png',
            rating: '4.8 ',
            downloads: '977k ',
        },
        {
            name: 'TalkingFace',
            version: '4.0',
            license: 'AB12345',
            description: 'Node Publishing, Inc.',
            image: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png',
            rating: '4.8 ',
            downloads: '977k ',
        },
        {
            name: 'TalkingFace',
            version: '4.0',
            license: 'AB12345',
            description: 'Node Publishing, Inc.',
            image: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png',
            rating: '4.8 ',
            downloads: '977k',
        },
        {
            name: 'TalkingFace',
            version: '4.0',
            license: 'AB12345',
            description: 'Node Publishing, Inc.',
            image: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png',
            rating: '4.8 ',
            downloads: '977k',
        },
        {
            name: 'TalkingFace',
            version: '4.0',
            license: 'AB12345',
            description: 'Node Publishing, Inc.',
            image: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png',
            rating: '4.8 ',
            downloads: '977k ',
        },
    ]

    return (
        <section className="h-full bg-gray-900 ">
            <div className="max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:px-6 ">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                    Node Registry
                </h1>
                <p className="mt-3 font-light text-gray-500 lg:mb-16 sm:text-xl dark:text-gray-400">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                </p>
                <div className="max-w-screen-sm mx-auto mb-8 lg:mb-16"></div>
                <div className="grid gap-4 mb-6 lg:mb-16 md:grid-cols-4">
                    {Nodes.map((member, index) => (
                        <Card key={index} {...member} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default NodesCard
