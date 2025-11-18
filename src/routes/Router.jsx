import React from 'react'
import { routeComponents, DEFAULT_ROUTE } from './routes'

function Router({ currentRoute, user }) {
  // Get the component for the current route, fallback to default
  const Component = routeComponents[currentRoute] || routeComponents[DEFAULT_ROUTE]

  if (!Component) {
    return <div>Page not found</div>
  }

  return <Component user={user} />
}

export default Router

