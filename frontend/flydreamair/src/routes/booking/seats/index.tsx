import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/booking/seats/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    landing page for seat select!
    <p>Will require getting numPassangers and flightId from session data</p>
    <p>query GET /api/booking/seats?flight_id= for the array </p>
    <p>pass that array, and the number of passangers into a component built for the seat select...</p>
  </div>
}
