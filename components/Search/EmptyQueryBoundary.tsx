import * as React from 'react'
import { useInstantSearch } from 'react-instantsearch'

type EmptyQueryBoundaryProps = {
  children: React.ReactNode
  fallback: React.ReactNode
}

const EmptyQueryBoundary: React.FC<EmptyQueryBoundaryProps> = ({
  children,
  fallback,
}) => {
  const { indexUiState } = useInstantSearch()

  // Render the fallback if the query is empty or too short
  if (!indexUiState.query || indexUiState.query.length <= 1) {
    return (
      <>
        {fallback}
        <div hidden>{children}</div>
      </>
    )
  }

  // Render children if the query is valid
  return <>{children}</>
}

export default EmptyQueryBoundary
