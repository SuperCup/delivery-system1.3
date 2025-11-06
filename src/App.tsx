import { BasicLayout } from './layouts/basic-layout'
import { AppRoutes } from './router'
import { ErrorBoundary } from './components/error-boundary/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <BasicLayout>
        <AppRoutes />
      </BasicLayout>
    </ErrorBoundary>
  )
}

export default App
