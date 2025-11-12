import { AppRoutes } from './router'
import { ErrorBoundary } from './components/error-boundary/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}

export default App
