import { useLocation } from "react-router-dom";
import { Alert } from ".";

// This component is used to display alerts passed through the location state object.
// Alerts are passed through the location state object when redirecting to a page,
// for example: <Link to="/settings" state={{ success: "Settings updated!" }}>Settings</Link>
// or: navigate("/settings", { state: { success: "Settings updated!" } });
// The alert is then displayed in the Settings page using this component.
export const StateAlerts = () => {
  const location = useLocation();
  const state = location.state;

  return (
    <div>
      {state && state.success && (
        <Alert severity="success" className="w-full mb-2">
          {state.success}
        </Alert>
      )}
      {state && state.error && (
        <Alert severity="error" className="w-full mb-2">
          {state.error}
        </Alert>
      )}
    </div>
  );
};
