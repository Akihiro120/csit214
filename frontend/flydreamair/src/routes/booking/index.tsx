import { createFileRoute } from '@tanstack/react-router';
import { Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/booking/')({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = Navigate;
    return (
        <>
            <h1 className="text-4xl text-red-500">Ghost Page</h1>
            <div>Should this page redirect to the home page?</div>
            {navigate({ to: '/' })}
            n
        </>
    );
}
