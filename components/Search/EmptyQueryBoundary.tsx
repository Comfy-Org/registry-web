import * as React from 'react'
import { useInstantSearch } from 'react-instantsearch'

const EmptyQueryBoundary = ({ children, fallback }) => {
    const { indexUiState } = useInstantSearch()

    if (!indexUiState.query || indexUiState.query.length <= 1) {
        return (
            <>
                {fallback}
                <div hidden>{children}</div>
            </>
        )
    }

    return children
}

export default EmptyQueryBoundary
