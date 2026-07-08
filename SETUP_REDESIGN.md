# Setup Redesign

1. Copy the new theme and dashboard files into the client source tree.
2. Update the dashboard route to render the new component.
3. Import the global stylesheet from the app entrypoint.
4. Run the client and review the redesigned dashboard at /dashboard.

## Files added
- client/src/styles/theme.js
- client/src/styles/globals.css
- client/src/pages/manager/DashboardV2.jsx

## Notes
- The new dashboard keeps the same API usage as the original view.
- The experience supports a built-in light/dark toggle and responsive chart layouts.
