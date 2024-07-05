import * as React from 'react'
import { Highlight } from 'react-instantsearch'

function Hit({ hit }) {
    return (
        <article>
            <h1>
                <Highlight attribute="name" hit={hit} />
            </h1>
            <h1>{hit.description}</h1>
        </article>
    )
}

export default Hit
