import * as React from 'react'
import { Highlight, Snippet } from 'react-instantsearch'

function Hit({ hit }) {
    return (
        <article className="hit">
            <h1 className="text-white font-bold text-md">
                <Highlight attribute="name" hit={hit} />
            </h1>
            <h1>
                <Snippet hit={hit} attribute="name" />
            </h1>
            <h1 className="font-light text-gray-500 dark:text-gray-400 text-sm">
                {hit.description}
            </h1>
        </article>
    )
}

export default Hit
