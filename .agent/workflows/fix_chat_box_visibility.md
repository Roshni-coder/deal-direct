---
description: Fix Chat Box Visibility Logic
---

# Fix Chat Box Visibility Logic

## Problem
The chat box (widget and button) was not updating immediately after login or logout. Users had to refresh the page to see the correct state. This was because `ChatContext` only checked for the authentication token in `localStorage` once when the component mounted, and did not react to subsequent auth changes.

## Solution
Modified `ChatContext.jsx` to:
1.  Introduce a `token` state variable initialized from `localStorage`.
2.  Add an event listener for the custom `auth-change` event (dispatched by `Login`, `Register`, and `Navbar` components) and the standard `storage` event.
3.  Update the `token` state when these events occur.
4.  Make all side effects (socket connection, data fetching) dependent on the `token` state, so they re-run whenever the auth state changes.

## Validation
- **Login**: `auth-change` event updates `token` state -> socket connects -> chat button appears.
- **Logout**: `auth-change` event updates `token` state (to null) -> socket disconnects -> chat button disappears.
- **Cross-tab**: `storage` event handles auth changes in other tabs.

## Files Modified
- `client/src/context/ChatContext.jsx`
