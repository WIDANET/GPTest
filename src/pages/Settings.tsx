import { FormEvent, useMemo, useState } from "react";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationPermissionState,
  isNotificationSupported,
  loadNotificationSettings,
  requestNotificationPermission,
  saveNotificationSettings,
} from "../notifications";

export default function Settings(): JSX.Element {
  const [settings, setSettings] = useState(loadNotificationSettings);
  const [permission, setPermission] = useState(getNotificationPermissionState);
  const supported = useMemo(() => isNotificationSupported(), []);
  const [savedBanner, setSavedBanner] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveNotificationSettings(settings);
    setSavedBanner(true);

    window.setTimeout(() => {
      setSavedBanner(false);
    }, 2000);
  };

  const onEnableNotifications = async () => {
    const status = await requestNotificationPermission();
    setPermission(status);
  };

  if (!supported) {
    return (
      <section aria-labelledby="settings-heading">
        <h1 id="settings-heading">Settings</h1>
        <p>
          Notifications are not supported in this environment. You can still use the app
          offline and log doses manually.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="settings-heading">
      <h1 id="settings-heading">Settings</h1>

      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Medication reminders</legend>

          <label>
            <input
              checked={settings.enabled}
              onChange={(event) =>
                setSettings((previous) => ({ ...previous, enabled: event.target.checked }))
              }
              type="checkbox"
            />
            Enable reminders
          </label>

          <div>
            <button
              disabled={permission === "granted"}
              onClick={onEnableNotifications}
              type="button"
            >
              {permission === "granted"
                ? "Notifications enabled"
                : permission === "denied"
                ? "Notifications blocked"
                : "Allow notifications"}
            </button>
            <p>Current permission: {permission}</p>
          </div>

          <label>
            Lead window (minutes before dose)
            <input
              min={0}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  leadMinutes: Number(event.target.value),
                }))
              }
              type="number"
              value={settings.leadMinutes}
            />
          </label>

          <label>
            Lag window (minutes after dose)
            <input
              min={0}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  lagMinutes: Number(event.target.value),
                }))
              }
              type="number"
              value={settings.lagMinutes}
            />
          </label>

          <label>
            <input
              checked={settings.quietHours.enabled}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  quietHours: {
                    ...previous.quietHours,
                    enabled: event.target.checked,
                  },
                }))
              }
              type="checkbox"
            />
            Enable quiet hours
          </label>

          <label>
            Quiet hours start
            <input
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  quietHours: {
                    ...previous.quietHours,
                    start: event.target.value,
                  },
                }))
              }
              type="time"
              value={settings.quietHours.start}
            />
          </label>

          <label>
            Quiet hours end
            <input
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  quietHours: {
                    ...previous.quietHours,
                    end: event.target.value,
                  },
                }))
              }
              type="time"
              value={settings.quietHours.end}
            />
          </label>

          <label>
            Missed-dose alert delay (minutes)
            <input
              min={0}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  missedDoseDelayMinutes: Number(event.target.value),
                }))
              }
              type="number"
              value={settings.missedDoseDelayMinutes}
            />
          </label>
        </fieldset>

        <button type="submit">Save settings</button>
      </form>

      {savedBanner && <p role="status">Settings saved locally.</p>}

      <aside>
        <h2>Local scheduling strategy</h2>
        <p>
          Reminders are scheduled with browser timers for each medication schedule time. A
          missed-dose alert is scheduled for dose time + lag window + missed-dose delay and is
          cancelled if a matching log is recorded in the lead/lag window.
        </p>
      </aside>

      {!settings.enabled && (
        <p>
          Notification reminders are currently disabled. Enable reminders and grant permission
          to receive alerts.
        </p>
      )}

      {settings.enabled && permission !== "granted" && (
        <p>
          Reminders are enabled in settings, but the browser has not granted notification
          permission yet.
        </p>
      )}

      {settings.enabled && permission === "granted" && (
        <p>Reminders will continue working offline while this app data remains on-device.</p>
      )}

      <p>
        Default settings can be restored by clearing local app data. Current defaults: lead
        {" "}
        {DEFAULT_NOTIFICATION_SETTINGS.leadMinutes}
        m, lag {DEFAULT_NOTIFICATION_SETTINGS.lagMinutes}m, missed-dose delay
        {" "}
        {DEFAULT_NOTIFICATION_SETTINGS.missedDoseDelayMinutes}m.
      </p>
    </section>
  );
}
